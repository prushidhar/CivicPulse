from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Indicator, InfrastructureAsset, ImpactMetric, Dataset
from typing import List

router = APIRouter()

@router.get("/indicators")
def get_indicators(db: Session = Depends(get_db)):
    """Fetch macro civic indicators (WorldBank/SDG mappings)"""
    return db.query(Indicator).limit(100).all()

@router.get("/infrastructure")
def get_infrastructure(db: Session = Depends(get_db)):
    """Fetch known infrastructure assets (Clinics, Schools, etc)"""
    return db.query(InfrastructureAsset).limit(100).all()

@router.get("/impact")
def get_impact_metrics(db: Session = Depends(get_db)):
    """Fetch measured impact of completed projects"""
    return db.query(ImpactMetric).limit(100).all()

@router.get("/datasets")
def get_datasets(db: Session = Depends(get_db)):
    """Fetch metadata of ingested open datasets"""
    return db.query(Dataset).limit(100).all()
