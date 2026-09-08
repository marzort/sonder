from fastapi import APIRouter, Depends, HTTPException
from models import User, Meeting, MeetingUser
from schemas import LocationUpdate, LocationSharingUpdate
from sqlalchemy import select, func, text
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement
from database import get_db
from auth import get_current_user
from datetime import datetime, timezone
from .websocket import manager

NEARBY_DISTANCE_METERS = 50

router = APIRouter()

# meetings should only occur once between two users
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

    new_meeting_user_ids = []

    for nearby_user in nearby_users:
        user_a_id = min(current_user.id, nearby_user.id)
        user_b_id = max(current_user.id, nearby_user.id)

        # check to see if already in meeting
        existing_meeting = db.execute(
            select(Meeting).where(
                Meeting.user_a_id == user_a_id,
                Meeting.user_b_id == user_b_id
            )
        ).scalar_one_or_none()

        # if no existing meeting, add meeting to database
        if existing_meeting is None:
            meeting = Meeting(
                user_a_id=user_a_id,
                user_b_id=user_b_id,
                meeting_location=current_user.current_location,
                started_at=datetime.now(timezone.utc)
            )

            meeting.users = [
                MeetingUser(user_id=user_a_id),
                MeetingUser(user_id=user_b_id)
            ]

            db.add(meeting)

            new_meeting_user_ids.extend([
                user_a_id,
                user_b_id
            ])

            print(f"{current_user.username} is near {nearby_user.username}")

    return new_meeting_user_ids


def render_meeting(
        user_a: User, 
        user_b: User,
        db: Session
):
    # get relevant info
    query = text(""" 
        SELECT greeting, gift
        FROM users
        WHERE id = :user_id
    """)

    user_a_result = db.execute(
        query,
        {
            "user_id": user_a
        } 
    )

    user_b_result = db.execute(
        query,
        {
            "user_id": user_b
        }
    )

def get_unviewed_meeting_count(db: Session, user_id: int):
    return db.scalar(
        select(func.count())
        .select_from(MeetingUser)
        .where(
            MeetingUser.user_id == user_id,
            MeetingUser.viewed.is_(False),
        )
    )

@router.post("/location")
async def update_location(
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

    new_meeting_user_ids = check_for_meetings(current_user, db)

    db.commit()

    for user_id in new_meeting_user_ids:
        count = get_unviewed_meeting_count(db, user_id)

        await manager.send_to_user(
            user_id,
            {
                "type": "meeting_count_updated",
                "count": count
            }
        )

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