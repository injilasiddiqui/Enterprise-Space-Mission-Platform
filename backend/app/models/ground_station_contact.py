from sqlalchemy import Column, Integer, String
from app.database.base import Base


class GroundStationContact(Base):
    __tablename__ = "ground_station_contacts"

    id = Column(Integer, primary_key=True, index=True)

    satellite_name = Column(String, nullable=False)
    ground_station = Column(String, nullable=False)

    contact_start = Column(String, nullable=False)
    contact_end = Column(String, nullable=False)

    contact_result = Column(
        String,
        nullable=False,
        default="Scheduled"
    )

    failure_reason = Column(
        String,
        nullable=True
    )

    duration_minutes = Column(
        Integer,
        nullable=True
    )