from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import AuditEvent
from app.core.security import require_role

router = APIRouter()

@router.get("/{object_id}")
def get_audit_trail(object_id: str, db: Session = Depends(get_db)):
    """Fetch immutable audit trail for a specific object (request, recommendation, etc)"""
    # In production, require authentication
    # _ = Depends(require_role(["administrator", "government_official"]))
    events = db.query(AuditEvent).filter(AuditEvent.object_id == object_id).order_by(AuditEvent.timestamp.desc()).all()
    return events
