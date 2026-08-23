import google.generativeai as genai
import json
import logging
import os
import tempfile
import time
from typing import Dict, Any

logger = logging.getLogger(__name__)

def _ensure_gemini_configured():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY is not set. Classification will fallback to defaults.")
        return False
    genai.configure(api_key=api_key)
    return True

def _get_suffix_for_mime(mime: str) -> str:
    if "webm" in mime: return ".webm"
    if "mp4" in mime: return ".mp4"
    if "mpeg" in mime: return ".mp3"
    if "wav" in mime: return ".wav"
    if "ogg" in mime: return ".ogg"
    return ".tmp"

def _generate_with_fallback(prompt_args):
    model_25 = genai.GenerativeModel("gemini-2.5-flash")
    try:
        return model_25.generate_content(prompt_args)
    except Exception as e:
        if "404" in str(e) or "not found" in str(e).lower() or "invalid" in str(e).lower():
            logger.warning(f"gemini-2.5-flash failed ({e}), falling back to gemini-1.5-flash")
            model_15 = genai.GenerativeModel("gemini-1.5-flash")
            return model_15.generate_content(prompt_args)
        raise e

def classify_with_gemini(text: str) -> Dict[str, Any]:
    """Uses Gemini to extract structured classification from citizen text."""
    if not _ensure_gemini_configured():
        return _get_fallback_classification(text)
    
    try:
        prompt = f"""You are an AI assistant for a government digital public infrastructure platform in India.
Analyze the following citizen request and return ONLY a valid JSON object with these exact keys:

- category (string: one of 'water', 'roads', 'health', 'education', 'digital connectivity', 'sanitation', 'energy', 'public safety', 'environment', 'transport', 'housing', 'infrastructure', 'other')
- intent (string: brief 2-5 word summary of the core problem)
- severity (string: exactly one of 'low', 'medium', 'high', 'critical' - based on public safety impact)
- urgency (integer: 1 to 5, where 5 is life-threatening)
- confidence (float: 0.0 to 1.0, your classification confidence)
- summary (string: one clear sentence describing the issue for a government official)
- recommended_action (string: one clear sentence on what the government should do)
- department (string: the specific Indian Government department that should handle this)
- risk_assessment (string: one sentence analyzing the hazard/risk to public safety)
- translated_text (string: English translation of the text)

Citizen Request: "{text}"

JSON output:"""

        response = _generate_with_fallback(prompt)
        content = response.text.strip()
        if content.startswith('```json'):
            content = content[7:-3].strip()
        elif content.startswith('```'):
            content = content[3:-3].strip()
            
        result = json.loads(content)
        return result
    except Exception as e:
        logger.error(f"Gemini classification failed: {e}")
        return _get_fallback_classification(text)

def transcribe_audio_with_gemini(audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
    """Uses Gemini 1.5 Flash natively to transcribe audio and translate to English."""
    if not _ensure_gemini_configured():
        return ""
    
    tmp_path = None
    uploaded_file = None
    try:
        clean_mime = mime_type.split(";")[0].strip() if mime_type else "audio/webm"
        suffix = _get_suffix_for_mime(clean_mime)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
            
        uploaded_file = genai.upload_file(path=tmp_path, mime_type=clean_mime)
        
        while uploaded_file.state.name == "PROCESSING":
            time.sleep(2)
            uploaded_file = genai.get_file(uploaded_file.name)
            
        if uploaded_file.state.name == "FAILED":
            logger.error("Gemini failed to process audio file.")
            return ""

        prompt = "Listen to this audio. First, transcribe exactly what is being said in its original language. Then, translate it to English. Then, provide a 1-sentence recommended action for the government to take. Format your response exactly like this:\n\nTranscript: [original text]\nTranslation: [english text]\nRecommended Action: [action]"
        response = _generate_with_fallback([prompt, uploaded_file])
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini transcription failed: {e}")
        return ""
    finally:
        try:
            if uploaded_file: genai.delete_file(uploaded_file.name)
            if tmp_path and os.path.exists(tmp_path): os.remove(tmp_path)
        except Exception:
            pass

def analyze_media_with_gemini(media_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """Uses Gemini multimodal to extract a visual description of citizen photo or video reports."""
    if not _ensure_gemini_configured():
        return ""
        
    tmp_path = None
    uploaded_file = None
    try:
        clean_mime_type = mime_type.split(";")[0].strip() if mime_type else "image/jpeg"
        
        if "image" in clean_mime_type:
            media_part = {"mime_type": clean_mime_type, "data": media_bytes}
            prompt = "Analyze this visual media (photo or video) submitted by a citizen reporting a civic or infrastructure issue in India. Provide a concise, 2-sentence description of the visible problem. Do not make assumptions, just describe the visual evidence."
            response = _generate_with_fallback([prompt, media_part])
            return response.text.strip()
            
        suffix = _get_suffix_for_mime(clean_mime_type)
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(media_bytes)
            tmp_path = tmp.name
            
        uploaded_file = genai.upload_file(path=tmp_path, mime_type=clean_mime_type)
        while uploaded_file.state.name == "PROCESSING":
            time.sleep(2)
            uploaded_file = genai.get_file(uploaded_file.name)
            
        if uploaded_file.state.name == "FAILED":
            return ""

        prompt = "Analyze this video submitted by a citizen reporting a civic or infrastructure issue in India. Provide a concise, 2-sentence description of the visible problem. Do not make assumptions, just describe the visual evidence."
        response = _generate_with_fallback([prompt, uploaded_file])
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini media analysis failed: {e}")
        return ""
    finally:
        try:
            if uploaded_file: genai.delete_file(uploaded_file.name)
            if tmp_path and os.path.exists(tmp_path): os.remove(tmp_path)
        except Exception:
            pass

def _get_fallback_classification(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    return {
        "category": "infrastructure" if "road" in text_lower or "pothole" in text_lower else "other",
        "intent": "Unclassified Issue",
        "severity": "medium",
        "urgency": 3,
        "confidence": 0.5,
        "summary": "Pending AI classification.",
        "recommended_action": "Requires manual review.",
        "department": "Municipal Corporation",
        "risk_assessment": "Pending",
        "translated_text": text
    }
