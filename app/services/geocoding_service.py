import h3
import random
from app.core.config import settings

def geocode_entities(entities: list, country_code: str):
    # Mock geocoding. Returns a random point in a plausible bounding box.
    # For demo, let's just use a fixed central point with some jitter
    base_lat, base_lon = 20.0, 78.0 # Approx center of India if IN
    if country_code == "BR":
        base_lat, base_lon = -14.0, -51.0
    elif country_code == "ZA":
        base_lat, base_lon = -30.0, 25.0
        
    lat = base_lat + random.uniform(-2.0, 2.0)
    lon = base_lon + random.uniform(-2.0, 2.0)
    
    # We construct WKT for PostGIS: 'SRID=4326;POINT(lon lat)'
    point_wkt = f"SRID=4326;POINT({lon} {lat})"
    
    h3_index = h3.latlng_to_cell(lat, lon, settings.H3_RESOLUTION)
    
    return {
        "point": point_wkt,
        "h3": h3_index,
        "confidence": 0.8
    }
