def classify_text(text: str):
    text_lower = text.lower()
    category = "Other"
    intent = "request_service"
    
    if "water" in text_lower or "drinking" in text_lower or "pipeline" in text_lower:
        category = "Water"
    elif "road" in text_lower or "pothole" in text_lower or "bridge" in text_lower:
        category = "Roads"
    elif "hospital" in text_lower or "clinic" in text_lower or "doctor" in text_lower:
        category = "Healthcare"
    elif "school" in text_lower or "teacher" in text_lower:
        category = "Education"
    elif "internet" in text_lower or "wifi" in text_lower or "network" in text_lower:
        category = "Connectivity"
        
    if "urgent" in text_lower or "emergency" in text_lower or "die" in text_lower:
        severity = "high"
        urgency = "high"
    else:
        severity = "medium"
        urgency = "medium"
        
    return {
        "category": category,
        "intent": intent,
        "severity": severity,
        "urgency": urgency,
        "confidence": 0.85
    }
