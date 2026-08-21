"""add citizen details

Revision ID: 0002_add_citizen_details
Revises: 0001_initial
Create Date: 2026-08-21 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002_add_citizen_details'
down_revision = '0001'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('citizen_requests', sa.Column('citizen_name', sa.String(), nullable=True))
    op.add_column('citizen_requests', sa.Column('citizen_phone', sa.String(), nullable=True))

def downgrade() -> None:
    op.drop_column('citizen_requests', 'citizen_phone')
    op.drop_column('citizen_requests', 'citizen_name')
