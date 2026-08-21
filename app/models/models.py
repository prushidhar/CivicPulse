from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from pgvector.sqlalchemy import Vector
import uuid
from datetime import datetime
from app.core.database import Base

class CitizenRequest(Base):
    __tablename__ = "citizen_requests"
    request_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    country_code = Column(String)
    admin_level_1 = Column(String)
    admin_level_2 = Column(String)
    location = Column(Geometry('POINT', srid=4326))
    h3_cell = Column(String)
    source_channel = Column(String)
    language = Column(String)
    script = Column(String)
    original_text = Column(Text)
    transcript = Column(Text)
    translated_text = Column(Text)
    pii_redacted_text = Column(Text)
    consent_status = Column(Boolean, default=True)
    citizen_name = Column(String, nullable=True)
    citizen_phone = Column(String, nullable=True)
    category = Column(String)
    subcategory = Column(String)
    intent = Column(String)
    severity = Column(String)
    urgency = Column(String)
    affected_population = Column(Integer)
    entities = Column(JSONB)
    evidence_urls = Column(JSONB)
    duplicate_cluster_id = Column(String)
    status = Column(String, default="pending")
    ai_confidence = Column(Float)
    geocoding_confidence = Column(Float)
    human_verified = Column(Boolean, default=False)
    processing_error = Column(Text)

class RequestMedia(Base):
    __tablename__ = "request_media"
    media_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("citizen_requests.request_id"))
    object_key = Column(String)
    media_type = Column(String)
    content_hash = Column(String)
    duration = Column(Float)
    consent = Column(Boolean, default=True)
    retention_until = Column(DateTime)
    scan_status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class RequestCluster(Base):
    __tablename__ = "request_clusters"
    cluster_id = Column(String, primary_key=True)
    centroid = Column(Geometry('POINT', srid=4326))
    category = Column(String)
    request_count = Column(Integer, default=1)
    unique_reporters = Column(Integer, default=1)
    trend = Column(Float)
    confidence = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class GeoUnit(Base):
    __tablename__ = "geo_units"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    country_code = Column(String)
    admin_level = Column(Integer)
    name = Column(String)
    code = Column(String)
    geometry = Column(Geometry('MULTIPOLYGON', srid=4326))
    population = Column(Integer)
    metadata_ = Column("metadata", JSONB)

class H3Cell(Base):
    __tablename__ = "h3_cells"
    h3_index = Column(String, primary_key=True)
    resolution = Column(Integer)
    geometry = Column(Geometry('POLYGON', srid=4326))
    administrative_unit = Column(String)

class Indicator(Base):
    __tablename__ = "indicators"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    indicator_code = Column(String)
    value = Column(Float)
    unit = Column(String)
    geography = Column(String)
    period = Column(String)
    source = Column(String)

class InfrastructureAsset(Base):
    __tablename__ = "infrastructure_assets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_type = Column(String)
    geometry = Column(Geometry('POINT', srid=4326))
    capacity = Column(Float)
    condition = Column(String)
    source = Column(String)
    date = Column(DateTime)

class InvestmentProject(Base):
    __tablename__ = "investment_projects"
    project_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String)
    sector = Column(String)
    budget = Column(Float)
    geometry = Column(Geometry('POINT', srid=4326))
    status = Column(String)
    planned_start = Column(DateTime)
    planned_end = Column(DateTime)
    source = Column(String)

class Recommendation(Base):
    __tablename__ = "recommendations"
    recommendation_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    score = Column(Float)
    rank = Column(Integer)
    sector = Column(String)
    project_type = Column(String)
    rationale = Column(Text)
    evidence = Column(JSONB)
    model_version = Column(String)
    data_version = Column(String)
    reviewer = Column(String)
    decision = Column(String)
    decision_reason = Column(Text)
    confidence = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"
    document_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_url = Column(String)
    publisher = Column(String)
    jurisdiction = Column(String)
    language = Column(String)
    publication_date = Column(DateTime)
    effective_date = Column(DateTime)
    hash = Column(String)
    license = Column(String)

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    chunk_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.document_id"))
    page = Column(Integer)
    section = Column(String)
    text = Column(Text)
    embedding = Column(Vector(768)) # Using 768 for Google Gemini text-embedding-004
    retrieval_tags = Column(JSONB)

class AuditEvent(Base):
    __tablename__ = "audit_events"
    event_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor = Column(String)
    action = Column(String)
    object_type = Column(String)
    object_id = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    before_state = Column(JSONB)
    after_state = Column(JSONB)
    reason = Column(Text)

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    external_identity_subject = Column(String, unique=True, index=True)
    role = Column(String)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ImpactMetric(Base):
    __tablename__ = "impact_metrics"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True))
    metric = Column(String)
    baseline = Column(Float)
    target = Column(Float)
    observed_result = Column(Float)
    period = Column(String)
    method = Column(String)
    source = Column(String)

class Dataset(Base):
    __tablename__ = "datasets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    source = Column(String)
    description = Column(Text)
    url = Column(String)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
