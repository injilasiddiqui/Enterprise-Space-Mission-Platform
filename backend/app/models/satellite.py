from sqlalchemy import Column, Integer, String
from app.database.base import Base


class Satellite(Base):
    __tablename__ = "satellites"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    orbit = Column(String, nullable=False)

    mission = Column(String, nullable=False)

    health = Column(Integer, nullable=False)

    status = Column(String, nullable=False)

