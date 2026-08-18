import os
from sqlalchemy import create_engine, text

# URL encoded password from the screenshot: CivicPulse2026!
DB_URL = "postgresql://postgres:CivicPulse2026%21@34.9.198.190:5432/postgres"

def init_db():
    print(f"Connecting to Google Cloud SQL at 34.9.198.190...")
    try:
        engine = create_engine(DB_URL, isolation_level="AUTOCOMMIT")
        with engine.connect() as conn:
            print("Successfully connected! Enabling extensions...")
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            print("Extensions enabled successfully.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    init_db()
