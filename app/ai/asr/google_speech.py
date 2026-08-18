import os
import logging
from google.cloud import speech

logger = logging.getLogger(__name__)

def transcribe_audio_google(file_path: str, language_code: str = "en-US") -> str:
    """Uses Google Cloud Speech-to-Text API to transcribe citizen audio files."""
    try:
        client = speech.SpeechClient()

        with open(file_path, "rb") as audio_file:
            content = audio_file.read()

        audio = speech.RecognitionAudio(content=content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            language_code=language_code,
            enable_automatic_punctuation=True,
            # We can enable advanced models like 'latest_long' or 'medical' if needed
            model="default"
        )

        response = client.recognize(config=config, audio=audio)
        
        transcript = ""
        for result in response.results:
            transcript += result.alternatives[0].transcript + " "
            
        return transcript.strip()
    except Exception as e:
        logger.error(f"Google Cloud Speech API Error: {e}")
        return "Audio transcription failed. Please verify GCP credentials."
