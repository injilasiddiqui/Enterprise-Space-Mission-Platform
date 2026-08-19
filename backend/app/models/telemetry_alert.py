from sqlalchemy import Column, Integer, String, Float
from app.database.base import Base


class TelemetryAlert(Base):
    __tablename__ = "telemetry_alerts"

    id = Column(Integer, primary_key=True, index=True)

    satellite_name = Column(String, nullable=False)
    alert_type = Column(String, nullable=False)
    severity = Column(String, nullable=False)

    parameter = Column(String, nullable=False)
    observed_value = Column(Float, nullable=False)

    message = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Open")