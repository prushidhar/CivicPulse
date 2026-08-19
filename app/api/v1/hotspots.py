from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import RequestCluster
from typing import List, Dict, Any

router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
def get_hotspots(category: str = None, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(RequestCluster).filter(RequestCluster.request_count > 0)
    if category:
        query = query.filter(RequestCluster.category == category)
        
    clusters = query.order_by(RequestCluster.trend.desc()).limit(limit).all()
    
    # Format as mock GeoJSON
    results = []
    for c in clusters:
        # We'd parse WKT geometry to coordinates here. 
        # Mock coordinates for response
        results.append({
            "cluster_id": c.cluster_id,
            "category": c.category,
            "request_count": c.request_count,
            "trend": c.trend,
            "location_wkt": str(c.centroid) if c.centroid else None
        })
    return results
