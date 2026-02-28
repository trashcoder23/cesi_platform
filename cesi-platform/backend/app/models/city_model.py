from pydantic import BaseModel


class City(BaseModel):
    name: str
    aqi: float
    heat_index: float
    pollution_volatility: float
    urban_pressure: float
    degradation_rate: float