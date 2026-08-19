import h3
import time
from app.core.config import settings

def geocode_entities(entities: list, country_code: str):
    """
    Real geocoding using OpenStreetMap Nominatim.
    """
    try:
        from geopy.geocoders import Nominatim
        # Hackathon user agent
        geolocator = Nominatim(user_agent="civicpulse_hackathon")
        
        # Combine location entities into an address string
        locations = [e["value"] for e in entities if e["entity_type"] == "LOCATION"]
        if not locations:
            return None
            
        address = " ".join(locations)
        if country_code:
            address = f"{address}, {country_code}"
            
        location = geolocator.geocode(address)
        if location:
            lat, lon = location.latitude, location.longitude
            point_wkt = f"SRID=4326;POINT({lon} {lat})"
            h3_index = h3.latlng_to_cell(lat, lon, settings.H3_RESOLUTION)
            
            return {
                "point": point_wkt,
                "h3": h3_index,
                "confidence": 0.85
            }
    except Exception as e:
        print(f"Geocoding failed: {e}")
        
    return None
