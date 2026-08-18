from fastapi import APIRouter
from . import requests, hotspots, recommendations, demo

router = APIRouter()
router.include_router(requests.router, prefix="/requests", tags=["Requests"])
router.include_router(hotspots.router, prefix="/hotspots", tags=["Hotspots"])
router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
router.include_router(demo.router, prefix="/demo", tags=["Demo Data"])
