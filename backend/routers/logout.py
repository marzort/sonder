from fastapi import APIRouter, Depends, BackgroundTasks
from models import User
from auth import get_current_user, get_db
from routers.websocket import manager
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/logout")
async def logout(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id

    current_user.active_session_id = None
    current_user.location_sharing_enabled = False
    current_user.current_location = None
    current_user.location_accuracy = None
    current_user.location_updated_at = None
    db.commit()

    background_tasks.add_task(manager.disconnect, user_id, close_socket=True)

    return {"message": "Logged out"}