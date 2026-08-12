import os
import joblib
import pandas as pd

from sklearn.metrics import (
    confusion_matrix,
    classification_report
)

# --------------------------------
# File paths
# --------------------------------

current_dir = os.path.dirname(os.path.abspath(__file__))

test_dataset_path = os.path.join(
    current_dir,
    "satellite_telemetry_test_dataset.csv"
)

model_path = os.path.join(
    current_dir,
    "predictive_maintenance_model.joblib"
)

# --------------------------------
# Load model and unseen test data
# --------------------------------

data = pd.read_csv(test_dataset_path)
model = joblib.load(model_path)

X_test = data[
    ["battery", "temperature", "solar_panel"]
]

y_test = data["health_status"]

# --------------------------------
# Make predictions
# --------------------------------

predictions = model.predict(X_test)

labels = [
    "Healthy",
    "Warning",
    "Critical"
]

# --------------------------------
# Confusion Matrix
# --------------------------------

cm = confusion_matrix(
    y_test,
    predictions,
    labels=labels
)

cm_df = pd.DataFrame(
    cm,
    index=[f"Actual_{label}" for label in labels],
    columns=[f"Predicted_{label}" for label in labels]
)

print("\n--- Confusion Matrix ---")
print(cm_df)

# --------------------------------
# Critical false-positive /
# false-negative analysis
# --------------------------------

actual_critical = y_test == "Critical"
predicted_critical = predictions == "Critical"

true_positive = (
    actual_critical & predicted_critical
).sum()

false_negative = (
    actual_critical & ~predicted_critical
).sum()

false_positive = (
    ~actual_critical & predicted_critical
).sum()

true_negative = (
    ~actual_critical & ~predicted_critical
).sum()

print("\n--- Critical Risk Analysis ---")

print(f"True Positives:  {true_positive}")
print(f"False Negatives: {false_negative}")
print(f"False Positives: {false_positive}")
print(f"True Negatives:  {true_negative}")

# --------------------------------
# Classification report
# --------------------------------

print("\n--- Classification Report ---")

print(
    classification_report(
        y_test,
        predictions,
        labels=labels,
        zero_division=0
    )
)

# --------------------------------
# Save evidence
# --------------------------------

confusion_matrix_path = os.path.join(
    current_dir,
    "confusion_matrix_results.csv"
)

cm_df.to_csv(confusion_matrix_path)

risk_results = pd.DataFrame({
    "Metric": [
        "True Positive",
        "False Negative",
        "False Positive",
        "True Negative"
    ],
    "Count": [
        true_positive,
        false_negative,
        false_positive,
        true_negative
    ]
})

risk_results_path = os.path.join(
    current_dir,
    "critical_risk_analysis.csv"
)

risk_results.to_csv(
    risk_results_path,
    index=False
)

print(
    f"\nConfusion matrix saved to: "
    f"{confusion_matrix_path}"
)

print(
    f"Risk analysis saved to: "
    f"{risk_results_path}"
)