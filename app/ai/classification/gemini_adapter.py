import os
import re
import json
import logging
import tempfile
import time
import google.generativeai as genai

logger = logging.getLogger(__name__)

# Configure Gemini API key - will be re-checked on each call if empty
_api_configured = False

def _ensure_gemini_configured():
    global _api_configured
    if not _api_configured:
        api_key = os.getenv("GEMINI_API_KEY", "")
        if api_key:
            genai.configure(api_key=api_key)
            _api_configured = True
        else:
            logger.warning("GEMINI_API_KEY not found in environment variables")

# Attempt initial configuration
_ensure_gemini_configured()


def classify_with_gemini(text: str) -> dict:
    """Uses Gemini to extract structured classification from citizen text."""
    _ensure_gemini_configured()
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""You are an AI assistant for a government digital public infrastructure platform in India.
Analyze the following citizen request and return ONLY a valid JSON object with these exact keys:

- category (string: one of 'water', 'roads', 'health', 'education', 'digital connectivity', 'sanitation', 'energy', 'public safety', 'environment', 'transport', 'housing', 'infrastructure', 'other')
- intent (string: brief 2-5 word summary of the core problem, e.g. "broken road potholes")
- severity (string: exactly one of 'low', 'medium', 'high', 'critical' — based on public safety impact)
- urgency (integer: 1 to 5, where 5 is life-threatening)
- confidence (float: 0.0 to 1.0, your classification confidence)
- summary (string: one clear sentence describing the issue for a government official)
- recommended_action (string: one clear sentence on what the government should do)
- department (string: the specific Indian Government department that should handle this, e.g., 'NHAI', 'BBMP', 'PWD', 'BESCOM', 'Traffic Police', 'Water Board', 'NDRF')
- risk_assessment (string: one sentence analyzing the hazard/risk to public safety)
- translated_text (string: English translation of the text — if already English, return as-is)

Return ONLY the JSON. No markdown, no explanation.

Citizen Request: "{text}"
"""
        response = model.generate_content(prompt)
        clean_text = response.text.strip()
        
        # Robust JSON extraction using regex - handles Gemini adding markdown fences or preamble text
        json_match = re.search(r'\{.*\}', clean_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            result = json.loads(clean_text)
        return result
    except Exception as e:
        logger.error(f"Gemini API Error: {e}")
        return {
            "category": "infrastructure",
            "intent": "unknown issue",
            "severity": "medium",
            "urgency": 3,
            "confidence": 0.5,
            "summary": text[:200] if text else "No description provided.",
            "recommended_action": "Review and assess the citizen report for appropriate action.",
            "department": "General Administration",
            "risk_assessment": "Standard risk level.",
            "translated_text": text
        }


def _get_suffix_for_mime(mime_type: str) -> str:
    """Get a proper file suffix based on mime type."""
    mime_map = {
        "audio/webm": ".webm",
        "audio/wav": ".wav",
        "audio/mpeg": ".mp3",
        "audio/mp3": ".mp3",
        "audio/mp4": ".m4a",
        "audio/m4a": ".m4a",
        "audio/ogg": ".ogg",
        "video/mp4": ".mp4",
        "video/webm": ".webm",
    }
    return mime_map.get(mime_type, ".webm")


def transcribe_audio_with_gemini(audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
    """Uses Gemini multimodal to transcribe audio from citizen voice reports."""
    _ensure_gemini_configured()
    tmp_path = None
    uploaded_file = None
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        clean_mime = mime_type.split(";")[0].strip() if mime_type else "audio/webm"
        suffix = _get_suffix_for_mime(clean_mime)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
            
        uploaded_file = genai.upload_file(path=tmp_path, mime_type=clean_mime)
        
        while uploaded_file.state.name == 'PROCESSING':
            time.sleep(2)
            uploaded_file = genai.get_file(uploaded_file.name)
            
        if uploaded_file.state.name == 'FAILED':
            raise Exception("Gemini File API processing failed for audio")
        
        response = model.generate_content([
            "Please accurately transcribe this audio. Keep the transcription in the original language or translate to English. Return ONLY the transcription text, nothing else.",
            uploaded_file
        ])
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini ASR Error: {e}")
        return ""
    finally:
        try:
            if uploaded_file: genai.delete_file(uploaded_file.name)
            if tmp_path and os.path.exists(tmp_path): os.remove(tmp_path)
        except Exception:
            pass

def analyze_media_with_gemini(media_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """Uses Gemini multimodal to extract a visual description of citizen photo or video reports."""
    _ensure_gemini_configured()
    tmp_path = None
    uploaded_file = None
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        clean_mime_type = mime_type.split(";")[0].strip() if mime_type else "image/jpeg"
        
        # If it's an image, we can just use inline data which is faster
        if "image" in clean_mime_type:
            media_part = {"mime_type": clean_mime_type, "data": media_bytes}
            prompt = "Analyze this visual media (photo or video) submitted by a citizen reporting a civic or infrastructure issue in India. Provide a concise, 2-sentence description of the visible problem. Do not make assumptions, just describe the visual evidence."
            response = model.generate_content([prompt, media_part])
            return response.text.strip()
            
        # If it's video, we MUST use the File API
        suffix = _get_suffix_for_mime(clean_mime_type)
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(media_bytes)
            tmp_path = tmp.name
            
        uploaded_file = genai.upload_file(path=tmp_path, mime_type=clean_mime_type)
        
        # Wait for video to process
        while uploaded_file.state.name == 'PROCESSING':
            time.sleep(2)
            uploaded_file = genai.get_file(uploaded_file.name)
            
        if uploaded_file.state.name == 'FAILED':
            raise Exception("Gemini File API processing failed")
            
        prompt = "Analyze this visual media (photo or video) submitted by a citizen reporting a civic or infrastructure issue in India. Provide a concise, 2-sentence description of the visible problem. Do not make assumptions, just describe the visual evidence."
        response = model.generate_content([prompt, uploaded_file])
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini Vision Error: {e}")
        return ""
    finally:
        try:
            if uploaded_file: genai.delete_file(uploaded_file.name)
            if tmp_path and os.path.exists(tmp_path): os.remove(tmp_path)
        except Exception:
            pass
