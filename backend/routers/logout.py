from fastapi import APIRouter, Depends
from models import User
from auth import active_sessions, get_current_user, get_db
from routers.websocket import manager
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id

    active_sessions.pop(user_id, None)

    await manager.disconnect(
        user_id,
        close_socket=True
    )

    current_user.location_sharing_enabled = False
    current_user.current_location = None
    current_user.location_accuracy = None
    current_user.location_updated_at = None

    db.commit()

    return {"message": "Logged out"}