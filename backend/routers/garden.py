from fastapi import APIRouter, Depends, HTTPException
from models import Gift, User
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload
from auth import get_current_user, get_db
from schemas import GiftResponse

router = APIRouter()

@router.get("/gifts")
def gift(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    gifts_received = db.scalars(
        select(Gift)
        .where(Gift.receiver_id == current_user.id)
        .options(
            joinedload(Gift.giver),
            joinedload(Gift.flower)
        )
    ).unique().all()

    gifts = []
    print(gifts)

    for gift_received in gifts_received:
        giver = gift_received.giver

        gifts.append(
            GiftResponse(
                id=gift_received.id,
                given_by={
                    "id": giver.id,
                    "username": giver.username
                },
                gift_choice=gift_received.flower.id
            )
        )

    return gifts