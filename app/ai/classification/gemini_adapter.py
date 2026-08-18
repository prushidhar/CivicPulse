import os
import json
import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini with the API key from environment variables
genai.configure(api_key=os.getenv("GEMINI_API_KEY", "mock_key_for_build"))

def classify_with_gemini(text: str) -> dict:
    """Uses Gemini to extract structured classification from citizen text."""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        Analyze the following citizen request and classify it.
        Return ONLY a valid JSON object with the following keys:
        - category (string: e.g. 'water', 'roads', 'health', 'digital connectivity', 'sanitation')
        - intent (string: brief 2-word summary of the problem)
        - severity (string: 'low', 'medium', 'high', 'critical')
        - urgency (integer: 1 to 5, where 5 is extremely urgent)
        - confidence (float: 0.0 to 1.0)
        
        Citizen Request: "{text}"
        """
        response = model.generate_content(prompt)
        # Strip out any markdown formatting (e.g. ```json ... ```)
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        result = json.loads(clean_text)
        return result
    except Exception as e:
        logger.error(f"Gemini API Error: {e}")
        # Fallback to defaults if API fails or key is missing
        return {
            "category": "infrastructure",
            "intent": "unknown issue",
            "severity": "medium",
            "urgency": 3,
            "confidence": 0.5
        }
