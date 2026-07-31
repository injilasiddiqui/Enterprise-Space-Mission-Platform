from sqlalchemy import Column, Integer, String
from app.database.base import Base


class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    mission_name = Column(String, nullable=False)
    satellite_name = Column(String, nullable=False)
    launch_date = Column(String, nullable=False)
    status = Column(String, nullable=False)
    