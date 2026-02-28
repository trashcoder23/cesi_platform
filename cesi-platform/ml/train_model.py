import pandas as pd
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import os

# ==========================================
# CONFIG
# ==========================================

INPUT_FILE = "../data/processed/city_metrics.csv"
MODEL_OUTPUT = "instability_model.pkl"


# ==========================================
# LOAD DATA
# ==========================================

def load_data():
    df = pd.read_csv(INPUT_FILE)

    # --------------------------------------
    # REALISTIC INSTABILITY DEFINITION
    # --------------------------------------
    # Instability = compound high stress
    # Top quartile of deterioration metrics

    aqi_threshold = df["aqi_trend"].quantile(0.75)
    heat_threshold = df["heatwave_count"].quantile(0.75)
    vol_threshold = df["aqi_volatility"].quantile(0.75)

    df["unstable"] = (
        (
            (df["aqi_trend"] > aqi_threshold) &
            (df["heatwave_count"] > heat_threshold)
        )
        |
        (df["aqi_volatility"] > vol_threshold)
    )

    df["unstable"] = df["unstable"].astype(int)

    return df


# ==========================================
# TRAIN MODEL
# ==========================================

def train_model(df):
    features = [
        "aqi_mean",
        "aqi_volatility",
        "aqi_trend",
        "heatwave_count",
        "avg_heat_index",
        "avg_urban_pressure",
        "population_growth"
    ]

    X = df[features]
    y = df["unstable"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.3,
        random_state=42,
        stratify=y  # ensures class balance
    )

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=6,
        min_samples_split=4,
        random_state=42
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    print("\nModel Evaluation:")
    print(classification_report(y_test, y_pred))

    return model


# ==========================================
# SAVE MODEL
# ==========================================

def save_model(model):
    joblib.dump(model, MODEL_OUTPUT)
    print(f"\nModel saved as {MODEL_OUTPUT}")


# ==========================================
# MAIN
# ==========================================

def main():
    print("Loading engineered city metrics...")
    df = load_data()

    print("Training instability model...")
    model = train_model(df)

    save_model(model)

    print("\nTraining complete 🚀")


if __name__ == "__main__":
    main()