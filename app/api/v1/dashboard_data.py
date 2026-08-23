from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import InfrastructureAsset, InvestmentProject, Indicator, Dataset

router = APIRouter()

@router.get("/infrastructure")
def get_infra(db: Session = Depends(get_db)):
    try:
        assets = db.query(InfrastructureAsset).limit(50).all()
        if not assets:
            return []
        return [
            {
                "id": str(a.id),
                "type": a.asset_type or "Unknown Asset",
                "condition": a.condition or "Unknown",
                "capacityGauge": int(a.capacity) if a.capacity else 0
            }
            for a in assets
        ]
    except Exception as e:
        print(f"Error fetching infrastructure: {e}")
        return []

@router.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    try:
        projects = db.query(InvestmentProject).limit(50).all()
        if not projects:
            return []
        return [
            {
                "id": str(p.project_id),
                "name": p.title or "Unknown Project",
                "budget": p.budget or 0,
                "overlapWarning": False
            }
            for p in projects
        ]
    except Exception as e:
        print(f"Error fetching projects: {e}")
        return []

@router.get("/indicators")
def get_indicators(db: Session = Depends(get_db)):
    try:
        indicators = db.query(Indicator).limit(50).all()
        if not indicators:
            return []
        return [
            {
                "id": str(i.id),
                "name": i.indicator_code or "Unknown",
                "value": i.value or 0,
                "unit": i.unit or "",
                "source": i.source or ""
            }
            for i in indicators
        ]
    except Exception as e:
        return []

@router.get("/datasets")
def get_datasets(db: Session = Depends(get_db)):
    try:
        datasets = db.query(Dataset).limit(50).all()
        if not datasets:
            return []
        return [
            {
                "id": str(d.id),
                "title": d.name or "Unknown Dataset",
                "source": d.source or "",
                "url": d.url or ""
            }
            for d in datasets
        ]
    except Exception as e:
        return []

@router.get("/geo/units/{id}")
def get_geo(id: str, db: Session = Depends(get_db)):
    return {}
