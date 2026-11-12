from fastapi import APIRouter, Depends, HTTPException
from models import User, Friendship, FriendshipStatus
from sqlalchemy import select, or_, func
from sqlalchemy.orm import Session, joinedload
from auth import get_current_user, get_db
from schemas import FriendshipStatusUpdate, FriendListResponse, FriendRequestResponse
from .websocket import manager

router = APIRouter()

def get_friend_count(db: Session, user_id: int):
    return db.scalar(
        select(func.count())
        .where(
            or_(
                Friendship.sender_id == user_id,
                Friendship.receiver_id == user_id
            ),
            Friendship.status == FriendshipStatus.ACCEPTED
        )
    ) or 0

async def update_friend_count(db: Session, user_id: int):
    count = get_friend_count(db, user_id)

    await manager.send_to_user(
        user_id,
        {
            "type": "friend_count_updated",
            "count": count
        }
    )

def get_request_count(db: Session, user_id: int):
    return db.scalar(
        select(func.count())
        .where(
            Friendship.receiver_id == user_id,
            Friendship.status == FriendshipStatus.PENDING
        )
    ) or 0

async def update_request_count(db: Session, user_id: int):
    count = get_request_count(db, user_id)

    await manager.send_to_user(
        user_id,
        {
            "type": "request_count_updated",
            "count": count
        }
    )

@router.get("/friend/list")
async def get_friend_list(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    friends = db.scalars(
        select(User)
        .join(
            Friendship,
            or_(
                ((Friendship.sender_id == current_user.id) & (Friendship.receiver_id == User.id)) |
                ((Friendship.sender_id == User.id) & (Friendship.receiver_id == current_user.id))
            )
        )
        .where(Friendship.status == FriendshipStatus.ACCEPTED)
    ).unique().all()

    friend_list = []

    for friend in friends:
        friend_list.append(
            FriendListResponse(
                id=friend.id,
                username=friend.username
            )
        )

    return friend_list

@router.post("/friend/request/{friend_id}")
async def send_friend_request(
    friend_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Friendship).filter(
        ((Friendship.sender_id == current_user.id) & (Friendship.receiver_id == friend_id)) |
        ((Friendship.sender_id == friend_id) & (Friendship.receiver_id == current_user.id))
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Friendship or request already exists."
        )

    new_request = Friendship(
        sender_id=current_user.id,
        receiver_id=friend_id,
        status=FriendshipStatus.PENDING
    )

    db.add(new_request)
    db.commit()

    req_count = await update_request_count(db, friend_id)

    return {
        "message": "Friend request sent",
        "updated_request_count": req_count}

@router.get("/friend/getRequests")
def get_friend_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rows = db.execute(
        select(Friendship, User)
        .join(User, Friendship.sender_id == User.id)
        .where(
            Friendship.receiver_id == current_user.id,
            Friendship.status == FriendshipStatus.PENDING
        )
    ).all()

    request_list: list[FriendRequestResponse] = []

    friendship: Friendship
    sender: User

    for friendship, sender in rows:
        request_list.append(
            FriendRequestResponse(
                id=friendship.id,
                sender=FriendListResponse(
                    id=sender.id,
                    username=sender.username
                ),
                sent_at=friendship.created_at
            )
        )

    return request_list

@router.patch("/friend/request/{request_id}/decision")
async def friend_request_decision(
    request_id: int,
    payload: FriendshipStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    friendship = db.query(Friendship).filter(
        Friendship.id == request_id
    ).first()

    if not friendship:
        raise HTTPException(
            status_code=404,
            detail="Friendship not found."
        )

    if payload.status == FriendshipStatus.ACCEPTED:
        friendship.status = FriendshipStatus.ACCEPTED
        db.commit()
        db.refresh(friendship)

        await update_friend_count(db, friendship.receiver_id)
        await update_friend_count(db, friendship.sender_id)
        await update_request_count(db, friendship.receiver_id)

        return {"message": "Friend request accepted", "status": "accepted"}
    
    elif payload.status == FriendshipStatus.REJECTED:
        db.delete(friendship)
        db.commit()

        await update_request_count(db, friendship.receiver_id)
        return {"message": "Friend request rejected", "status": "rejected"}

@router.delete("/friend/remove/{friend_id}")
async def remove_friend(
    friend_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    friendship = db.query(Friendship).filter(
        ((Friendship.sender_id == current_user.id) & (Friendship.receiver_id == friend_id)) |
        ((Friendship.sender_id == friend_id) & (Friendship.receiver_id == current_user.id))
    ).first()

    if not friendship:
        raise HTTPException(
            status_code=404,
            detail="Friendship not found"
        )

    db.delete(friendship)
    db.commit()

    await update_friend_count(db, friend_id)
    await update_friend_count(db, current_user.id)
    return {"message": "Friend removed successfully"}

@router.get("/friend/{friendId}")
def friendProfile(
    friendId: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.execute(
        select(User).where(User.id == friendId)
    ).scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    friendship_status = "none"

    if current_user.id != friendId:
        friendship = db.scalar(
            select(Friendship).where(
                or_(
                    ((Friendship.sender_id == current_user.id) & (Friendship.receiver_id == friendId)) |
                    ((Friendship.sender_id == friendId) & (Friendship.receiver_id == current_user.id))
                )
            )
        )

        if friendship:
            if friendship.status == FriendshipStatus.ACCEPTED:
                friendship_status = "accepted"
            elif friendship.sender_id == current_user.id:
                friendship_status = "pending"
            else:
                friendship_status = "incoming"

    return {
        "id": user.id,
        "username": user.username,
        "created_at": user.created_at,
        "avatar": {
            "eyes": user.avatar.eyes,
            "mouth": user.avatar.mouth,
            "hair": user.avatar.hair,
            "clothes": user.avatar.clothes,
            "skin_color": user.avatar.skin_color,
            "hair_color": user.avatar.hair_color,
            "clothes_color": user.avatar.clothes_color
        },
        "greeting": user.greeting,
        "gift_flower_id": user.gift_flower_id,
        "friendship_status": friendship_status
    }