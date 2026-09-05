from fastapi import APIRouter
from database import engine
from sqlalchemy import select
from models import User

router = APIRouter()

@router.get("/users")
def get_users():
    with engine.connect() as connection:
        result = connection.execute(select(User))

        users = []

        for user in result:
            users.append({
                "id": user.id,
                "username": user.username,
                "created_at": user.created_at
            })

        return users