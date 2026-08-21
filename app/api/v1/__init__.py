from fastapi import APIRouter
from . import requests, hotspots, recommendations, demo, media, auth, catalogs, audit, impact, dashboard_data, transcribe

router = APIRouter()
router.include_router(transcribe.router, tags=["Transcription"])
router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(requests.router, prefix="/requests", tags=["Requests"])
router.include_router(media.router, prefix="/requests", tags=["Media"])
router.include_router(hotspots.router, prefix="/hotspots", tags=["Hotspots"])
router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
router.include_router(impact.router, prefix="/impact", tags=["Impact Analytics"])
router.include_router(dashboard_data.router, tags=["Dashboard Data"])
router.include_router(demo.router, prefix="/demo", tags=["Demo Data"])
router.include_router(catalogs.router, tags=["Data Catalogs"])
router.include_router(audit.router, prefix="/audit", tags=["Audit Trail"])
