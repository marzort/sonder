from fastapi import APIRouter, Depends, HTTPException
from database import engine, get_db
from sqlalchemy import select
from sqlalchemy.orm import Session
from models import Base, User, Avatar
from schemas import LoginRequest
from auth import verify_password, create_access_token, get_current_user, active_sessions

router = APIRouter()

@router.post("/login")
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