import json
import google.generativeai as genai
from app.core.config import settings

def extract_entities(text: str):
    """
    Extracts entities using Gemini AI for real dynamic NLP parsing.
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        Extract key locations (street names, districts, cities, landmarks) from the following text.
        Return ONLY a JSON array of objects. Each object must have "entity_type" set to "LOCATION", "value" as the raw text, and "normalized_value" as a clean version. 
        Example output: [{{"entity_type": "LOCATION", "value": "main st", "normalized_value": "Main Street", "confidence": 0.95}}]
        
        Text to analyze: {text}
        """
        response = model.generate_content(prompt)
        text_resp = response.text.strip()
        if text_resp.startswith("```json"):
            text_resp = text_resp[7:-3]
            
        entities = json.loads(text_resp)
        return entities
    except Exception as e:
        print(f"Gemini NER failed: {e}")
        return []
