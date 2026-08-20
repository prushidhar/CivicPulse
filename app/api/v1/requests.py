from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.requests import CitizenRequestCreate, CitizenRequestResponse, CitizenRequestDetail
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
        location=location_wkt,
        status="pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    process_citizen_request.delay(str(new_request.request_id))
    
    return CitizenRequestResponse(
        request_id=new_request.request_id,
        status="processing",
        received_at=new_request.created_at
    )

@router.get("", response_model=List[CitizenRequestDetail])
def list_requests(db: Session = Depends(get_db)):
    reqs = db.query(CitizenRequest).order_by(CitizenRequest.created_at.desc()).limit(50).all()
    for r in reqs:
        r.location = None
    return reqs

@router.get("/{request_id}", response_model=CitizenRequestDetail)
def get_request(request_id: str, db: Session = Depends(get_db)):
    db_req = db.query(CitizenRequest).filter(CitizenRequest.request_id == request_id).first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    db_req.location = None
    return db_req

