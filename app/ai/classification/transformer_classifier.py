import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class TransformerClassifier:
    def __init__(self):
        self.classifier = None
        
    def _load_model(self):
        if not self.classifier and not settings.DEMO_MODE:
            from transformers import pipeline
            logger.info("Loading zero-shot classification pipeline...")
            self.classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

    def classify(self, text: str):
        if settings.DEMO_MODE:
            from app.ai.classification.mock_classifier import classify_text
            return classify_text(text)
            
        self._load_model()
        candidate_labels = ["Water", "Roads", "Healthcare", "Education", "Connectivity", "Sanitation"]
        result = self.classifier(text, candidate_labels)
        
        top_category = result['labels'][0]
        confidence = result['scores'][0]
        
        # Determine urgency
        urgency_result = self.classifier(text, ["urgent emergency", "routine issue"])
        is_urgent = urgency_result['labels'][0] == "urgent emergency" and urgency_result['scores'][0] > 0.7
        
        return {
            "category": top_category,
            "intent": "service_request",
            "severity": "high" if is_urgent else "medium",
            "urgency": "high" if is_urgent else "medium",
            "confidence": round(confidence, 2)
        }
        
classifier_instance = TransformerClassifier()

def classify_text_real(text: str):
    return classifier_instance.classify(text)
