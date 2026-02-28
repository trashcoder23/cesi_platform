# ==========================================
# CESI SERVICE
# Climate & Environmental Stability Index
# ==========================================

def normalize(value, min_val, max_val):
    """
    Normalize a value between 0 and 1.
    Handles divide-by-zero safely.
    """
    if max_val - min_val == 0:
        return 0
    return (value - min_val) / (max_val - min_val)


def calculate_cesi(row, global_stats):
    """
    Calculate CESI score for a city using
    weighted multi-factor environmental risks.
    """

    # ---------------------------
    # Normalize Risk Components
    # ---------------------------

    aqi_risk = normalize(
        row["aqi_mean"],
        global_stats["aqi_mean_min"],
        global_stats["aqi_mean_max"]
    )

    volatility_risk = normalize(
        row["aqi_volatility"],
        global_stats["aqi_vol_min"],
        global_stats["aqi_vol_max"]
    )

    trend_risk = normalize(
        row["aqi_trend"],
        global_stats["aqi_trend_min"],
        global_stats["aqi_trend_max"]
    )

    heatwave_risk = normalize(
        row["heatwave_count"],
        global_stats["heatwave_min"],
        global_stats["heatwave_max"]
    )

    urban_risk = normalize(
        row["avg_urban_pressure"],
        global_stats["urban_min"],
        global_stats["urban_max"]
    )

    population_risk = normalize(
        row["population_growth"],
        global_stats["pop_min"],
        global_stats["pop_max"]
    )

    # ---------------------------
    # Weighted Risk Aggregation
    # ---------------------------

    total_risk = (
        0.30 * aqi_risk +
        0.20 * volatility_risk +
        0.20 * trend_risk +
        0.15 * heatwave_risk +
        0.10 * urban_risk +
        0.05 * population_risk
    )

    # Convert risk → stability score
    cesi_score = round((1 - total_risk) * 100, 2)

    return cesi_score


def classify_risk(cesi_score):
    """
    Classify environmental stability level
    based on CESI score.
    """

    if cesi_score >= 70:
        return "Stable"
    elif cesi_score >= 40:
        return "Warning"
    else:
        return "Critical"