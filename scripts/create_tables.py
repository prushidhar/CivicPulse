from dotenv import load_dotenv
load_dotenv() # Load variables from .env BEFORE app modules are imported

from app.core.database import Base, engine
from app.models.models import *

print("Creating all database tables in Google Cloud SQL...")
try:
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
except Exception as e:
    print(f"Failed to create tables: {e}")
