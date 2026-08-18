import logging
from sqlalchemy.orm import Session
from app.models.models import CitizenRequest
from app.ai.classification.mock_classifier import classify_text
from app.ai.ner.mock_ner import extract_entities
from app.services.geocoding_service import geocode_entities
from app.services.deduplication_service import find_duplicate_cluster
from app.services.hotspot_service import update_hotspot
from app.services.priority_service import calculate_priority
from app.services.recommendation_service import generate_recommendation

class RequestPipeline:
    def __init__(self, db: Session):
        self.db = db
        self.logger = logging.getLogger(__name__)

    def run_full_pipeline(self, request_id: str):
        req = self.db.query(CitizenRequest).filter(CitizenRequest.request_id == request_id).first()
        if not req:
            self.logger.error(f"Request {request_id} not found in DB")
            return
            
        req.status = "processing"
        self.db.commit()

        # Step 1: Language Detection & PII Redaction
        req.language = "en" # Still mocked
        req.pii_redacted_text = req.original_text.replace("12345", "[REDACTED]") 
        
        # Step 2: Intent & Category Classification
        from app.ai.classification.transformer_classifier import classify_text_real
        classification = classify_text_real(req.pii_redacted_text)
        req.category = classification['category']
        req.intent = classification['intent']
        req.severity = classification['severity']
        req.urgency = classification['urgency']
        req.ai_confidence = classification['confidence']
        
        # Step 3: Entity Extraction
        entities = extract_entities(req.pii_redacted_text)
        req.entities = entities
        
        # Step 4: Geocoding & H3
        geo_result = geocode_entities(entities, req.country_code)
        if geo_result:
            req.location = geo_result['point']
            req.h3_cell = geo_result['h3']
            req.geocoding_confidence = geo_result['confidence']
            
        self.db.commit()
        
        # Step 5: Duplicate Detection & Clustering
        cluster_id = find_duplicate_cluster(self.db, req)
        req.duplicate_cluster_id = cluster_id
        self.db.commit()
        
        # Step 6: Hotspot Calculation
        update_hotspot(self.db, cluster_id)
        
        # Step 7: Priority Score Calculation
        score_data = calculate_priority(self.db, cluster_id)
        
        # Step 8: Feasibility Gates & Recommendation
        rec = generate_recommendation(self.db, cluster_id, score_data)
        if rec:
            from app.services.rag_service import RAGService
            rag = RAGService(self.db)
            query = f"{req.category} issues in {req.admin_level_2 or 'area'}"
            evidence = rag.attach_evidence_to_recommendation(str(rec.recommendation_id), query)
            rec.evidence = {"components": score_data['components'], "rag_evidence": evidence}
        
        req.status = "processed"
        self.db.commit()
