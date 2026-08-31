import json
from fastapi import (
    FastAPI, 
    Depends, 
    HTTPException, 
    WebSocket, 
    Query, 
    status,
    WebSocketDisconnect
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.orm import Session
from database import engine, get_db
from models import Base, User, Avatar
from schemas import RegisterRequest, LoginRequest, AvatarUpdateRequest
from auth import hash_password, verify_password, create_access_token, verify_access_token, get_current_user

app = FastAPI()
security = HTTPBearer()

active_players = {}
active_connections = {}

async def broadcast(message):
    for connection in active_connections.values():
        await connection.send_text(message)

Base.metadata.create_all(engine)

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

@app.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    user = db.execute(
        select(User).where(request.username == User.username)
        ).scalar_one_or_none()

    if user is not None:
        raise HTTPException(
            status_code=409,
            detail="Username already taken"
        )
    
    hashed_password = hash_password(request.password)

    user = User(
        username = request.username,
        password_hash = hashed_password
    )

    try:
        db.add(user)
        db.flush()

        avatar = Avatar(
            user_id = user.id,
            eyes = "default",
            mouth = "default",
            hair = "bigHair",
            clothes = "hoodie",
            skin_color = "614335",
            hair_color = "a55728",
            clothes_color = "65c9ff"
        )

        db.add(avatar)
        db.commit()
    except:
        db.rollback()
        raise

    return {
        "message": "Registration successful",
        "username": user.username
    }

@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    username = request.username.strip()
    user = db.execute(
        select(User).where(User.username == username)
    ).scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = create_access_token(user.id)

    return {"access_token": token}

@app.get("/profile")
def profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "created_at": current_user.created_at,
        "avatar": {
            "eyes": current_user.avatar.eyes,
            "mouth": current_user.avatar.mouth,
            "hair": current_user.avatar.hair,
            "clothes": current_user.avatar.clothes,
            "skin_color": current_user.avatar.skin_color,
            "hair_color": current_user.avatar.hair_color,
            "clothes_color": current_user.avatar.clothes_color
        }
    }

@app.put("/avatar")
def update_avatar(
    request: AvatarUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    avatar = db.execute(
        select(Avatar).where(Avatar.user_id == current_user.id)
    ).scalar_one_or_none()

    if avatar is None:
        raise HTTPException(
            status_code=404,
            detail="Avatar not found"
        )

    avatar.eyes = request.eyes
    avatar.mouth = request.mouth
    avatar.hair = request.hair
    avatar.clothes = request.clothes
    avatar.skin_color = request.skin_color
    avatar.hair_color = request.hair_color
    avatar.clothes_color = request.clothes_color

    db.commit()

    return {
        "eyes": avatar.eyes,
        "mouth": avatar.mouth,
        "hair": avatar.hair,
        "clothes": avatar.clothes,
        "skin_color": avatar.skin_color,
        "hair_color": avatar.hair_color,
        "clothes_color": avatar.clothes_color
    }

@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    try:
        payload = verify_access_token(token)
        user_id = int(payload["sub"])
    except (HTTPException, KeyError, ValueError):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()

    active_connections[user_id] = websocket

    active_players[user_id] = {
        "x": 100 + (len(active_players) * 50),
        "y": 100
    }

    await websocket.send_text(
        json.dumps({
            "type": "welcome",
            "user_id": user_id,
            "players": active_players
        })
    )

    await broadcast(
        json.dumps({
            "type": "player_joined",
            "user_id": user_id,
            "x": active_players[user_id]["x"],
            "y": active_players[user_id]["y"]
        })
    )

    print("Authenticated user:", user_id)
    print("Active players:", active_players)

    try:
        while True:
            message = await websocket.receive_text()

            data = json.loads(message)

            print("Received:", data)

            if data["type"] == "move":
                direction = data["direction"]

                player = active_players[user_id]
                new_x = player["x"]
                new_y = player["y"]

                if direction == "up":
                    new_y -= 10

                elif direction == "down":
                    new_y += 10

                elif direction == "left":
                    new_x -= 10

                elif direction == "right":
                    new_x += 10

                else:
                    continue

                if new_x < 0 or new_x > 570:
                    continue

                if new_y < 0 or new_y > 370:
                    continue

                player["x"] = new_x
                player["y"] = new_y

                print("Player moved:", user_id, player["x"], player["y"])

                await broadcast(
                    json.dumps({
                        "type": "player_moved",
                        "user_id": user_id,
                        "x": player["x"],
                        "y": player["y"]
                    })
                )

    except WebSocketDisconnect:
        active_players.pop(user_id, None)
        active_connections.pop(user_id, None)

        print("User disconnected:", user_id)
        print("Active players:", active_players)

        await broadcast(
            json.dumps({
                "type": "player_left",
                "user_id": user_id
            })
        )