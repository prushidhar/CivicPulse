from sqlalchemy.orm import Session
from app.models.models import RequestCluster

def calculate_priority(db: Session, cluster_id: str):
    cluster = db.query(RequestCluster).filter(RequestCluster.cluster_id == cluster_id).first()
    if not cluster:
        return {}
        
    # Demand intensity = 25%
    # Infrastructure gap = 20%
    # Vulnerability/deprivation = 15%
    # Affected population = 10%
    # Urgency/risk = 10%
    # Trend acceleration = 10%
    # Feasibility/readiness = 5%
    # Equity adjustment = 5%
    
    # MOCK implementation of deterministic score
    demand_intensity = min(25.0, cluster.request_count * 2.5)
    infrastructure_gap = 15.0  # Mock
    vulnerability = 10.0      # Mock
    affected_population = 5.0 # Mock
    urgency = 8.0             # Mock
    trend = cluster.trend * 10.0
    feasibility = 4.0
    equity = 3.0
    
    total_score = sum([
        demand_intensity, infrastructure_gap, vulnerability, 
        affected_population, urgency, trend, feasibility, equity
    ])
    
    return {
        "score": round(total_score, 2),
        "components": {
            "demand_intensity": demand_intensity,
            "infrastructure_gap": infrastructure_gap,
            "vulnerability": vulnerability,
            "affected_population": affected_population,
            "urgency": urgency,
            "trend": trend,
            "feasibility": feasibility,
            "equity": equity
        },
        "confidence": 0.85
    }
