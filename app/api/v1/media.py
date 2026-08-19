from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import CitizenRequest, RequestMedia
from app.ai.asr.whisper_adapter import ASRProvider
import uuid
import os

router = APIRouter()
asr_provider = ASRProvider()

@router.post("/{request_id}/media")
async def upload_media(
    request_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    req = db.query(CitizenRequest).filter(CitizenRequest.request_id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    # Generate unique key
    ext = file.filename.split('.')[-1]
    object_key = f"{request_id}/{uuid.uuid4()}.{ext}"
    
    # Normally we upload to MinIO here
    # For now we save locally in a temp dir to run ASR
    os.makedirs("/tmp/civicpulse_media", exist_ok=True)
    local_path = f"/tmp/civicpulse_media/{uuid.uuid4()}.{ext}"
    
    with open(local_path, "wb") as f:
        f.write(await file.read())
        
    # Create media record
    media = RequestMedia(
        request_id=req.request_id,
        object_key=object_key,
        media_type=file.content_type,
        scan_status="clean" # Mock virus scan
    )
    db.add(media)
    db.commit()
    
    # If it's audio, run ASR and append to transcript
    if file.content_type and "audio" in file.content_type:
        result = asr_provider.transcribe(local_path)
        req.transcript = result["text"]
        req.language = result["language"]
        req.original_text = result["text"] # Fallback if text wasn't provided
        db.commit()
        
    return {"status": "success", "media_id": str(media.media_id)}
