from fastapi import APIRouter, Depends
from models import User
from auth import active_sessions, get_current_user
from routers.websocket import manager

router = APIRouter()

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    user_id = current_user.id

    active_sessions.pop(user_id, None)

    await manager.disconnect(
        user_id,
        close_socket=True
    )

    return {"message": "Logged out"}