from fastapi import APIRouter, Depends, HTTPException
from models import User, Flower
from auth import get_current_user
from database import get_db
from sqlalchemy import select, text
from sqlalchemy.orm import Session
from schemas import GreetingUpdateRequest

router = APIRouter()

@router.get("/profile")
def profile(current_user: User = Depends(get_current_user)):
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
        },
        "greeting": current_user.greeting,
        "gift_flower_id": current_user.gift_flower_id
    }

@router.get("/friend/{friendId}")
def friendProfile(
    friendId: int,
    db: Session = Depends(get_db)
):
    user = db.execute(
        select(User).where(User.id == friendId)
    ).scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "id": user.id,
        "username": user.username,
        "created_at": user.created_at,
        "avatar": {
            "eyes": user.avatar.eyes,
            "mouth": user.avatar.mouth,
            "hair": user.avatar.hair,
            "clothes": user.avatar.clothes,
            "skin_color": user.avatar.skin_color,
            "hair_color": user.avatar.hair_color,
            "clothes_color": user.avatar.clothes_color
        },
        "greeting": user.greeting,
        "gift_flower_id": user.gift_flower_id
    }

@router.put("/greeting")
def updateGreeting(
    request: GreetingUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.greeting = request.greeting
    db.commit()

    return {
        "greeting": current_user.greeting
    }

@router.put("/gifts/{gift_id}")
def update_gift(
    gift_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    gift = db.query(Flower).filter(Flower.id == gift_id).first()

    if not gift:
        raise HTTPException(
            status_code=404,
            detail="Gift not found"
        )

    current_user.gift_flower_id = gift_id
    db.commit()
    db.refresh(current_user)

    return {
        "gift": current_user.gift_flower_id
    }