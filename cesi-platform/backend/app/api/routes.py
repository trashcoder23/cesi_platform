from fastapi import APIRouter
from app.services.ranking_service import rank_cities

router = APIRouter()

# Dummy city data for now
cities_data = [
    {
        "name": "Delhi",
        "aqi": 80,
        "heat_index": 70,
        "pollution_volatility": 60,
        "urban_pressure": 75,
        "degradation_rate": 65
    },
    {
        "name": "London",
        "aqi": 40,
        "heat_index": 45,
        "pollution_volatility": 35,
        "urban_pressure": 50,
        "degradation_rate": 30
    },
    {
        "name": "Beijing",
        "aqi": 75,
        "heat_index": 65,
        "pollution_volatility": 70,
        "urban_pressure": 80,
        "degradation_rate": 60
    }
]


@router.get("/ranking")
def get_ranking():
    return rank_cities(cities_data)