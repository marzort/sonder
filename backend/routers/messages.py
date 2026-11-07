from fastapi import APIRouter, Depends, HTTPException
from models import Message, User, MeetingUser, Meeting
from sqlalchemy import select, or_
from sqlalchemy.orm import Session, joinedload
from auth import get_current_user, get_db
from schemas import MessageResponse, MessagePersonResponse, FriendListResponse, SendMessageRequest


router = APIRouter()

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
                message_body=msg.message_body
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
def sendMessage(
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
        message_body=payload.message_body
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return {"message": "Message sent successfully", "id": new_message.id}