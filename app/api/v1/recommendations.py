from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Recommendation, AuditEvent
from app.schemas.requests import RecommendationDecision

router = APIRouter()

def map_rec_for_frontend(rec):
    scores = {
        "demandIntensity": 0,
        "infrastructureGap": 0,
        "vulnerability": 0,
        "affectedPopulation": 0,
        "urgencyRisk": 0,
        "trendAcceleration": 0,
        "feasibility": 0,
        "equityAdjustment": 0
    }
    
    evidence = getattr(rec, "evidence", {})
    if evidence and isinstance(evidence, dict) and "components" in evidence:
        comps = evidence["components"]
        scores["demandIntensity"] = comps.get("demand_intensity", 0)
        scores["infrastructureGap"] = comps.get("infrastructure_gap", 0)
        scores["vulnerability"] = comps.get("vulnerability", 0)
        scores["affectedPopulation"] = comps.get("affected_population", 0)
        scores["urgencyRisk"] = comps.get("urgency_risk", 0)
        scores["trendAcceleration"] = comps.get("trend_acceleration", 0)
        scores["feasibility"] = comps.get("feasibility", 0)
        scores["equityAdjustment"] = comps.get("equity_adjustment", 0)

    return {
        "id": str(rec.recommendation_id),
        "hotspotId": getattr(rec, "hotspot_id", ""),
        "priorityScore": int(rec.score) if rec.score else 0,
        "title": rec.project_type or "Infrastructure Intervention",
        "description": rec.rationale or "No rationale provided.",
        "status": rec.decision or "pending",
        "scores": scores
    }

@router.get("")
def list_recommendations(limit: int = 50, db: Session = Depends(get_db)):
    recs = db.query(Recommendation).order_by(Recommendation.score.desc()).limit(limit).all()
    return [map_rec_for_frontend(r) for r in recs]

@router.get("/{rec_id}")
def get_recommendation(rec_id: str, db: Session = Depends(get_db)):
    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return map_rec_for_frontend(rec)

@router.get("/{rec_id}/evidence")
def get_recommendation_evidence(rec_id: str, db: Session = Depends(get_db)):
    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    if getattr(rec, "evidence", None):
        return rec.evidence
    return []

@router.post("/{rec_id}/decision")
def submit_decision(rec_id: str, decision: RecommendationDecision, db: Session = Depends(get_db)):
    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    rec.decision = decision.decision
    rec.reviewer = decision.reviewer
    rec.decision_reason = decision.reason
    
    audit = AuditEvent(
        actor=decision.reviewer,
        action=f"DECISION_{decision.decision}",
        object_type="Recommendation",
        object_id=str(rec_id),
        reason=decision.reason
    )
    db.add(audit)
    db.commit()
    
    return {"status": "success", "decision": decision.decision}
