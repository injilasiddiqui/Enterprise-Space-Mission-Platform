from sqlalchemy import Column, Integer, String, Float
from app.database.base import Base


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    satellite_name = Column(String, nullable=False)
    battery = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    solar_panel = Column(Float, nullable=False)
    communication = Column(String, nullable=False)
    status = Column(String, nullable=False)