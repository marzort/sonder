from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from database import engine
from models import User

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/users")
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