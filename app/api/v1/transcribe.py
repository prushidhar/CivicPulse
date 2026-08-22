from fastapi import APIRouter, UploadFile, File, HTTPException
router = APIRouter()

@router.post("/transcribe-audio")
async def transcribe_audio_standalone(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        mime_type = file.content_type or "audio/webm"
        from app.ai.classification.gemini_adapter import transcribe_audio_with_gemini
        transcription = transcribe_audio_with_gemini(audio_bytes, mime_type)
        if transcription:
            return {"transcription": transcription}
        else:
            raise HTTPException(status_code=422, detail="Could not transcribe audio")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
