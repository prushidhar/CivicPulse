from fastapi import APIRouter
from . import requests, hotspots, recommendations, demo, media, auth, catalogs, audit

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(requests.router, prefix="/requests", tags=["Requests"])
router.include_router(media.router, prefix="/requests", tags=["Media"])
router.include_router(hotspots.router, prefix="/hotspots", tags=["Hotspots"])
router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
router.include_router(demo.router, prefix="/demo", tags=["Demo Data"])
router.include_router(catalogs.router, tags=["Data Catalogs"])
router.include_router(audit.router, prefix="/audit", tags=["Audit Trail"])
