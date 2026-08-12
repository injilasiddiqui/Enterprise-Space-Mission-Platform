from pathlib import Path

import joblib
import pandas as pd
from fastapi import APIRouter, status

from app.schemas.ai_prediction_schema import PredictionRequest


router = APIRouter(
    tags=["AI Predictive Maintenance"]
)


# Load the trained Random Forest model once when FastAPI starts
MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "ml"
    / "predictive_maintenance_model.joblib"
)

model = joblib.load(MODEL_PATH)


@router.post(
    "/ai/predict",
    status_code=status.HTTP_200_OK,
    summary="Predict Satellite Health"
)
def predict_health(data: PredictionRequest):
    """
    Predict satellite health using the trained Random Forest model.
    """

    # Prepare telemetry in the same format used during training
    telemetry = pd.DataFrame(
        [{
            "battery": data.battery,
            "temperature": data.temperature,
            "solar_panel": data.solar_panel
        }]
    )

    # ML prediction
    prediction = model.predict(telemetry)[0]

    # Probability/confidence from Random Forest
    probabilities = model.predict_proba(telemetry)[0]
    confidence = round(float(max(probabilities)) * 100, 2)

    # Keep health score for the existing frontend
    if prediction == "Healthy":
        health_score = 90
        recommendation = "Continue normal operations."

    elif prediction == "Warning":
        health_score = 65
        recommendation = "Monitor satellite closely."

    else:
        health_score = 30
        recommendation = "Schedule maintenance immediately."

    # Explain which telemetry values may be problematic
    issues = []

    if data.battery < 40:
        issues.append("Low Battery")

    if data.temperature > 60:
        issues.append("High Temperature")

    if data.temperature < 0:
        issues.append("Low Temperature")

    if data.solar_panel < 50:
        issues.append("Low Solar Panel Efficiency")

    return {
        "prediction": prediction,
        "confidence": confidence,
        "health_score": health_score,
        "issues_detected": issues,
        "recommendation": recommendation
    }