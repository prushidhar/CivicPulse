"""initial

Revision ID: 0001
Revises: 
Create Date: 2026-08-18 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import geoalchemy2
import pgvector

# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Extensions should be created by init_db.sh before this runs, but just in case
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    
    op.create_table('citizen_requests',
        sa.Column('request_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('country_code', sa.String(), nullable=True),
        sa.Column('admin_level_1', sa.String(), nullable=True),
        sa.Column('admin_level_2', sa.String(), nullable=True),
        sa.Column('location', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326, from_text='ST_GeomFromEWKT', name='geometry'), nullable=True),
        sa.Column('h3_cell', sa.String(), nullable=True),
        sa.Column('source_channel', sa.String(), nullable=True),
        sa.Column('language', sa.String(), nullable=True),
        sa.Column('script', sa.String(), nullable=True),
        sa.Column('original_text', sa.Text(), nullable=True),
        sa.Column('transcript', sa.Text(), nullable=True),
        sa.Column('translated_text', sa.Text(), nullable=True),
        sa.Column('pii_redacted_text', sa.Text(), nullable=True),
        sa.Column('consent_status', sa.Boolean(), nullable=True),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('subcategory', sa.String(), nullable=True),
        sa.Column('intent', sa.String(), nullable=True),
        sa.Column('severity', sa.String(), nullable=True),
        sa.Column('urgency', sa.String(), nullable=True),
        sa.Column('affected_population', sa.Integer(), nullable=True),
        sa.Column('entities', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('evidence_urls', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('duplicate_cluster_id', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('ai_confidence', sa.Float(), nullable=True),
        sa.Column('geocoding_confidence', sa.Float(), nullable=True),
        sa.Column('human_verified', sa.Boolean(), nullable=True),
        sa.Column('processing_error', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('request_id')
    )
    
    op.create_table('request_media',
        sa.Column('media_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('request_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('object_key', sa.String(), nullable=True),
        sa.Column('media_type', sa.String(), nullable=True),
        sa.Column('content_hash', sa.String(), nullable=True),
        sa.Column('duration', sa.Float(), nullable=True),
        sa.Column('consent', sa.Boolean(), nullable=True),
        sa.Column('retention_until', sa.DateTime(), nullable=True),
        sa.Column('scan_status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['request_id'], ['citizen_requests.request_id'], ),
        sa.PrimaryKeyConstraint('media_id')
    )

    op.create_table('request_clusters',
        sa.Column('cluster_id', sa.String(), nullable=False),
        sa.Column('centroid', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326, from_text='ST_GeomFromEWKT', name='geometry'), nullable=True),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('request_count', sa.Integer(), nullable=True),
        sa.Column('unique_reporters', sa.Integer(), nullable=True),
        sa.Column('trend', sa.Float(), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('cluster_id')
    )

    op.create_table('recommendations',
        sa.Column('recommendation_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('score', sa.Float(), nullable=True),
        sa.Column('rank', sa.Integer(), nullable=True),
        sa.Column('sector', sa.String(), nullable=True),
        sa.Column('project_type', sa.String(), nullable=True),
        sa.Column('rationale', sa.Text(), nullable=True),
        sa.Column('evidence', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('model_version', sa.String(), nullable=True),
        sa.Column('data_version', sa.String(), nullable=True),
        sa.Column('reviewer', sa.String(), nullable=True),
        sa.Column('decision', sa.String(), nullable=True),
        sa.Column('decision_reason', sa.Text(), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('recommendation_id')
    )

    op.create_table('audit_events',
        sa.Column('event_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('actor', sa.String(), nullable=True),
        sa.Column('action', sa.String(), nullable=True),
        sa.Column('object_type', sa.String(), nullable=True),
        sa.Column('object_id', sa.String(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.Column('before_state', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('after_state', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('event_id')
    )

    op.create_table('documents',
        sa.Column('document_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('source_url', sa.String(), nullable=True),
        sa.Column('publisher', sa.String(), nullable=True),
        sa.Column('jurisdiction', sa.String(), nullable=True),
        sa.Column('language', sa.String(), nullable=True),
        sa.Column('publication_date', sa.DateTime(), nullable=True),
        sa.Column('effective_date', sa.DateTime(), nullable=True),
        sa.Column('hash', sa.String(), nullable=True),
        sa.Column('license', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('document_id')
    )

    op.create_table('document_chunks',
        sa.Column('chunk_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('document_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('page', sa.Integer(), nullable=True),
        sa.Column('section', sa.String(), nullable=True),
        sa.Column('text', sa.Text(), nullable=True),
        sa.Column('embedding', pgvector.sqlalchemy.Vector(384), nullable=True),
        sa.Column('retrieval_tags', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['document_id'], ['documents.document_id'], ),
        sa.PrimaryKeyConstraint('chunk_id')
    )


def downgrade() -> None:
    op.drop_table('document_chunks')
    op.drop_table('documents')
    op.drop_table('audit_events')
    op.drop_table('recommendations')
    op.drop_table('request_clusters')
    op.drop_table('request_media')
    op.drop_table('citizen_requests')
