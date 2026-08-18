# CivicPulse BRICS Backend

CivicPulse is an AI-powered civic-demand and public-investment decision intelligence platform.

## Architecture
- **FastAPI**: Main web framework
- **Celery & Redis**: Background job processing
- **PostgreSQL & PostGIS & pgvector**: Relational and geospatial data store
- **MinIO**: Object storage for media

## Prerequisites
- Docker
- Docker Compose

## How to Run Locally

1. **Start all services**:
   ```bash
   docker compose up --build
   ```

2. **Accessing Services**:
   - **API Docs**: [http://localhost:8000/api/v1/openapi.json](http://localhost:8000/api/v1/openapi.json) or Swagger at `http://localhost:8000/docs` (if enabled)
   - **MinIO Console**: [http://localhost:9001](http://localhost:9001) (admin/password)
   - **PostgreSQL**: `localhost:5432` (postgres/postgres)

3. **Generate Demo Data**:
   The `DEMO_MODE` flag is enabled by default in `.env.example` and `docker-compose.yml`. This skips actual ML model execution and uses mock logic to demonstrate the processing pipeline.

   Run the demo seeding:
   ```bash
   curl -X POST http://localhost:8000/api/v1/demo/seed
   ```
   Check the Celery worker logs to see the pipeline processing requests.

4. **Testing the APIs**:
   
   Get hotspots:
   ```bash
   curl http://localhost:8000/api/v1/hotspots
   ```
   
   Get recommendations:
   ```bash
   curl http://localhost:8000/api/v1/recommendations
   ```

## Development
- Tests can be run via: `pytest tests/`
- Alembic migrations: `docker compose exec api alembic revision --autogenerate -m "..."`
