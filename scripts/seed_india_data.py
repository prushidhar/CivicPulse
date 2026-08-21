import os
import sys
import uuid
from datetime import datetime, timedelta
import random

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.models import CitizenRequest
from app.services.pipeline_service import RequestPipeline

# Realistic locations across India
LOCATIONS = [
    {"city": "New Delhi", "lat": 28.6139, "lng": 77.2090},
    {"city": "Mumbai", "lat": 19.0760, "lng": 72.8777},
    {"city": "Bangalore", "lat": 12.9716, "lng": 77.5946},
    {"city": "Hyderabad", "lat": 17.3850, "lng": 78.4867},
    {"city": "Chennai", "lat": 13.0827, "lng": 80.2707},
    {"city": "Pune", "lat": 18.5204, "lng": 73.8567},
    {"city": "Kolkata", "lat": 22.5726, "lng": 88.3639},
    {"city": "Ahmedabad", "lat": 23.0225, "lng": 72.5714},
    {"city": "Jaipur", "lat": 26.9124, "lng": 75.7873},
    {"city": "Lucknow", "lat": 26.8467, "lng": 80.9462},
]

ISSUES = [
    {"text": "Massive pothole on the main road, causing accidents daily.", "cat": "infrastructure", "urg": "high"},
    {"text": "Street lights have been broken for 3 weeks, very unsafe at night.", "cat": "safety", "urg": "high"},
    {"text": "Garbage has not been collected for a week, terrible smell.", "cat": "sanitation", "urg": "medium"},
    {"text": "Water pipe burst, flooding the street.", "cat": "water", "urg": "critical"},
    {"text": "Traffic signals at the intersection are completely dead.", "cat": "traffic", "urg": "high"},
    {"text": "Stray dogs are getting aggressive in the neighborhood.", "cat": "safety", "urg": "medium"},
    {"text": "Public park equipment is broken and dangerous for children.", "cat": "infrastructure", "urg": "low"},
    {"text": "Open manhole on the sidewalk, someone could fall in.", "cat": "safety", "urg": "critical"},
    {"text": "Illegal dumping of construction waste on empty plot.", "cat": "sanitation", "urg": "medium"},
    {"text": "Drinking water supply is muddy and smells bad.", "cat": "water", "urg": "critical"},
]

def generate_random_point_around(lat, lng, radius_km=5):
    # Roughly 1 deg lat = 111km
    delta_lat = (random.random() * 2 - 1) * (radius_km / 111.0)
    delta_lng = (random.random() * 2 - 1) * (radius_km / (111.0 * random.random()))
    return lat + delta_lat, lng + delta_lng

def seed_database():
    db = SessionLocal()
    pipeline = RequestPipeline(db)
    
    print("Seeding database with realistic India data...")
    
    # Generate 25 reports
    for i in range(25):
        loc = random.choice(LOCATIONS)
        issue = random.choice(ISSUES)
        
        plat, plng = generate_random_point_around(loc["lat"], loc["lng"])
        
        # Create request
        req = CitizenRequest(
            request_id=uuid.uuid4(),
            original_text=issue["text"],
            country_code="IN",
            source_channel="web",
            language="auto",
            consent_status=True,
            citizen_name=f"Citizen {i}",
            location=f"SRID=4326;POINT({plng} {plat})",
            severity=issue["urg"],
            category=issue["cat"],
            status="pending",
            created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 72))
        )
        
        db.add(req)
        db.commit()
        db.refresh(req)
        
        print(f"[{i+1}/25] Created report in {loc['city']}: {issue['text'][:30]}...")
        
        # Run AI pipeline (will use Gemini to classify and generate H3)
        try:
            pipeline.run_full_pipeline(str(req.request_id))
        except Exception as e:
            print(f"  -> Pipeline error (skipping AI for this one): {e}")
            
    print("Seeding complete! You now have a populated map across India.")
    db.close()

if __name__ == "__main__":
    seed_database()
