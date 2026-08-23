"""
CivicPulse – Gemini AI Adapter
Uses google-generativeai (genai) for multimodal analysis.
Upgraded to Gemini 2.5 Flash with automatic 1.5 Flash fallback.
"""
import json
import logging
import os
from dotenv import load_dotenv
load_dotenv()
import tempfile
import time
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Suppress the deprecation FutureWarning from the google.generativeai package
import warnings
warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")

try:
    import google.generativeai as genai
    _GENAI_AVAILABLE = True
except ImportError:
    _GENAI_AVAILABLE = False
    logger.warning("google-generativeai package not installed. AI features disabled.")


def _ensure_gemini_configured() -> bool:
    """Configure the Gemini SDK with the API key from env vars."""
    if not _GENAI_AVAILABLE:
        return False
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not set in environment. AI features disabled.")
        return False
    genai.configure(api_key=api_key)
    return True


def _get_suffix_for_mime(mime: str) -> str:
    """Return an appropriate file extension for a given MIME type."""
    if "webm" in mime:
        return ".webm"
    if "mp4" in mime:
        return ".mp4"
    if "mpeg" in mime or "mp3" in mime:
        return ".mp3"
    if "wav" in mime:
        return ".wav"
    if "ogg" in mime:
        return ".ogg"
    if "3gpp" in mime:
        return ".3gp"
    return ".tmp"


def _generate_with_fallback(prompt_args):
    """Try Gemini 2.5 Flash, automatically fall back to 1.5 Flash on failure."""
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        return model.generate_content(prompt_args)
    except Exception as e:
        error_str = str(e).lower()
        if any(kw in error_str for kw in ["404", "not found", "invalid", "not_found", "unavailable"]):
            logger.warning(f"gemini-2.5-flash unavailable ({e}), falling back to gemini-1.5-flash")
            model = genai.GenerativeModel("gemini-1.5-flash")
            return model.generate_content(prompt_args)
        raise


def classify_with_gemini(text: str) -> Dict[str, Any]:
    """
    Classify a citizen report using Gemini AI.
    Returns a structured dictionary with category, severity, summary, etc.
    Falls back to defaults if Gemini is unavailable.
    """
    if not _ensure_gemini_configured():
        return _get_fallback_classification(text)

    try:
        prompt = f"""You are an AI assistant for a government digital public infrastructure platform in India.
Analyze the following citizen request and return ONLY a valid JSON object with these exact keys:

- category (string: one of 'water', 'roads', 'health', 'education', 'digital connectivity', 'sanitation', 'energy', 'public safety', 'environment', 'transport', 'housing', 'infrastructure', 'other')
- intent (string: brief 2-5 word summary of the core problem)
- severity (string: exactly one of 'low', 'medium', 'high', 'critical' based on public safety impact)
- urgency (integer: 1 to 5, where 5 is life-threatening)
- confidence (float: 0.0 to 1.0)
- summary (string: one clear sentence describing the issue for a government official)
- recommended_action (string: one clear sentence on what the government should do)
- department (string: the specific Indian Government department that should handle this)
- risk_assessment (string: one sentence analyzing the hazard/risk to public safety)
- translated_text (string: English translation of the text, or the original if already in English)

Citizen Request: "{text}"

Return ONLY the JSON object, no markdown, no explanation:"""

        response = _generate_with_fallback(prompt)
        content = response.text.strip()

        # Strip markdown code fences if present
        if content.startswith("```"):
            lines = content.split("\n")
            content = "\n".join(lines[1:-1]).strip()

        result = json.loads(content)

        # Validate required keys exist, fill missing ones
        required_keys = ["category", "intent", "severity", "urgency", "confidence",
                         "summary", "recommended_action", "department", "risk_assessment", "translated_text"]
        for key in required_keys:
            if key not in result:
                fallback = _get_fallback_classification(text)
                result[key] = fallback[key]

        return result

    except json.JSONDecodeError as e:
        logger.error(f"Gemini returned invalid JSON: {e}")
        return _get_fallback_classification(text)
    except Exception as e:
        logger.error(f"Gemini classification failed: {e}")
        return _get_fallback_classification(text)


