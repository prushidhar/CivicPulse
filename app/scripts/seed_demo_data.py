import logging
from sqlalchemy.orm import Session
from app.models.models import CitizenRequest
from app.services.pipeline_service import RequestPipeline
import random

logger = logging.getLogger(__name__)

SCENARIOS = [
    "There is no reliable drinking water in our village and people have to travel several kilometres every day.",
    "The main road connecting to the highway is completely washed out after the rains.",
    "The local primary health center has no doctors available for the past month.",
    "Our school roof is leaking and children cannot sit inside during monsoon.",
    "Garbage is piling up near the central market, causing terrible smell and disease risk.",
    "Internet connectivity drops every hour, making digital services unusable.",
    "There are deep potholes on High Street causing multiple accidents.",
    "Water supply is only coming once every 3 days in the northern district.",
    "No electricity since last night, completely dark in sector 4.",
    "The bridge over the river is cracking and unsafe for heavy vehicles."
]

def run_seed(db: Session):
    logger.info("Starting demo data seed...")
    pipeline = RequestPipeline(db)
    
    for i in range(20): # Generate 20 requests for demo
        text = random.choice(SCENARIOS)
        req = CitizenRequest(
            original_text=text,
            country_code="IN",
            source_channel="web",
            language="en",
            status="pending"
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        
        # Process it immediately in the same thread for the demo
        pipeline.run_full_pipeline(str(req.request_id))
        
    logger.info("Demo data seed complete!")
