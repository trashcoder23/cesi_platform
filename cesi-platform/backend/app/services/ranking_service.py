import pandas as pd
import joblib
import numpy as np

from app.services.cesi_service import calculate_cesi, classify_risk

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
# HELPER: NORMALIZATION
# ==========================================

def normalize(value, min_val, max_val):
    if max_val - min_val == 0:
        return 0
    return (value - min_val) / (max_val - min_val)


# ==========================================
# CORE RANKING (Now Includes Momentum)
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

        # 🔥 Instability Momentum
        momentum = row["aqi_trend"] * row["aqi_volatility"]

        ranked.append({
            "city": row["city"],
            "cesi": round(float(cesi), 2),
            "risk_level": risk_level,
            "instability_probability": round(float(probability), 3),
            "instability_momentum": round(float(momentum), 3)
        })

    ranked.sort(key=lambda x: x["cesi"])
    return ranked


# ==========================================
# 1️⃣ INVESTMENT PRIORITY (Normalized & Rigorous)
# ==========================================

def investment_priority():
    df = pd.read_csv(METRICS_FILE)

    cesi_min, cesi_max = df["aqi_mean"].min(), df["aqi_mean"].max()
    urban_min, urban_max = df["avg_urban_pressure"].min(), df["avg_urban_pressure"].max()
    pop_min, pop_max = df["population_growth"].min(), df["population_growth"].max()
    heat_min, heat_max = df["heatwave_count"].min(), df["heatwave_count"].max()

    results = []

    for _, row in df.iterrows():

        norm_urban = normalize(row["avg_urban_pressure"], urban_min, urban_max)
        norm_pop = normalize(row["population_growth"], pop_min, pop_max)
        norm_heat = normalize(row["heatwave_count"], heat_min, heat_max)

        # Recompute CESI for normalization
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

        cesi = calculate_cesi(row, global_stats)
        norm_cesi = cesi / 100

        priority_score = (
            0.4 * (1 - norm_cesi) +
            0.3 * norm_urban +
            0.2 * norm_pop +
            0.1 * norm_heat
        )

        results.append({
            "city": row["city"],
            "investment_priority_score": round(float(priority_score * 100), 2)
        })

    results.sort(key=lambda x: x["investment_priority_score"], reverse=True)
    return results


# ==========================================
# 2️⃣ 3-YEAR MULTI-FACTOR FORECAST
# ==========================================

def forecast_city(city_name):
    df = pd.read_csv(METRICS_FILE)
    city = df[df["city"] == city_name]

    if city.empty:
        return {"error": "City not found"}

    row = city.iloc[0]

    # Project metrics
    projected_aqi = row["aqi_mean"] + 3 * row["aqi_trend"]
    projected_heat = row["heatwave_count"] * 1.1  # assume mild growth
    projected_urban = row["avg_urban_pressure"] * 1.05

    projected_row = row.copy()
    projected_row["aqi_mean"] = projected_aqi
    projected_row["heatwave_count"] = projected_heat
    projected_row["avg_urban_pressure"] = projected_urban

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

    projected_cesi = calculate_cesi(projected_row, global_stats)
    projected_risk = classify_risk(projected_cesi)

    return {
        "city": city_name,
        "current_aqi_mean": round(float(row["aqi_mean"]), 2),
        "projected_aqi_3_years": round(float(projected_aqi), 2),
        "projected_cesi": round(float(projected_cesi), 2),
        "forecast_risk_level": projected_risk
    }


# ==========================================
# 3️⃣ INFRASTRUCTURE RISK
# ==========================================

def infrastructure_risk(city_name):
    df = pd.read_csv(METRICS_FILE)
    city = df[df["city"] == city_name]

    if city.empty:
        return {"error": "City not found"}

    row = city.iloc[0]
    risks = []

    if row["heatwave_count"] > df["heatwave_count"].quantile(0.75):
        risks.append("Power Grid Stress (Extreme Heat)")

    if row["aqi_volatility"] > df["aqi_volatility"].quantile(0.75):
        risks.append("Public Health Burden (Air Pollution Variability)")

    if row["avg_urban_pressure"] > df["avg_urban_pressure"].quantile(0.75):
        risks.append("Transport & Housing Infrastructure Stress")

    if row["population_growth"] > df["population_growth"].quantile(0.75):
        risks.append("Water & Resource Demand Surge")

    if not risks:
        risks.append("No Critical Infrastructure Stress Detected")

    return {
        "city": city_name,
        "high_risk_sectors": risks
    }


# ==========================================
# MODEL IMPORTANCE
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