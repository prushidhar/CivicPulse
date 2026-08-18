from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Recommendation, AuditEvent
from app.schemas.requests import RecommendationDecision

router = APIRouter()

@router.get("")
def list_recommendations(limit: int = 50, db: Session = Depends(get_db)):
    recs = db.query(Recommendation).order_by(Recommendation.score.desc()).limit(limit).all()
    return recs

@router.get("/{rec_id}")
def get_recommendation(rec_id: str, db: Session = Depends(get_db)):
    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return rec

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
