from pydantic import BaseModel


class PredictionRequest(BaseModel):
    battery: float
    temperature: float
    solar_panel: float


class PredictionResponse(BaseModel):
    prediction: str
    confidence: float