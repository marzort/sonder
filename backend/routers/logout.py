from fastapi import APIRouter, Depends, BackgroundTasks
from models import User
from auth import active_sessions, get_current_user, get_db
from routers.websocket import manager
from sqlalchemy.orm import Session

router = APIRouter()

def db_cleanup(user_id: int, db_session: Session):
    user = db_session.query(User).filter(User.id == user_id).first()
    if user:
        user.location_sharing_enabled = False
        user.current_location = None
        user.location_accuracy = None
        user.location_updated_at = None
        db_session.commit()

@router.post("/logout")
async def logout(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id

    active_sessions.pop(user_id, None)

    background_tasks.add_task(manager.disconnect, user_id, close_socket=True)
    background_tasks.add_task(db_cleanup, user_id, db)

    return {"message": "Logged out"}