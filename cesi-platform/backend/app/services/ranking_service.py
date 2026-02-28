import pandas as pd
import joblib
import numpy as np

from app.services.cesi_service import calculate_cesi, classify_risk

# ==========================================
# FILE PATHS
# ==========================================

METRICS_FILE = "../data/processed/city_metrics.csv"
MODEL_PATH = "../ml/instability_model.pkl"

model = joblib.load(MODEL_PATH)

FEATURE_NAMES = [
    "aqi_mean",
    "aqi_volatility",
    "aqi_trend",
    "heatwave_count",
    "avg_heat_index",
    "avg_urban_pressure",
    "population_growth"
]


# ==========================================
# HELPER: Identify Top Risk Driver
# ==========================================

def get_top_risk_driver(row):
    """
    Identify which metric contributes most
    to instability (based on normalized magnitude).
    """

    risk_factors = {
        "High AQI Trend": abs(row["aqi_trend"]),
        "High AQI Volatility": abs(row["aqi_volatility"]),
        "Frequent Heatwaves": row["heatwave_count"],
        "Urban Pressure": row["avg_urban_pressure"],
        "Population Growth": row["population_growth"]
    }

    top_driver = max(risk_factors, key=risk_factors.get)

    return top_driver


# ==========================================
# RANKING FUNCTION
# ==========================================

def rank_cities():
    df = pd.read_csv(METRICS_FILE)

    global_stats = {
        "aqi_mean_min": df["aqi_mean"].min(),
        "aqi_mean_max": df["aqi_mean"].max(),
        "aqi_vol_min": df["aqi_volatility"].min(),
        "aqi_vol_max": df["aqi_volatility"].max(),
        "aqi_trend_min": df["aqi_trend"].min(),
        "aqi_trend_max": df["aqi_trend"].max(),
        "heatwave_min": df["heatwave_count"].min(),
        "heatwave_max": df["heatwave_count"].max(),
        "urban_min": df["avg_urban_pressure"].min(),
        "urban_max": df["avg_urban_pressure"].max(),
        "pop_min": df["population_growth"].min(),
        "pop_max": df["population_growth"].max(),
    }

    ranked = []

    for _, row in df.iterrows():
        cesi = calculate_cesi(row, global_stats)
        risk_level = classify_risk(cesi)

        features = [[
            row["aqi_mean"],
            row["aqi_volatility"],
            row["aqi_trend"],
            row["heatwave_count"],
            row["avg_heat_index"],
            row["avg_urban_pressure"],
            row["population_growth"]
        ]]

        probability = model.predict_proba(features)[0][1]

        top_driver = get_top_risk_driver(row)

        ranked.append({
            "city": row["city"],
            "cesi": cesi,
            "risk_level": risk_level,
            "instability_probability": round(float(probability), 3),
            "top_risk_driver": top_driver
        })

    ranked.sort(key=lambda x: x["cesi"])

    return ranked


# ==========================================
# GLOBAL MODEL EXPLAINABILITY
# ==========================================

def get_model_importance():
    importance = model.feature_importances_

    importance_data = []

    for name, value in zip(FEATURE_NAMES, importance):
        importance_data.append({
            "feature": name,
            "importance": round(float(value), 4)
        })

    importance_data.sort(key=lambda x: x["importance"], reverse=True)

    return importance_data