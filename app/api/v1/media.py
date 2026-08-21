from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import CitizenRequest, RequestMedia
import uuid
import os

router = APIRouter()

def process_media_background(request_id: str, local_path: str, content_type: str, db: Session):
    try:
        req = db.query(CitizenRequest).filter(CitizenRequest.request_id == request_id).first()
        if not req: return

        if content_type and "audio" in content_type:
            from app.ai.classification.gemini_adapter import transcribe_audio_with_gemini
            with open(local_path, "rb") as f:
                audio_bytes = f.read()
            transcription = transcribe_audio_with_gemini(audio_bytes, content_type)
            if transcription:
                if not req.original_text or req.original_text in ["Attached audio recording", "Attached media file", "No description provided"]:
                    req.original_text = transcription
                db.commit()

        elif content_type and "image" in content_type:
            from app.ai.classification.gemini_adapter import analyze_image_with_gemini
            with open(local_path, "rb") as f:
                image_bytes = f.read()
            vision_analysis = analyze_image_with_gemini(image_bytes, content_type)
            if vision_analysis:
                if not req.original_text or req.original_text in ["Attached media file", "No description provided"]:
                    req.original_text = f"[VISUAL EVIDENCE]: {vision_analysis}"
                else:
                    req.original_text = f"{req.original_text}\n\n[VISUAL EVIDENCE]: {vision_analysis}"
                db.commit()
                
        # Re-run pipeline if we extracted new text/vision data so the AI analyzes it
        from app.services.pipeline_service import RequestPipeline
        pipeline = RequestPipeline(db)
        pipeline.run_full_pipeline(str(req.request_id))
    except Exception as e:
        print(f"Pipeline re-run error on media: {e}")

@router.post("/{request_id}/media")
async def upload_media(
    request_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    req = db.query(CitizenRequest).filter(CitizenRequest.request_id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    ext = file.filename.split('.')[-1]
    object_key = f"{request_id}/{uuid.uuid4()}.{ext}"
    
    os.makedirs("/tmp/civicpulse_media", exist_ok=True)
    local_path = f"/tmp/civicpulse_media/{uuid.uuid4()}.{ext}"
    
    with open(local_path, "wb") as f:
        f.write(await file.read())
        
    media = RequestMedia(
        request_id=req.request_id,
        object_key=object_key,
        media_type=file.content_type,
        scan_status="clean"
    )
    db.add(media)
    db.commit()
    
    background_tasks.add_task(process_media_background, str(req.request_id), local_path, file.content_type, db)
    
    return {"status": "success", "media_id": str(media.media_id)}
