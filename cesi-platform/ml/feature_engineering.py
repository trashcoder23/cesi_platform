import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

INPUT_FILE = "../data/raw/global_synthetic_30_cities.csv"


def calculate_trend_slope(series):
    X = np.arange(len(series)).reshape(-1, 1)
    y = series.values.reshape(-1, 1)
    model = LinearRegression()
    model.fit(X, y)
    return model.coef_[0][0]


def detect_heatwaves(temp_series, threshold=40):
    heatwave_days = temp_series > threshold
    return heatwave_days.sum()


def main():
    df = pd.read_csv(INPUT_FILE)
    df["date"] = pd.to_datetime(df["date"])

    city_metrics = []

    for city in df["city"].unique():
        city_df = df[df["city"] == city].sort_values("date")

        aqi_mean = city_df["aqi"].mean()
        aqi_volatility = city_df["aqi"].std()
        aqi_trend = calculate_trend_slope(city_df["aqi"])
        heatwave_count = detect_heatwaves(city_df["temperature"])
        avg_heat_index = city_df["heat_index"].mean()
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

    metrics_df = pd.DataFrame(city_metrics)
    metrics_df.to_csv("../data/processed/city_metrics.csv", index=False)

    print("City-level metrics generated successfully 🚀")
    print(metrics_df.head())


if __name__ == "__main__":
    main()