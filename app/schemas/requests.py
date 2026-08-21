from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class CitizenRequestCreate(BaseModel):
    text: str = Field(..., description="The citizen's request text")
    country_code: str = Field(..., description="ISO Country code")
    source_channel: str = Field("web", description="Origin of request (web, mobile, sms, etc)")
    language: str = Field("auto", description="Language of text")
    consent: bool = Field(True, description="Citizen gave consent to process")
    latitude: Optional[float] = Field(None, description="GPS Latitude")
    longitude: Optional[float] = Field(None, description="GPS Longitude")
    category: Optional[str] = Field(None, description="Citizen selected category")
    urgency: Optional[str] = Field(None, description="Citizen selected severity/urgency")
    citizen_name: Optional[str] = Field(None, description="Name of the citizen")
    citizen_phone: Optional[str] = Field(None, description="Phone number of the citizen")
    
class CitizenRequestResponse(BaseModel):
    request_id: UUID
    status: str
    received_at: datetime
    
class CitizenRequestDetail(BaseModel):
    request_id: UUID
    status: str
    created_at: datetime
    country_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location: Optional[Dict[str, float]] = None
    category: Optional[str] = None
    intent: Optional[str] = None
    severity: Optional[str] = None
    urgency: Optional[str] = None
    original_text: Optional[str] = None
    description: Optional[str] = None
    translated_text: Optional[str] = None
    pii_redacted_text: Optional[str] = None
    transcript: Optional[str] = None
    ai_confidence: Optional[float] = None
    citizen_name: Optional[str] = None
    citizen_phone: Optional[str] = None
    media: Optional[List[Dict[str, str]]] = None
    
    class Config:
        from_attributes = True

class CitizenRequestStatusUpdate(BaseModel):
    status: str

class RecommendationDecision(BaseModel):
    reviewer: str
    decision: str  # ACCEPT, REJECT, EDIT
    reason: str

