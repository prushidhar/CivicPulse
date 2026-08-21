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


def transcribe_audio_with_gemini(audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
    """Uses Gemini multimodal to transcribe audio from citizen voice reports."""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        import google.generativeai as genai_lib
        audio_part = {"mime_type": mime_type, "data": audio_bytes}
        prompt = "Transcribe this audio recording exactly as spoken. Return only the transcribed text, nothing else."
        response = model.generate_content([prompt, audio_part])
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini Audio Transcription Error: {e}")
        return ""
