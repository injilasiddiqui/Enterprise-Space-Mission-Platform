from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime
import uuid
from app.core.security import get_current_admin

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


@router.post(
    "/commands/{command_id}/execute",
    summary="Execute Satellite Command (Admin Only)"
)
def execute_command(
    command_id: str,
    current_user=Depends(get_current_admin)
):

    return {
        "command_id": command_id,
        "execution_status": "Executed Successfully",
        "execution_time": datetime.utcnow(),
        "executed_by": current_user["sub"],
        "approved_role": current_user["role"]
    }