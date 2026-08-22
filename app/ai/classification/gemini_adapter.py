import os
import json
import logging
import google.generativeai as genai

logger = logging.getLogger(__name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

def classify_with_gemini(text: str) -> dict:
    """Uses Gemini to extract structured classification from citizen text."""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
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
        # Strip markdown code fences if present
        if clean_text.startswith("```"):
            clean_text = clean_text.split("```")[1]
            if clean_text.startswith("json"):
                clean_text = clean_text[4:]
        result = json.loads(clean_text.strip())
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
            "translated_text": text
        }


import tempfile
import time

def transcribe_audio_with_gemini(audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
    """Uses Gemini multimodal to transcribe audio from citizen voice reports."""
    tmp_path = None
    uploaded_file = None
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        clean_mime = mime_type.split(";")[0].strip() if mime_type else "audio/webm"
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
            
        uploaded_file = genai.upload_file(path=tmp_path, mime_type=clean_mime)
        
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
    tmp_path = None
    uploaded_file = None
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        clean_mime_type = mime_type.split(";")[0].strip() if mime_type else "image/jpeg"
        
        # If it's an image, we can just use inline data which is faster
        if "image" in clean_mime_type:
            media_part = {"mime_type": clean_mime_type, "data": media_bytes}
            prompt = "Analyze this visual media (photo or video) submitted by a citizen reporting a civic or infrastructure issue in India. Provide a concise, 2-sentence description of the visible problem. Do not make assumptions, just describe the visual evidence."
            response = model.generate_content([prompt, media_part])
            return response.text.strip()
            
        # If it's video, we MUST use the File API
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
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
