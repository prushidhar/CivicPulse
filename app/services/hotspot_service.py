from sqlalchemy.orm import Session
from app.models.models import RequestCluster, CitizenRequest

def update_hotspot(db: Session, cluster_id: str):
    cluster = db.query(RequestCluster).filter(RequestCluster.cluster_id == cluster_id).first()
    if not cluster:
        return
        
    reqs = db.query(CitizenRequest).filter(CitizenRequest.duplicate_cluster_id == cluster_id).all()
    
    cluster.request_count = len(reqs)
    # Simple mock unique reporters
    cluster.unique_reporters = len(set(r.source_channel for r in reqs)) # Hack for demo
    
    # Calculate trend (mock)
    cluster.trend = min(1.0, cluster.request_count * 0.1)
    
    db.commit()
