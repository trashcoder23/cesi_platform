import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

# ===================================
# CONFIG
# ===================================

YEARS = 5
START_DATE = datetime(2019, 1, 1)
DAYS = YEARS * 365

OUTPUT_FILE = "../data/raw/global_synthetic_30_cities.csv"

# 3 categories
CITY_CATEGORIES = {
    "stable": {
        "cities": ["Zurich","Oslo","Vancouver","Copenhagen","Helsinki",
                   "Singapore","Vienna","Stockholm","Reykjavik","Sydney"],
        "aqi_trend": -0.2,
        "temp_trend": 0.05,
        "acceleration": 0.0
    },
    "moderate": {
        "cities": ["Paris","Berlin","Tokyo","Madrid","Rome",
                   "Seoul","Toronto","Chicago","Melbourne","Lisbon"],
        "aqi_trend": 0.6,
        "temp_trend": 0.1,
        "acceleration": 0.1
    },
    "rapid": {
        "cities": ["Delhi","Beijing","Jakarta","Bangkok","Cairo",
                   "Mexico City","Mumbai","Lagos","Karachi","Manila"],
        "aqi_trend": 1.2,
        "temp_trend": 0.2,
        "acceleration": 0.3
    }
}


# ===================================
# HEAT INDEX FUNCTION
# ===================================

def compute_heat_index(temp, humidity):
    return temp + 0.1 * humidity


# ===================================
# DATA GENERATOR
# ===================================

def generate_city_data(city, category_config):
    rows = []

    base_aqi = np.random.uniform(35, 80)
    base_temp = np.random.uniform(20, 30)
    base_humidity = np.random.uniform(50, 70)

    urban_pressure = np.random.uniform(40, 80)
    population_growth = np.random.uniform(0.5, 3.0)

    for day in range(DAYS):
        current_date = START_DATE + timedelta(days=day)

        seasonal_temp = 10 * np.sin(2 * np.pi * day / 365)
        seasonal_aqi = 8 * np.sin(2 * np.pi * day / 365)

        yearly_factor = day / 365

        aqi = (
            base_aqi +
            category_config["aqi_trend"] * yearly_factor +
            category_config["acceleration"] * (yearly_factor ** 2) +
            seasonal_aqi +
            np.random.normal(0, 5)
        )

        temp = (
            base_temp +
            category_config["temp_trend"] * yearly_factor +
            seasonal_temp +
            np.random.normal(0, 2)
        )

        humidity = (
            base_humidity +
            15 * np.cos(2 * np.pi * day / 365) +
            np.random.normal(0, 5)
        )

        heat_index = compute_heat_index(temp, humidity)

        # simulate urban pressure increasing slowly
        urban_pressure_today = urban_pressure + 0.2 * yearly_factor

        rows.append([
            city,
            current_date,
            max(10, aqi),
            temp,
            humidity,
            heat_index,
            urban_pressure_today,
            population_growth
        ])

    return rows


# ===================================
# MAIN
# ===================================

def main():
    all_rows = []

    for category, config in CITY_CATEGORIES.items():
        for city in config["cities"]:
            city_rows = generate_city_data(city, config)
            all_rows.extend(city_rows)
            print(f"Generated data for {city}")

    df = pd.DataFrame(all_rows, columns=[
        "city",
        "date",
        "aqi",
        "temperature",
        "humidity",
        "heat_index",
        "urban_pressure",
        "population_growth"
    ])

    os.makedirs("../data/raw", exist_ok=True)
    df.to_csv(OUTPUT_FILE, index=False)

    print("\nGlobal synthetic dataset created successfully 🚀")
    print(f"Total rows: {len(df)}")


if __name__ == "__main__":
    main()