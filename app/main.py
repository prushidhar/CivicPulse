from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration for Frontend Team sync
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.post("/api/v1/transcribe-audio")
async def transcribe_audio_standalone(file: UploadFile = File(...)):
    """Standalone Gemini audio transcription — no request ID needed."""
    try:
        audio_bytes = await file.read()
        mime_type = file.content_type or "audio/webm"
        from app.ai.classification.gemini_adapter import transcribe_audio_with_gemini
        transcription = transcribe_audio_with_gemini(audio_bytes, mime_type)
        if transcription:
            return {"transcription": transcription, "powered_by": "Google Gemini 1.5 Flash"}
        return {"transcription": "", "error": "Could not transcribe"}
    except Exception as e:
        print(f"Transcription error: {e}")
        return {"transcription": "", "error": str(e)}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/ready")
def readiness_check():
    return {"status": "ready"}
