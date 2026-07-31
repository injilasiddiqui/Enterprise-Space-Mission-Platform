from sqlalchemy import Column, Integer, String
from app.database.base import Base


class GroundStation(Base):
    __tablename__ = "ground_stations"

    id = Column(Integer, primary_key=True, index=True)
    station_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    communication_window = Column(String, nullable=False)
    status = Column(String, nullable=False)