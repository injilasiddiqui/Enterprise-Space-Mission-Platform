from pydantic import BaseModel


class GroundStationCreate(BaseModel):
    station_name: str
    location: str
    communication_window: str
    status: str


class GroundStationResponse(GroundStationCreate):
    id: int

    class Config:
        from_attributes = True