from app.database.connection import engine
from app.database.base import Base

from app.models.satellite import Satellite
from app.models.telemetry import Telemetry
from app.models.mission import Mission
from app.models.ground_station import GroundStation
from app.models.user import User

def init_db():
    Base.metadata.create_all(bind=engine)