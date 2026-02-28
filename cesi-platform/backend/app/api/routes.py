from fastapi import APIRouter
from app.services.ranking_service import rank_cities, get_model_importance

router = APIRouter()

@router.get("/ranking")
def get_ranking():
    return rank_cities()


@router.get("/model-importance")
def model_importance():
    return get_model_importance()