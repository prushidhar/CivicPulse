def extract_entities(text: str):
    # Simple keyword extraction for demo
    entities = []
    text_lower = text.lower()
    
    # Mock some places
    places = ["village", "city", "street", "district", "highway"]
    for place in places:
        if place in text_lower:
            entities.append({
                "entity_type": "LOCATION",
                "value": place,
                "normalized_value": place.capitalize(),
                "confidence": 0.9
            })
            
    if not entities:
        entities.append({
            "entity_type": "LOCATION",
            "value": "Central District",
            "normalized_value": "Central District",
            "confidence": 0.5
        })
        
    return entities
