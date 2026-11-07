from fastapi import APIRouter, Depends, HTTPException
from models import Message, User
from sqlalchemy import select, or_
from sqlalchemy.orm import Session, joinedload
from auth import get_current_user, get_db
from schemas import MessageResponse, MessagePersonResponse

router = APIRouter()

@router.get("/messages")
def message(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stmt = (
        select(Message)
        .where(
            or_(
                Message.sender_id == current_user.id,
                Message.receiver_id == current_user.id
            )
        )
        .options(
            joinedload(Message.sender),
            joinedload(Message.receiver)
        )
        .order_by(Message.sent_at.desc())
    )

    messages = db.scalars(stmt).all()

    response = []

    for msg in messages:

        if msg.sender_id == current_user.id:
            other_user = msg.receiver
        else:
            other_user = msg.sender

        response.append(
            MessageResponse(
                id=msg.id,
                sent_at=msg.sent_at,
                other_user=MessagePersonResponse(
                    id=other_user.id,
                    username=other_user.username
                ),
                message_body=msg.message_body
            )
        )

    return response