from dotenv import load_dotenv
load_dotenv()

from app.core.database import SessionLocal
from app.models.models import CitizenRequest
from sqlalchemy import text

def test_db():
    print("Testing DB connection from FastAPI Session...")
    try:
        db = SessionLocal()
        # Test basic connection
        result = db.execute(text("SELECT 1")).scalar()
        print(f"Basic connection test: {'SUCCESS' if result == 1 else 'FAILED'}")
        
        # Test table mapping
        count = db.query(CitizenRequest).count()
        print(f"CitizenRequest table access: SUCCESS (Current row count: {count})")
        
        db.close()
        return True
    except Exception as e:
        print(f"DB Test FAILED: {e}")
        return False

if __name__ == "__main__":
    test_db()
