from sqlalchemy.orm import Session
from app.models.models import CitizenRequest, RequestCluster
import uuid

def find_duplicate_cluster(db: Session, request: CitizenRequest):
    # In a real scenario, we calculate semantic_similarity + spatial_similarity + temporal_similarity
    # For demo, we check if there's a recent request in the same H3 cell and category
    
    existing = db.query(CitizenRequest).filter(
        CitizenRequest.h3_cell == request.h3_cell,
        CitizenRequest.category == request.category,
        CitizenRequest.request_id != request.request_id
    ).first()
    
    if existing and existing.duplicate_cluster_id:
        return existing.duplicate_cluster_id
    
    # Create new cluster
    cluster_id = str(uuid.uuid4())
    cluster = RequestCluster(
        cluster_id=cluster_id,
        category=request.category,
        centroid=request.location, # approximation
        request_count=0,
        unique_reporters=0,
        confidence=1.0
    )
    db.add(cluster)
    db.commit()
    return cluster_id
