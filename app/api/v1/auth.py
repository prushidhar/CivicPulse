from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import create_access_token
from typing import Dict

router = APIRouter()

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Dict[str, str]:
    # Mock authentication for ultimate demo
    if form_data.username == "admin" and form_data.password == "admin":
        role = "administrator"
    elif form_data.username == "official" and form_data.password == "official":
        role = "government_official"
    else:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    access_token = create_access_token(subject=form_data.username, role=role)
    return {"access_token": access_token, "token_type": "bearer"}
