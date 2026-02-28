import pandas as pd
import joblib
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

    # Create synthetic instability label
    # Cities above median AQI trend considered unstable
    df["unstable"] = (df["aqi_trend"] > df["aqi_trend"].median()).astype(int)

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
        X, y, test_size=0.3, random_state=42
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=5,
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
    print("Loading data...")
    df = load_data()

    print("Training model...")
    model = train_model(df)

    save_model(model)

    print("\nTraining complete 🚀")


if __name__ == "__main__":
    main()