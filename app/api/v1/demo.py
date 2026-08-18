from fastapi import APIRouter, Depends, BackgroundTasks
from app.scripts.seed_demo_data import run_seed
from app.core.database import SessionLocal

router = APIRouter()

def seed_task():
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()

@router.post("/seed")
def seed_demo_data(background_tasks: BackgroundTasks):
    background_tasks.add_task(seed_task)
    return {"status": "Seeding started in background. This will generate citizen requests and process them through the pipeline."}
