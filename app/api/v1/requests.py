from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.requests import CitizenRequestCreate, CitizenRequestResponse, CitizenRequestDetail, CitizenRequestStatusUpdate
from app.models.models import CitizenRequest
from typing import List

router = APIRouter()

def run_pipeline_background(request_id: str):
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        from app.services.pipeline_service import RequestPipeline
        pipeline = RequestPipeline(db)
        pipeline.run_full_pipeline(request_id)
    except Exception as e:
        print(f"Pipeline error in background: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

@router.post("", response_model=CitizenRequestResponse, status_code=202)
def create_request(
    request: CitizenRequestCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    location_wkt = None
    if request.longitude is not None and request.latitude is not None:
        location_wkt = f"SRID=4326;POINT({request.longitude} {request.latitude})"

    new_request = CitizenRequest(
        original_text=request.text,
        country_code=request.country_code,
        source_channel=request.source_channel,
        language=request.language,
        consent_status=request.consent,
        citizen_name=request.citizen_name,
        citizen_phone=request.citizen_phone,
        location=location_wkt,
        severity=request.urgency,
        category=request.category,
        status="pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    # Run Gemini AI pipeline in background (GCP VM supports true background tasks)
    background_tasks.add_task(run_pipeline_background, str(new_request.request_id))
    
    return CitizenRequestResponse(
        request_id=new_request.request_id,
        status="processing",
        received_at=new_request.created_at
    )


@router.post("/{request_id}/transcribe")
async def transcribe_audio(request_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Transcribe audio using Gemini multimodal and update the request text."""
    db_req = db.query(CitizenRequest).filter(CitizenRequest.request_id == request_id).first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    try:
        audio_bytes = await file.read()
        mime_type = file.content_type or "audio/webm"
        
        from app.ai.classification.gemini_adapter import transcribe_audio_with_gemini
        transcription = transcribe_audio_with_gemini(audio_bytes, mime_type)
        
        if transcription:
            db_req.transcript = transcription
            if not db_req.original_text:
                db_req.original_text = transcription
            db.commit()
            return {"transcription": transcription, "request_id": request_id}
        else:
            raise HTTPException(status_code=422, detail="Could not transcribe audio")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


def _prepare_request_for_response(r, db):
    """Prepare a CitizenRequest ORM object for API response without mutating the DB session."""
    from app.models.models import RequestMedia
    
    # Extract lat/lng from PostGIS geometry WITHOUT setting location=None on the ORM object
    if r.location is not None:
        try:
            from geoalchemy2.shape import to_shape
            sh = to_shape(r.location)
            r.longitude = sh.x
            r.latitude = sh.y
        except Exception:
            pass
    
    # Use db.expunge() to detach from session so we can safely set location=None
    # without it being flushed back to the database
    db.expunge(r)
    r.location = None
    
    setattr(r, "description", r.original_text)
    if not r.category:
        r.category = "Processing..."
    if not r.severity:
        r.severity = "Pending"
        
    media_records = db.query(RequestMedia).filter(RequestMedia.request_id == r.request_id).all()
    r.media = [{"url": f"/api/v1/requests/download/{str(m.media_id)}", "type": m.media_type} for m in media_records]
    return r


@router.get("", response_model=List[CitizenRequestDetail])
def list_requests(db: Session = Depends(get_db)):
    reqs = db.query(CitizenRequest).order_by(CitizenRequest.created_at.desc()).limit(100).all()
    result = []
    for r in reqs:
        prepared = _prepare_request_for_response(r, db)
        result.append(prepared)
    return result

@router.get("/{request_id}", response_model=CitizenRequestDetail)
def get_request(request_id: str, db: Session = Depends(get_db)):
    db_req = db.query(CitizenRequest).filter(CitizenRequest.request_id == request_id).first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # If the background pipeline never ran, run it on-demand now BEFORE expunging
    if not db_req.category:
        try:
            from app.services.pipeline_service import RequestPipeline
            pipeline = RequestPipeline(db)
            pipeline.run_full_pipeline(str(db_req.request_id))
            db.refresh(db_req)
        except Exception as e:
            import traceback
            err_msg = traceback.format_exc()
            print(f"Pipeline error on demand: {e}")
            db_req.category = "Processing..."
            db_req.severity = "Pending"
    
    return _prepare_request_for_response(db_req, db)


@router.patch('/{request_id}/status', response_model=CitizenRequestDetail)
def update_request_status(request_id: str, update: CitizenRequestStatusUpdate, db: Session = Depends(get_db)):
    db_req = db.query(CitizenRequest).filter(CitizenRequest.request_id == request_id).first()
    if not db_req:
        raise HTTPException(status_code=404, detail='Request not found')
    db_req.status = update.status
    db.commit()
    db.refresh(db_req)
    
    return _prepare_request_for_response(db_req, db)
