import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import os

INPUT_FILE = "../data/raw/global_synthetic_30_cities.csv"
OUTPUT_FILE = "../data/processed/city_metrics.csv"


# ==========================================
# TREND CALCULATION (ANNUALIZED)
# ==========================================

def calculate_trend_slope(series):
    """
    Returns annual AQI change (not daily).
    """
    X = np.arange(len(series)).reshape(-1, 1)
    y = series.values.reshape(-1, 1)

    model = LinearRegression()
    model.fit(X, y)

    daily_slope = model.coef_[0][0]

    annual_slope = daily_slope * 365  # Convert to yearly change

    return annual_slope


# ==========================================
# PERCENTILE-BASED HEATWAVE DETECTION
# ==========================================

def detect_heatwaves(temp_series, percentile=90):
    """
    Heatwave = temp > 90th percentile
    for >= 3 consecutive days
    """

    threshold = np.percentile(temp_series, percentile)
    extreme_days = temp_series > threshold

    heatwave_count = 0
    consecutive_days = 0

    for is_extreme in extreme_days:
        if is_extreme:
            consecutive_days += 1
            if consecutive_days == 3:
                heatwave_count += 1
        else:
            consecutive_days = 0

    return heatwave_count


# ==========================================
# MAIN FEATURE ENGINEERING
# ==========================================

def main():
    print("Loading dataset...")
    df = pd.read_csv(INPUT_FILE)
    df["date"] = pd.to_datetime(df["date"])

    os.makedirs("../data/processed", exist_ok=True)

    city_metrics = []

    for city in df["city"].unique():
        city_df = df[df["city"] == city].sort_values("date")

        # Air quality metrics
        aqi_mean = city_df["aqi"].mean()
        aqi_volatility = city_df["aqi"].std()
        aqi_trend = calculate_trend_slope(city_df["aqi"])

        # Heat metrics
        heatwave_count = detect_heatwaves(city_df["temperature"])
        avg_heat_index = city_df["heat_index"].mean()

        # Urban metrics
        avg_urban_pressure = city_df["urban_pressure"].mean()
        population_growth = city_df["population_growth"].mean()

        city_metrics.append({
            "city": city,
            "aqi_mean": aqi_mean,
            "aqi_volatility": aqi_volatility,
            "aqi_trend": aqi_trend,
            "heatwave_count": heatwave_count,
            "avg_heat_index": avg_heat_index,
            "avg_urban_pressure": avg_urban_pressure,
            "population_growth": population_growth
        })

        print(f"Processed {city}")

    metrics_df = pd.DataFrame(city_metrics)
    metrics_df.to_csv(OUTPUT_FILE, index=False)

    print("\nCity-level metrics generated successfully 🚀")
    print(f"Total cities processed: {len(metrics_df)}")


if __name__ == "__main__":
    main()