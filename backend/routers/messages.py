from fastapi import APIRouter, Depends, HTTPException
from models import Message, User, MeetingUser, Meeting
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload
from auth import get_current_user, get_db
from schemas import MessageResponse, MessagePersonResponse, FriendListResponse, SendMessageRequest
from .websocket import manager

router = APIRouter()

def get_unviewed_message_count(db: Session, user_id: int):
    return db.scalar(
        select(func.count())
        .where(
            Message.receiver_id == user_id,
            Message.viewed.is_(False)
        )
    ) or 0

async def update_message_count(db: Session, user_id: int):
    count = get_unviewed_message_count(db, user_id)

    await manager.send_to_user(
        user_id,
        {
            "type": "message_count_updated",
            "count": count
        }
    )

@router.get("/messages")
def message(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stmt = (
        select(Message)
        .where(Message.receiver_id == current_user.id)
        .options(
            joinedload(Message.sender),
            joinedload(Message.receiver)
        )
        .order_by(Message.sent_at.desc())
    )

    messages = db.scalars(stmt).all()

    response = []

    for msg in messages:

        other_user = msg.sender

        response.append(
            MessageResponse(
                id=msg.id,
                sent_at=msg.sent_at,
                other_user=MessagePersonResponse(
                    id=other_user.id,
                    username=other_user.username
                ),
                message_subject=msg.message_subject,
                message_body=msg.message_body,
                viewed=msg.viewed
            )
        )

    return response

@router.get("/friends")
def friends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    friends = db.scalars(
        select(MeetingUser)
        .where(MeetingUser.user_id == current_user.id)
        .options(
            joinedload(MeetingUser.meeting)
            .joinedload(Meeting.user_a),

            joinedload(MeetingUser.meeting)
            .joinedload(Meeting.user_b)
        )
    ).unique().all()

    friend_list = []

    for friend in friends:
        meeting = friend.meeting

        if meeting.user_a_id == current_user.id:
            friend_user = meeting.user_b
        else:
            friend_user = meeting.user_a

        friend_list.append(
            FriendListResponse(
                id=friend_user.id,
                username=friend_user.username
            )
        )

    return friend_list

@router.post("/sendMessage")
async def sendMessage(
    payload: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.recipient_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot send a message to yourself."
        )

    new_message = Message(
        sender_id=current_user.id,
        receiver_id=payload.recipient_id,
        message_subject=payload.message_subject,
        message_body=payload.message_body,
        viewed=False
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    await update_message_count(db, payload.recipient_id)

    return {"message": "Message sent successfully", "id": new_message.id}


@router.post("/messages/{message_id}/viewed")
def mark_message_viewed(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    message = db.scalar(
        select(Message).where(Message.id == message_id)
    )

    if message is None:
        raise HTTPException(
            status_code=404,
            detail="Message not found."
        )

    message.viewed = True

    db.commit()

    remaining_count = get_unviewed_message_count(db, current_user.id)

    return {
        "message": "Message marked as viewed.",
        "unviewed_message_count": remaining_count
    }