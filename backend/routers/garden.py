from fastapi import APIRouter, Depends, HTTPException
from models import Gift, User, Flower
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
            joinedload(Gift.giver)
            .joinedload(User.avatar),
            joinedload(Gift.flower)
        )
    ).unique().all()

    gifts = []
    print(gifts)

    for gift_received in gifts_received:
        giver = gift_received.giver
        flower = gift_received.flower

        gifts.append(
            GiftResponse(
                id=gift_received.id,
                given_by={
                    "id": giver.id,
                    "username": giver.username,
                    "greeting": giver.greeting,
                    "avatar": {
                        "eyes": giver.avatar.eyes,
                        "mouth": giver.avatar.mouth,
                        "hair": giver.avatar.hair,
                        "clothes": giver.avatar.clothes,
                        "skin_color": giver.avatar.skin_color,
                        "hair_color": giver.avatar.hair_color,
                        "clothes_color": giver.avatar.clothes_color
                    }
                },
                gift_choice={
                    "id": flower.id,
                    "name": flower.name,
                    "fact": flower.fact
                }
            )
        )

    return gifts