def transcribe_audio_with_gemini(audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
    """
    Transcribe audio using Gemini multimodal. Returns the transcription text.
    Also includes translation to English and a recommended government action.
    """
    if not _ensure_gemini_configured():
        return ""

    tmp_path = None
    uploaded_file = None
    try:
        clean_mime = (mime_type.split(";")[0].strip()) if mime_type else "audio/webm"
        suffix = _get_suffix_for_mime(clean_mime)

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        uploaded_file = genai.upload_file(path=tmp_path, mime_type=clean_mime)

        # Wait for file to be processed
        max_wait = 30
        waited = 0
        while uploaded_file.state.name == "PROCESSING" and waited < max_wait:
            time.sleep(2)
            waited += 2
            uploaded_file = genai.get_file(uploaded_file.name)

        if uploaded_file.state.name == "FAILED":
            logger.error("Gemini failed to process audio file.")
            return ""

        prompt = (
            "Listen to this audio recording from a citizen reporting a civic issue in India. "
            "Please:\n"
            "1. Transcribe exactly what is said in its original language.\n"
            "2. Translate it to English.\n"
            "3. Provide a brief 1-sentence recommended government action.\n\n"
            "Format your response EXACTLY as:\n"
            "Transcript: [original transcription]\n"
            "Translation: [English translation]\n"
            "Recommended Action: [government action]"
        )

        response = _generate_with_fallback([prompt, uploaded_file])
        return response.text.strip()

    except Exception as e:
        logger.error(f"Gemini audio transcription failed: {e}")
        return ""
    finally:
        try:
            if uploaded_file:
                genai.delete_file(uploaded_file.name)
        except Exception:
            pass
        try:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass


def analyze_media_with_gemini(media_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """
    Analyze an image or video from a citizen report using Gemini multimodal.
    Returns a visual description of the civic issue.
    """
    if not _ensure_gemini_configured():
        return ""

    tmp_path = None
    uploaded_file = None
    try:
        clean_mime = (mime_type.split(";")[0].strip()) if mime_type else "image/jpeg"

        analysis_prompt = (
            "Analyze this visual media (photo or video) submitted by a citizen reporting a civic "
            "or infrastructure issue in India. Provide a concise 2-sentence description of the visible "
            "problem. Focus only on what you can see. Do not make assumptions."
        )

        # For images, use inline data (faster, no upload needed)
        if "image" in clean_mime:
            media_part = {"mime_type": clean_mime, "data": media_bytes}
            response = _generate_with_fallback([analysis_prompt, media_part])
            return response.text.strip()

        # For videos, use the Files API
        suffix = _get_suffix_for_mime(clean_mime)
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(media_bytes)
            tmp_path = tmp.name

        uploaded_file = genai.upload_file(path=tmp_path, mime_type=clean_mime)

        max_wait = 60
        waited = 0
        while uploaded_file.state.name == "PROCESSING" and waited < max_wait:
            time.sleep(3)
            waited += 3
            uploaded_file = genai.get_file(uploaded_file.name)

        if uploaded_file.state.name == "FAILED":
            logger.error("Gemini failed to process video file.")
            return ""

        response = _generate_with_fallback([analysis_prompt, uploaded_file])
        return response.text.strip()

    except Exception as e:
        logger.error(f"Gemini media analysis failed: {e}")
        return ""
    finally:
        try:
            if uploaded_file:
                genai.delete_file(uploaded_file.name)
        except Exception:
            pass
        try:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass


def _get_fallback_classification(text: str) -> Dict[str, Any]:
    """
    Returns a safe default classification when Gemini is unavailable.
    Uses keyword-based heuristics for category detection.
    """
    text_lower = (text or "").lower()

    if any(w in text_lower for w in ["road", "pothole", "bridge", "highway"]):
        category = "roads"
    elif any(w in text_lower for w in ["water", "pipe", "leak", "flood"]):
        category = "water"
    elif any(w in text_lower for w in ["light", "electricity", "power", "electric"]):
        category = "energy"
    elif any(w in text_lower for w in ["hospital", "health", "medical", "doctor"]):
        category = "health"
    elif any(w in text_lower for w in ["school", "education", "college"]):
        category = "education"
    elif any(w in text_lower for w in ["drain", "sewage", "toilet", "garbage", "waste"]):
        category = "sanitation"
    elif any(w in text_lower for w in ["internet", "network", "signal", "wifi", "4g", "5g"]):
        category = "digital connectivity"
    elif any(w in text_lower for w in ["crime", "police", "theft", "robbery", "safety"]):
        category = "public safety"
    else:
        category = "infrastructure"

    return {
        "category": category,
        "intent": "Citizen-Reported Issue",
        "severity": "medium",
        "urgency": 3,
        "confidence": 0.5,
        "summary": "A citizen has reported a civic issue requiring government attention.",
        "recommended_action": "Assign to relevant department for inspection and resolution.",
        "department": "Municipal Corporation",
        "risk_assessment": "Requires on-site assessment to determine risk level.",
        "translated_text": text or ""
    }
