import logging
from app.workers.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.models import CitizenRequest
from app.services.pipeline_service import RequestPipeline

logger = logging.getLogger(__name__)

@celery_app.task(name="process_citizen_request")
def process_citizen_request(request_id: str):
    logger.info(f"Processing request: {request_id}")
    db = SessionLocal()
    try:
        pipeline = RequestPipeline(db)
        pipeline.run_full_pipeline(request_id)
    except Exception as e:
        logger.error(f"Error processing request {request_id}: {str(e)}")
        req = db.query(CitizenRequest).filter(CitizenRequest.request_id == request_id).first()
        if req:
            req.status = "error"
            req.processing_error = str(e)
            db.commit()
    finally:
        db.close()
