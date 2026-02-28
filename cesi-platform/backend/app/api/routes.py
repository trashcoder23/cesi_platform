from fastapi import APIRouter
from app.services.ranking_service import rank_cities

router = APIRouter()

@router.get("/ranking")
def get_ranking():
    return rank_cities()