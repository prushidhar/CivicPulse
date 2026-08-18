import pytest
from app.ai.classification.mock_classifier import classify_text

def test_classify_water():
    res = classify_text("We have no drinking water in the village.")
    assert res['category'] == 'Water'

def test_classify_urgency():
    res = classify_text("Urgent! The bridge collapsed.")
    assert res['severity'] == 'high'
    assert res['urgency'] == 'high'
    assert res['category'] == 'Roads'
