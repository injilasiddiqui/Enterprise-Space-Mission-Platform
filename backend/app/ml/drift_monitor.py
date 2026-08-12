import os
import joblib
import pandas as pd

from sklearn.metrics import accuracy_score


# --------------------------------
# Paths
# --------------------------------

current_dir = os.path.dirname(os.path.abspath(__file__))

model_path = os.path.join(
    current_dir,
    "predictive_maintenance_model.joblib"
)

test_dataset_path = os.path.join(
    current_dir,
    "satellite_telemetry_test_dataset.csv"
)


# --------------------------------
# Model performance baseline
# --------------------------------

BASELINE_ACCURACY = 0.923

# Allow maximum 5 percentage-point performance drop
DRIFT_THRESHOLD = 0.05


# --------------------------------
# Load model and evaluation data
# --------------------------------

model = joblib.load(model_path)

data = pd.read_csv(test_dataset_path)

X_test = data[
    ["battery", "temperature", "solar_panel"]
]

y_test = data["health_status"]


# --------------------------------
# Current model performance
# --------------------------------

predictions = model.predict(X_test)

current_accuracy = accuracy_score(
    y_test,
    predictions
)

performance_drop = (
    BASELINE_ACCURACY - current_accuracy
)


# --------------------------------
# Drift decision
# --------------------------------

print("\n--- Model Drift Monitoring ---")

print(
    f"Baseline Accuracy: "
    f"{BASELINE_ACCURACY * 100:.2f}%"
)

print(
    f"Current Accuracy: "
    f"{current_accuracy * 100:.2f}%"
)

print(
    f"Performance Drop: "
    f"{performance_drop * 100:.2f}%"
)


if performance_drop > DRIFT_THRESHOLD:

    drift_status = "DRIFT DETECTED"

    recommendation = (
        "Model review and retraining recommended."
    )

else:

    drift_status = "NO SIGNIFICANT DRIFT"

    recommendation = (
        "Model performance is within the accepted range."
    )


print(f"\nStatus: {drift_status}")
print(f"Recommendation: {recommendation}")


# --------------------------------
# Save monitoring evidence
# --------------------------------

results = pd.DataFrame({
    "baseline_accuracy": [BASELINE_ACCURACY],
    "current_accuracy": [current_accuracy],
    "performance_drop": [performance_drop],
    "drift_threshold": [DRIFT_THRESHOLD],
    "drift_status": [drift_status],
    "recommendation": [recommendation]
})

results_path = os.path.join(
    current_dir,
    "drift_monitoring_results.csv"
)

results.to_csv(
    results_path,
    index=False
)

print(
    f"\nDrift monitoring results saved to: "
    f"{results_path}"
)