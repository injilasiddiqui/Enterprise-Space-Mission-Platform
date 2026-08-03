from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.mission import Mission
from app.schemas.mission_schema import MissionCreate
from app.core.security import get_current_admin

router = APIRouter(
    tags=["Mission Management"]
)


@router.post(
    "/missions",
    status_code=status.HTTP_201_CREATED,
    summary="Create Mission"
)
def create_mission(
    mission: MissionCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new satellite mission.
    """

    existing = db.query(Mission).filter(
        Mission.mission_name == mission.mission_name
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Mission already exists."
        )

    new_mission = Mission(
        mission_name=mission.mission_name,
        satellite_name=mission.satellite_name,
        launch_date=mission.launch_date,
        status=mission.status
    )

    db.add(new_mission)
    db.commit()
    db.refresh(new_mission)

    return {
        "message": "Mission created successfully.",
        "data": new_mission
    }


@router.get(
    "/missions",
    summary="Get All Missions"
)
def get_all_missions(
    satellite_name: Optional[str] = Query(
        default=None,
        description="Filter by satellite"
    ),
    status_filter: Optional[str] = Query(
        default=None,
        alias="status",
        description="Filter by mission status"
    ),
    db: Session = Depends(get_db)
):
    """
    Retrieve all missions with optional filters.
    """

    query = db.query(Mission)

    if satellite_name:
        query = query.filter(
            Mission.satellite_name == satellite_name
        )

    if status_filter:
        query = query.filter(
            Mission.status == status_filter
        )

    missions = query.order_by(
        Mission.id.desc()
    ).all()

    return {
        "count": len(missions),
        "data": missions
    }


@router.get(
    "/missions/{mission_id}",
    summary="Get Mission by ID"
)
def get_mission_by_id(
    mission_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve a single mission.
    """

    mission = db.query(Mission).filter(
        Mission.id == mission_id
    ).first()

    if mission is None:
        raise HTTPException(
            status_code=404,
            detail="Mission not found."
        )

    return mission


@router.put(
    "/missions/{mission_id}",
    summary="Update Mission"
)
def update_mission(
    mission_id: int,
    mission: MissionCreate,
    db: Session = Depends(get_db)
):
    """
    Update an existing mission.
    """

    existing = db.query(Mission).filter(
        Mission.id == mission_id
    ).first()

    if existing is None:
        raise HTTPException(
            status_code=404,
            detail="Mission not found."
        )

    existing.mission_name = mission.mission_name
    existing.satellite_name = mission.satellite_name
    existing.launch_date = mission.launch_date
    existing.status = mission.status

    db.commit()
    db.refresh(existing)

    return {
        "message": "Mission updated successfully.",
        "data": existing
    }


@router.delete(
    "/missions/{mission_id}",
    summary="Delete Mission"
)
def delete_mission(
    mission_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a mission.
    """

    mission = db.query(Mission).filter(
        Mission.id == mission_id
    ).first()

    if mission is None:
        raise HTTPException(
            status_code=404,
            detail="Mission not found."
        )

    db.delete(mission)
    db.commit()

    return {
        "message": "Mission deleted successfully."
    }


@router.get(
    "/missions/summary",
    summary="Mission Summary"
)
def mission_summary(
    db: Session = Depends(get_db)
):
    """
    Return mission statistics for the dashboard.
    """

    total = db.query(Mission).count()

    planned = db.query(Mission).filter(
        Mission.status == "Planned"
    ).count()

    active = db.query(Mission).filter(
        Mission.status == "Active"
    ).count()

    completed = db.query(Mission).filter(
        Mission.status == "Completed"
    ).count()

    return {
        "total_missions": total,
        "planned": planned,
        "active": active,
        "completed": completed
    }
@router.put(
    "/missions/{mission_id}/approve",
    summary="Approve Mission (Admin Only)"
)
def approve_mission(
    mission_id: int,
    current_user=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Approve a mission before execution.
    Only Admin users are allowed.
    """

    mission = (
        db.query(Mission)
        .filter(Mission.id == mission_id)
        .first()
    )

    if mission is None:
        raise HTTPException(
            status_code=404,
            detail="Mission not found."
        )

    mission.status = "Approved"

    db.commit()
    db.refresh(mission)

    return {
        "message": "Mission approved successfully.",
        "approved_by": current_user["sub"],
        "mission": mission
    }
@router.get("/missions/history")
def mission_history(
    db: Session = Depends(get_db)
):
    """
    Mission History Report
    """

    missions = (
        db.query(Mission)
        .order_by(Mission.id.desc())
        .all()
    )

    return {
        "total_missions": len(missions),
        "history": missions
    }