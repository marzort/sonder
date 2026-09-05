from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from database import engine, get_db
from models import User, Avatar
from schemas import RegisterRequest, AvatarUpdateRequest
from auth import hash_password, verify_password

router = APIRouter()

@router.post("/register")
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