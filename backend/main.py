import json
from fastapi import (
    FastAPI, 
    Depends, 
    HTTPException, 
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select, func, text
from sqlalchemy.orm import Session
from geoalchemy2.elements import WKTElement
from database import engine, get_db
from models import Base, User, Avatar, Meeting
from datetime import datetime, timezone

from schemas import (
    RegisterRequest, 
    LoginRequest, 
    AvatarUpdateRequest,
    LocationUpdate
)

from auth import (
    hash_password, 
    verify_password, 
    create_access_token, 
    get_current_user,
    active_sessions
)
from websocket import router as websocket_router, manager

NEARBY_DISTANCE_METERS = 50

app = FastAPI()
security = HTTPBearer()

app.include_router(websocket_router)

Base.metadata.create_all(engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def check_for_meetings(
        current_user: User,
        db: Session,
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
                started_at=datetime.now(timezone.utc),
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

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/users")
def get_users():
    with engine.connect() as connection:
        result = connection.execute(select(User))

        users = []

        for user in result:
            users.append({
                "id": user.id,
                "username": user.username,
                "created_at": user.created_at
            })

        return users

@app.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    user = db.execute(
        select(User).where(request.username == User.username)
        ).scalar_one_or_none()

    if user is not None:
        raise HTTPException(
            status_code=409,
            detail="Username already taken"
        )
    
    hashed_password = hash_password(request.password)

    user = User(
        username = request.username,
        password_hash = hashed_password
    )

    try:
        db.add(user)
        db.flush()

        avatar = Avatar(
            user_id = user.id,
            eyes = "default",
            mouth = "default",
            hair = "bigHair",
            clothes = "hoodie",
            skin_color = "614335",
            hair_color = "a55728",
            clothes_color = "65c9ff"
        )

        db.add(avatar)
        db.commit()
    except:
        db.rollback()
        raise

    return {
        "message": "Registration successful",
        "username": user.username
    }

@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    username = request.username.strip()
    user = db.execute(
        select(User).where(User.username == username)
    ).scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if user.id in active_sessions:
        raise HTTPException(
            status_code=409,
            detail="User is already logged in"
        )

    token = create_access_token(user.id)

    return {"access_token": token}

@app.get("/profile")
def profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "created_at": current_user.created_at,
        "avatar": {
            "eyes": current_user.avatar.eyes,
            "mouth": current_user.avatar.mouth,
            "hair": current_user.avatar.hair,
            "clothes": current_user.avatar.clothes,
            "skin_color": current_user.avatar.skin_color,
            "hair_color": current_user.avatar.hair_color,
            "clothes_color": current_user.avatar.clothes_color
        }
    }

@app.put("/avatar")
def update_avatar(
    request: AvatarUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    avatar = db.execute(
        select(Avatar).where(Avatar.user_id == current_user.id)
    ).scalar_one_or_none()

    if avatar is None:
        raise HTTPException(
            status_code=404,
            detail="Avatar not found"
        )

    avatar.eyes = request.eyes
    avatar.mouth = request.mouth
    avatar.hair = request.hair
    avatar.clothes = request.clothes
    avatar.skin_color = request.skin_color
    avatar.hair_color = request.hair_color
    avatar.clothes_color = request.clothes_color

    db.commit()

    return {
        "eyes": avatar.eyes,
        "mouth": avatar.mouth,
        "hair": avatar.hair,
        "clothes": avatar.clothes,
        "skin_color": avatar.skin_color,
        "hair_color": avatar.hair_color,
        "clothes_color": avatar.clothes_color
    }

@app.post("/location")
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

@app.get("/location/nearby")
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

@app.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id

    active_sessions.pop(user_id, None)

    await manager.disconnect(
        user_id,
        close_socket=True
    )