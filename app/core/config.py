import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CivicPulse BRICS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/civicpulse")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "admin")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "password")
    MINIO_BUCKET: str = os.getenv("MINIO_BUCKET", "civicpulse-media")
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecretjwtkeythatshouldbechangedinproduction")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "True").lower() in ("true", "1", "yes")
    H3_RESOLUTION: int = int(os.getenv("H3_RESOLUTION", "9"))
    DUPLICATE_THRESHOLD: float = float(os.getenv("DUPLICATE_THRESHOLD", "0.75"))
    
    class Config:
        case_sensitive = True

settings = Settings()
