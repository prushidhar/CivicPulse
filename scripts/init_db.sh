#!/bin/bash
set -e

# Wait for DB
until pg_isready -h db -U postgres; do
  echo "Waiting for postgres..."
  sleep 2
done

echo "Postgres is up. Creating extensions if needed..."
# Run SQL to ensure extensions are created. 
# We need both postgis and vector
psql -h db -U postgres -d civicpulse -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql -h db -U postgres -d civicpulse -c "CREATE EXTENSION IF NOT EXISTS vector;"

echo "Running Alembic migrations..."
alembic upgrade head

echo "Starting app..."
uvicorn app.main:app --host 0.0.0.0 --port 8000
