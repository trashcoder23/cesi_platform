import pandas as pd
import joblib

from app.services.cesi_service import calculate_cesi, classify_risk

# ==========================================
# FILE PATHS
# ==========================================

METRICS_FILE = "../data/processed/city_metrics.csv"
MODEL_PATH = "../ml/instability_model.pkl"

# Load ML model once (not inside loop)
model = joblib.load(MODEL_PATH)


# ==========================================
# RANKING FUNCTION
# ==========================================

def rank_cities():
    df = pd.read_csv(METRICS_FILE)

    # ---------------------------
    # Global Normalization Stats
    # ---------------------------

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

    # ---------------------------
    # Compute CESI + ML Probability
    # ---------------------------

    for _, row in df.iterrows():
        cesi = calculate_cesi(row, global_stats)
        risk_level = classify_risk(cesi)

        # ML features
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

        ranked.append({
            "city": row["city"],
            "cesi": cesi,
            "risk_level": risk_level,
            "aqi_trend": round(row["aqi_trend"], 3),
            "heatwave_count": int(row["heatwave_count"]),
            "urban_pressure": round(row["avg_urban_pressure"], 2),
            "instability_probability": round(float(probability), 3)
        })

    # ---------------------------
    # Sort by lowest CESI (most unstable first)
    # ---------------------------

    ranked.sort(key=lambda x: x["cesi"])

    return ranked