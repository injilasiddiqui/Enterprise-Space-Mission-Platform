from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter(tags=["Satellite Commands"])


class CommandRequest(BaseModel):
    satellite_name: str
    command_type: str
    priority: str


@router.post("/commands/generate")
def generate_command(data: CommandRequest):

    command_id = str(uuid.uuid4())[:8]

    return {
        "command_id": command_id,
        "satellite": data.satellite_name,
        "command": data.command_type,
        "priority": data.priority,
        "generated_at": datetime.utcnow(),
        "status": "Pending Execution"
    }


@router.post("/commands/{command_id}/execute")
def execute_command(command_id: str):

    return {
        "command_id": command_id,
        "execution_status": "Executed Successfully",
        "execution_time": datetime.utcnow()
    }