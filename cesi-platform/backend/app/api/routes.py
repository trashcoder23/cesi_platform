from fastapi import APIRouter
from app.services.ranking_service import (
    rank_cities,
    investment_priority,
    forecast_city,
    infrastructure_risk,
    get_model_importance
)

router = APIRouter()

@router.get("/ranking")
def get_ranking():
    return rank_cities()


@router.get("/investment-priority")
def get_investment_priority():
    return investment_priority()


@router.get("/forecast/{city_name}")
def get_forecast(city_name: str):
    return forecast_city(city_name)


@router.get("/infrastructure-risk/{city_name}")
def get_infrastructure_risk(city_name: str):
    return infrastructure_risk(city_name)


@router.get("/model-importance")
def model_importance():
    return get_model_importance()