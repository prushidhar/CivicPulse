from sqlalchemy.orm import Session
from app.models.models import Recommendation, RequestCluster
import json

def generate_recommendation(db: Session, cluster_id: str, score_data: dict):
    if score_data.get('score', 0) < 40.0:
        return # Not high enough priority
        
    cluster = db.query(RequestCluster).filter(RequestCluster.cluster_id == cluster_id).first()
    
    # Check if a recommendation already exists for this cluster based on location/category
    # For demo, we just create one
    
    rec = Recommendation(
        score=score_data['score'],
        rank=1,
        sector=cluster.category,
        project_type=f"Improve {cluster.category} Infrastructure",
        rationale=f"High demand intensity ({score_data['components']['demand_intensity']}/25) driven by {cluster.request_count} requests.",
        evidence=score_data['components'],
        model_version="1.0-demo",
        data_version="1.0-demo",
        decision="PENDING",
        confidence=score_data['confidence']
    )
    db.add(rec)
    db.commit()
    return rec
