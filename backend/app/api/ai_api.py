from fastapi import APIRouter, status
from app.schemas.ai_prediction_schema import PredictionRequest

router = APIRouter(
    tags=["AI Predictive Maintenance"]
)


@router.post(
    "/ai/predict",
    status_code=status.HTTP_200_OK,
    summary="Predict Satellite Health"
)
def predict_health(data: PredictionRequest):
    """
    Predict satellite health using telemetry values.
    """

    score = 100
    issues = []

    # Battery Analysis
    if data.battery < 30:
        score -= 35
        issues.append("Low Battery")

    # Temperature Analysis
    if data.temperature > 70:
        score -= 30
        issues.append("High Temperature")

    # Solar Panel Analysis
    if data.solar_panel < 40:
        score -= 25
        issues.append("Low Solar Panel Efficiency")

    # Final Prediction
    if score >= 80:
        prediction = "Healthy"
        recommendation = "Continue normal operations."

    elif score >= 60:
        prediction = "Warning"
        recommendation = "Monitor satellite closely."

    else:
        prediction = "Maintenance Required"
        recommendation = "Schedule maintenance immediately."

    confidence = round(score, 2)

    return {
        "prediction": prediction,
        "confidence": confidence,
        "health_score": score,
        "issues_detected": issues,
        "recommendation": recommendation
    }