import json
from fastapi import APIRouter, WebSocket, Query, status, WebSocketDisconnect, Depends, HTTPException
from auth import verify_access_token
from models import User, MeetingUser, Message, Friendship, FriendshipStatus
from database import get_db
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session

router = APIRouter()

class ConnectionManager:

    def __init__(self):
        self.active_connections: dict[int, WebSocket] = {}

    def get_active_players(self):
        return list(self.active_connections.keys())

    async def connect(self, user_id: int, websocket: WebSocket):
        old_websocket = self.active_connections.get(user_id)

        if old_websocket is not None:
            try:
                await old_websocket.close(
                    code=1000,
                    reason="Replaced by new connection"
                )
            except Exception:
                pass

        await websocket.accept()
        self.active_connections[user_id] = websocket
        return True

    # for location/meeting
    async def send_to_user(self, user_id: int, message: dict):
        websocket = self.active_connections.get(user_id)

        if websocket is not None:
            try:
                await websocket.send_text(json.dumps(message))
            except Exception:
                self.active_connections.pop(user_id, None)

    async def disconnect(self, user_id: int, close_socket: bool = False):
        websocket = self.active_connections.pop(user_id, None)

        if close_socket and websocket is not None:
            try:
                await websocket.close(
                    code=1000,
                    reason="Logged out"
                )
            except Exception:
                pass

        if websocket is not None:
            await self.broadcast(
                json.dumps({
                    "type": "player_left",
                    "user_id": user_id
                })
            )

    async def broadcast(self, message: str):
        dead_user_ids = []

        for uid, connection in list(self.active_connections.items()):
            try:
                await connection.send_text(message)
            except Exception:
                dead_user_ids.append(uid)

        for uid in dead_user_ids:
            self.active_connections.pop(uid, None)

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db)
):

    try:
        payload = verify_access_token(token)
        user_id = int(payload["sub"])
        session_id = payload["session_id"]
    except (HTTPException, KeyError, ValueError):
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="Invalid token"
        )
        return

    user = db.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if user is None or user.active_session_id != session_id:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="Session is no longer active"
        )
        return

    unviewed_count = db.scalar(
        select(func.count())
        .select_from(MeetingUser)
        .where(
            MeetingUser.user_id == user_id,
            MeetingUser.viewed.is_(False)
        )
    )

    unviewed_message_count = db.scalar(
        select(func.count())
        .select_from(Message)
        .where(
            Message.receiver_id == user_id,
            Message.viewed.is_(False)
        )
    )

    friend_count = db.scalar(
        select(func.count())
        .select_from(Friendship)
        .where(
            or_(
                Friendship.sender_id == user_id,
                Friendship.receiver_id == user_id
            ),
            Friendship.status == FriendshipStatus.ACCEPTED
        )
    )

    friend_request_count = db.scalar(
        select(func.count())
        .select_from(Friendship)
        .where(
            Friendship.receiver_id == user_id,
            Friendship.status == FriendshipStatus.PENDING
        )
    )

    await manager.connect(user_id, websocket)

    await websocket.send_text(
        json.dumps({
            "type": "welcome",
            "user_id": user_id,
            "players": manager.get_active_players(),
            "unviewed_meeting_count": unviewed_count,
            "unviewed_message_count": unviewed_message_count,
            "friend_count": friend_count,
            "friend_request_count": friend_request_count
        })
    )

    await manager.broadcast(
        json.dumps({
            "type": "player_joined",
            "user_id": user_id,
        })
    )

    print("Authenticated user:", user_id)
    print("Active players:", manager.get_active_players())

    try:
        while True:
            message = await websocket.receive_text()

            data = json.loads(message)

            print("Received:", data)

    except WebSocketDisconnect:
        await manager.disconnect(
            user_id
        )

                