from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.requests import CitizenRequestCreate, CitizenRequestResponse, CitizenRequestDetail, CitizenRequestStatusUpdate
from app.models.models import CitizenRequest
from app.workers.request_tasks import process_citizen_request
from typing import List

router = APIRouter()

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
    
    # Run Gemini AI pipeline synchronously
    try:
        from app.services.pipeline_service import RequestPipeline
        pipeline = RequestPipeline(db)
        pipeline.run_full_pipeline(str(new_request.request_id))
    except Exception as e:
        print(f"Pipeline error: {e}")
    
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


@router.get("", response_model=List[CitizenRequestDetail])
def list_requests(db: Session = Depends(get_db)):
    reqs = db.query(CitizenRequest).order_by(CitizenRequest.created_at.desc()).limit(100).all()
    for r in reqs:
        if r.location is not None:
            try:
                r.longitude = db.scalar(r.location.ST_X())
                r.latitude = db.scalar(r.location.ST_Y())
            except Exception as e:
                pass
        r.location = None
        setattr(r, "description", r.original_text)
        if not r.category:
            r.category = "Processing..."
        if not r.severity:
            r.severity = "Pending"
    return reqs

@router.get("/{request_id}", response_model=CitizenRequestDetail)
def get_request(request_id: str, db: Session = Depends(get_db)):
    db_req = db.query(CitizenRequest).filter(CitizenRequest.request_id == request_id).first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if db_req.location is not None:
        try:
            db_req.longitude = db.scalar(db_req.location.ST_X())
            db_req.latitude = db.scalar(db_req.location.ST_Y())
        except:
            pass
    db_req.location = None
    setattr(db_req, "description", db_req.original_text)
    
    # If the background pipeline never ran, run it on-demand now
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
            setattr(db_req, "description", f"ERROR: {e}\n\n{err_msg}")
        
    return db_req


@router.patch('/{request_id}/status', response_model=CitizenRequestDetail)
def update_request_status(request_id: str, update: CitizenRequestStatusUpdate, db: Session = Depends(get_db)):
    db_req = db.query(CitizenRequest).filter(CitizenRequest.request_id == request_id).first()
    if not db_req:
        raise HTTPException(status_code=404, detail='Request not found')
    db_req.status = update.status
    db.commit()
    db.refresh(db_req)
    db_req.location = None
    setattr(db_req, 'description', db_req.original_text)
    if not db_req.category:
        db_req.category = 'Processing...'
    if not db_req.severity:
        db_req.severity = 'Pending'
    return db_req
