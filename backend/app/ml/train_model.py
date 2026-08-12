import os
import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
)

# Reproducible simulated telemetry
np.random.seed(42)

NUM_SAMPLES = 5000

# -------------------------------------------------
# 1. Generate simulated spacecraft telemetry
# -------------------------------------------------

battery = np.random.uniform(0, 100, NUM_SAMPLES)
temperature = np.random.uniform(-10, 100, NUM_SAMPLES)
solar_panel = np.random.uniform(0, 100, NUM_SAMPLES)

# Add small sensor variations
battery_noise = np.random.normal(0, 3, NUM_SAMPLES)
temperature_noise = np.random.normal(0, 2, NUM_SAMPLES)
solar_noise = np.random.normal(0, 3, NUM_SAMPLES)

battery_observed = np.clip(battery + battery_noise, 0, 100)
temperature_observed = temperature + temperature_noise
solar_observed = np.clip(solar_panel + solar_noise, 0, 100)


# -------------------------------------------------
# 2. Create health labels using combined risk
# -------------------------------------------------

def classify_health(battery, temperature, solar):
    risk_score = 0

    # Battery contribution
    if battery < 20:
        risk_score += 3
    elif battery < 40:
        risk_score += 1

    # Temperature contribution
    if temperature > 80:
        risk_score += 3
    elif temperature > 60 or temperature < 0:
        risk_score += 1

    # Solar-panel contribution
    if solar < 30:
        risk_score += 3
    elif solar < 50:
        risk_score += 1

    # Combined subsystem risk
    if battery < 50 and solar < 55:
        risk_score += 1

    if temperature > 55 and battery < 50:
        risk_score += 1

    if risk_score >= 4:
        return "Critical"

    elif risk_score >= 2:
        return "Warning"

    return "Healthy"


health_status = [
    classify_health(b, t, s)
    for b, t, s in zip(
        battery,
        temperature,
        solar_panel
    )
]


# -------------------------------------------------
# 3. Build dataset
# -------------------------------------------------

data = pd.DataFrame({
    "battery": battery_observed,
    "temperature": temperature_observed,
    "solar_panel": solar_observed,
    "health_status": health_status,
})


X = data[
    ["battery", "temperature", "solar_panel"]
]

y = data["health_status"]


# -------------------------------------------------
# 4. Create unseen test dataset
# -------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)


# -------------------------------------------------
# 5. Train Random Forest
# -------------------------------------------------

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    max_depth=12,
    min_samples_leaf=2,
)

model.fit(X_train, y_train)


# -------------------------------------------------
# 6. Evaluate ONLY on unseen 20%
# -------------------------------------------------

predictions = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

precision = precision_score(
    y_test,
    predictions,
    average="weighted",
    zero_division=0,
)

recall = recall_score(
    y_test,
    predictions,
    average="weighted",
    zero_division=0,
)

f1 = f1_score(
    y_test,
    predictions,
    average="weighted",
    zero_division=0,
)


print("\n--- Random Forest Evaluation ---")

print(f"Accuracy:  {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall:    {recall:.4f}")
print(f"F1 Score:  {f1:.4f}")

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


# -------------------------------------------------
# 7. Save project evidence
# -------------------------------------------------

current_dir = os.path.dirname(
    os.path.abspath(__file__)
)

dataset_path = os.path.join(
    current_dir,
    "satellite_telemetry_dataset.csv"
)

test_dataset_path = os.path.join(
    current_dir,
    "satellite_telemetry_test_dataset.csv"
)

model_path = os.path.join(
    current_dir,
    "predictive_maintenance_model.joblib"
)


# Full simulated dataset
data.to_csv(
    dataset_path,
    index=False
)

# Save ONLY unseen test records for fair baseline comparison
test_data = X_test.copy()
test_data["health_status"] = y_test

test_data.to_csv(
    test_dataset_path,
    index=False
)

# Save trained model
joblib.dump(
    model,
    model_path
)


print(f"\nFull dataset saved to: {dataset_path}")
print(f"Test dataset saved to: {test_dataset_path}")
print(f"Model saved to: {model_path}")