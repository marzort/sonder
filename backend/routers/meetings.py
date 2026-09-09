from fastapi import APIRouter, Depends, HTTPException
from models import Meeting, MeetingUser, User
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload
from auth import get_current_user, get_db
from schemas import MeetingResponse

router = APIRouter()

@router.get("/meetings")
def meeting(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meeting_users = db.scalars(
        select(MeetingUser)
        .where(MeetingUser.user_id == current_user.id)
        .options(
            joinedload(MeetingUser.meeting)
            .joinedload(Meeting.user_a)
            .joinedload(User.avatar),

            joinedload(MeetingUser.meeting)
            .joinedload(Meeting.user_b)
            .joinedload(User.avatar)
        )
    ).all()

    meetings = []
    print(meetings)

    for meeting_user in meeting_users:
        meeting = meeting_user.meeting

        if meeting.user_a_id == current_user.id:
            other_user = meeting.user_b
        else:
            other_user = meeting.user_a

        meetings.append(
            MeetingResponse(
                id=meeting.id,
                started_at=meeting.started_at,
                viewed=meeting_user.viewed,
                other_user={
                    "id": other_user.id,
                    "username": other_user.username,
                    "greeting": other_user.greeting,
                    "avatar": {
                        "eyes": other_user.avatar.eyes,
                        "mouth": other_user.avatar.mouth,
                        "hair": other_user.avatar.hair,
                        "clothes": other_user.avatar.clothes,
                        "skin_color": other_user.avatar.skin_color,
                        "hair_color": other_user.avatar.hair_color,
                        "clothes_color": other_user.avatar.clothes_color
                    }
                }
            )
        )

    return meetings

@router.post("/meetings/{meeting_id}/viewed")
def mark_meeting_viewed(
    meeting_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meeting_user = db.scalar(
        select(MeetingUser).where(
            MeetingUser.meeting_id == meeting_id,
            MeetingUser.user_id == current_user.id
        )
    )

    if meeting_user is None:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found."
        )

    meeting_user.viewed = True

    db.commit()

    remaining_count = db.scalar(
        select(func.count())
        .select_from(MeetingUser)
        .where(
            MeetingUser.user_id == current_user.id,
            MeetingUser.viewed.is_(False)
        )
    )

    return {
        "message": "Meeting marked as viewed.",
        "unviewed_count": remaining_count
    }