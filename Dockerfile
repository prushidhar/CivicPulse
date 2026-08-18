FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including GDAL for GeoPandas
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gdal-bin \
    libgdal-dev \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Ensure scripts are executable
RUN chmod +x /app/scripts/*.sh || true

CMD ["/app/scripts/init_db.sh"]
