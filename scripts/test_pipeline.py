import os
import sys

# Add app to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.models.models import CitizenRequest
from app.services.pipeline_service import RequestPipeline

db = SessionLocal()
try:
    # Get a pending request or the one from the screenshot: 6e250d63-f366-47bd-91d2-c9a4a8f614ef2
    # Wait, that's in the Vercel DB. Let's just create a dummy one locally.
    req = CitizenRequest(
        original_text="fhdth",
        country_code="US",
        source_channel="web",
        language="en",
        consent_status=True,
        status="pending"
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    
    print(f"Testing pipeline for request: {req.request_id}")
    pipeline = RequestPipeline(db)
    pipeline.run_full_pipeline(str(req.request_id))
    
    db.refresh(req)
    print(f"Result Category: {req.category}")
    print(f"Result Severity: {req.severity}")
    
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
