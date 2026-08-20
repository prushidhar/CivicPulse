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
    
class CitizenRequestResponse(BaseModel):
    request_id: UUID
    status: str
    received_at: datetime
    
class CitizenRequestDetail(BaseModel):
    request_id: UUID
    status: str
    created_at: datetime
    country_code: str
    location: Optional[Dict[str, float]] = None
    category: Optional[str] = None
    intent: Optional[str] = None
    severity: Optional[str] = None
    urgency: Optional[str] = None
    original_text: Optional[str] = None
    description: Optional[str] = None
    translated_text: Optional[str] = None
    pii_redacted_text: Optional[str] = None
    
    class Config:
        from_attributes = True

class RecommendationDecision(BaseModel):
    reviewer: str
    decision: str  # ACCEPT, REJECT, EDIT
    reason: str

