from fastapi import APIRouter, Depends, HTTPException
from models import User, Meeting
from schemas import LocationUpdate, LocationSharingUpdate
from sqlalchemy import select, func, text
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement
from database import get_db
from auth import get_current_user
from datetime import datetime, timezone

NEARBY_DISTANCE_METERS = 50

router = APIRouter()

def check_for_meetings(
        current_user: User,
        db: Session
):
    query = text(""" 
        SELECT id, username
        FROM users
        WHERE id != :user_id
            AND location_sharing_enabled = TRUE
            AND current_location IS NOT NULL
            AND ST_DWithin(
                current_location,
                (
                    SELECT current_location
                    FROM users
                    WHERE id = :user_id
                ),
                :distance
            )
    """)

    result = db.execute(
        query,
        {
            "user_id": current_user.id,
            "distance": NEARBY_DISTANCE_METERS
        },
    )

    nearby_users = result.fetchall()

    for nearby_user in nearby_users:
        user_a_id = min(current_user.id, nearby_user.id)
        user_b_id = max(current_user.id, nearby_user.id)

        existing_meeting = db.execute(
            select(Meeting).where(
                Meeting.user_a_id == user_a_id,
                Meeting.user_b_id == user_b_id,
                Meeting.ended_at.is_(None),
            )
        ).scalar_one_or_none()

        if existing_meeting is None:
            meeting = Meeting(
                user_a_id=user_a_id,
                user_b_id=user_b_id,
                meeting_location=current_user.current_location,
                started_at=datetime.now(timezone.utc)
            )

            db.add(meeting)

            print(f"{current_user.username} is near {nearby_user.username}")

    active_meetings = db.execute(
        select(Meeting).where(
            Meeting.ended_at.is_(None),
            (
                (Meeting.user_a_id == current_user.id)
                | (Meeting.user_b_id == current_user.id)
            ),
        )
    ).scalars().all()

    for meeting in active_meetings:
        if meeting.user_a_id == current_user.id:
            other_user_id = meeting.user_b_id
        else:
            other_user_id = meeting.user_a_id

        nearby_query = text(""" 
            SELECT ST_DWithin(
                current_location,
                (
                    SELECT current_location
                    FROM users
                    WHERE id = :current_user_id
                ),
                :distance
            )
            FROM users
            WHERE id = :other_user_id
                AND current_location IS NOT NULL
        """)

        result = db.execute(
            nearby_query,
            {
                "current_user_id": current_user.id,
                "other_user_id": other_user_id,
                "distance": NEARBY_DISTANCE_METERS
            },
        )

        is_nearby = result.scalar()

        if not is_nearby:
            meeting.ended_at = datetime.now(timezone.utc)

@router.post("/location")
def update_location(
    location: LocationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.location_sharing_enabled:
        raise HTTPException(
            status_code=403,
            detail="Location sharing is disabled."
        )

    current_user.current_location = WKTElement(
        f"POINT({location.longitude} {location.latitude})",
        srid=4326
    )

    current_user.location_accuracy = location.accuracy
    current_user.location_updated_at = datetime.now(timezone.utc)

    check_for_meetings(current_user, db)

    db.commit()

    return {
        "message": "Location updated successfully."
    }

@router.get("/location/nearby")
def get_nearby_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.location_sharing_enabled:
        raise HTTPException(
            status_code=403,
            detail="Location sharing is disabled."
        )

    if current_user.current_location is None:
        raise HTTPException(
            status_code=400,
            detail="Current location is not available."
        )

    query = text(""" 
        SELECT id, username
        FROM users
        WHERE id != :user_id
            AND location_sharing_enabled = TRUE
            AND current_location IS NOT NULL
            AND ST_DWithin(
                current_location,
                (
                    SELECT current_location
                    FROM users
                    WHERE id = :user_id
                ),
                :distance
            )
    """)

    result = db.execute(
        query,
        {
            "user_id": current_user.id,
            "distance": 50
        },
    )

    nearby_users = result.fetchall()

    return [
        {
            "id": user.id,
            "username": user.username,
        }
        for user in nearby_users
    ]

@router.post("/location/sharing")
def set_location_sharing(
    update: LocationSharingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.location_sharing_enabled = update.enabled

    if not update.enabled:
        current_user.current_location = None
        current_user.location_accuracy = None
        current_user.location_updated_at = None

    db.commit()

    return {
        "location_sharing_enabled":
            current_user.location_sharing_enabled
    }