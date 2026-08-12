import os
import joblib
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
)

current_dir = os.path.dirname(os.path.abspath(__file__))

test_dataset_path = os.path.join(
    current_dir,
    "satellite_telemetry_test_dataset.csv"
)

model_path = os.path.join(
    current_dir,
    "predictive_maintenance_model.joblib"
)

# Load ONLY unseen test data
data = pd.read_csv(test_dataset_path)
model = joblib.load(model_path)

X_test = data[["battery", "temperature", "solar_panel"]]
y_test = data["health_status"]


# --------------------------------
# Non-AI rule-based baseline
# --------------------------------
def rule_based_prediction(row):

    if (
        row["battery"] < 20
        or row["temperature"] > 80
        or row["solar_panel"] < 30
    ):
        return "Critical"

    if (
        row["battery"] < 40
        or row["temperature"] > 60
        or row["temperature"] < 0
        or row["solar_panel"] < 50
    ):
        return "Warning"

    return "Healthy"


baseline_predictions = X_test.apply(
    rule_based_prediction,
    axis=1
)

# ML predictions on SAME unseen data
ml_predictions = model.predict(X_test)


def calculate_metrics(name, predictions):

    accuracy = accuracy_score(y_test, predictions)

    precision = precision_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0
    )

    recall = recall_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0
    )

    print(f"\n{name}")
    print("-" * 40)
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")

    return {
        "Method": name,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1 Score": f1
    }


baseline_results = calculate_metrics(
    "Rule-Based Baseline",
    baseline_predictions
)

ml_results = calculate_metrics(
    "Random Forest ML",
    ml_predictions
)


comparison = pd.DataFrame([
    baseline_results,
    ml_results
])

results_path = os.path.join(
    current_dir,
    "model_comparison_results.csv"
)

comparison.to_csv(results_path, index=False)

print("\n--- Fair Baseline Comparison ---")
print(comparison.to_string(index=False))

print(f"\nResults saved to: {results_path}")