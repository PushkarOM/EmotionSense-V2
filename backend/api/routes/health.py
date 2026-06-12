from fastapi import APIRouter
from core.config import settings

router = APIRouter()


@router.get("/")
async def health_check():
    return {
        "status": "ok",
        "env": settings.APP_ENV,
        "debug": settings.DEBUG,
    }