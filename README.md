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

## Frontends
The frontends are built with Next.js and are structured as separate dashboards:
- `citizen-dashboard/`: The Citizen-Facing Experience for reporting and tracking issues.
- `government-dashboard/`: The Government-Facing Experience (to be built).

## Team Sync (Frontend & Database)
When syncing with the other teams managing the **Frontend** and **Database**:
1. Duplicate `.env.prod.example` as `.env`.
2. Fill in the `FRONTEND_URL` (this sets the backend's CORS policies to allow their requests).
3. Fill in the `DATABASE_URL` and `REDIS_URL` endpoints provided by the DB team.
4. Run the decoupled stack:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
This drops the local Postgres/Redis/MinIO services and forces the API and Worker to point strictly to the external managed sources.
