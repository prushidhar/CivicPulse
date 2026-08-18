import pytest
from unittest.mock import MagicMock
from app.services.priority_service import calculate_priority

def test_priority_calculation():
    # Mock DB session and Cluster
    mock_db = MagicMock()
    mock_cluster = MagicMock()
    mock_cluster.request_count = 10
    mock_cluster.trend = 0.5
    
    mock_db.query().filter().first.return_value = mock_cluster
    
    result = calculate_priority(mock_db, "cluster-123")
    
    assert "score" in result
    assert "components" in result
    assert result["components"]["demand_intensity"] == 25.0 # Maxes out at 25.0
    assert result["components"]["trend"] == 5.0
