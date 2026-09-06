from fastapi import APIRouter, Depends, HTTPException
from schemas import AvatarUpdateRequest
from models import User, Avatar
from auth import get_current_user
from database import get_db
from sqlalchemy import select
from sqlalchemy.orm import Session

router = APIRouter()

@router.put("/avatar")
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