import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class ASRProvider:
    def __init__(self):
        self.model = None

    def _load_model(self):
        if not self.model and not settings.DEMO_MODE:
            from faster_whisper import WhisperModel
            logger.info("Loading faster-whisper model (base)...")
            # Using 'base' for performance, switch to 'large-v3' in heavy production
            self.model = WhisperModel("base", device="cpu", compute_type="int8")

    def transcribe(self, audio_path: str) -> dict:
        """Returns transcript and detected language"""
        if settings.DEMO_MODE:
            return {
                "text": "This is a mock audio transcription for demo purposes.",
                "language": "en"
            }
            
        self._load_model()
        segments, info = self.model.transcribe(audio_path, beam_size=5)
        text = " ".join([segment.text for segment in segments])
        
        return {
            "text": text,
            "language": info.language
        }
