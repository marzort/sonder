from fastapi import APIRouter, Depends
from models import User
from auth import get_current_user

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
        }
    }