import json
from fastapi import APIRouter, WebSocket, Query, status, WebSocketDisconnect, Depends
from auth import verify_access_token, active_sessions
from models import MeetingUser
from database import get_db
from sqlalchemy import select, func
from sqlalchemy.orm import Session

router = APIRouter()

class ConnectionManager:

    def __init__(self):
        self.active_connections = {}

    def get_active_players(self):
        return list(self.active_connections.keys())

    async def connect(self, user_id, websocket):
        if user_id in self.active_connections:
            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION,
                reason="User already connected"
            )
            return False

        await websocket.accept()

        self.active_connections[user_id] = websocket

        return True

    # for location/meeting
    async def send_to_user(self, user_id, message):
        websocket = self.active_connections.get(user_id)

        if websocket is not None:
            await websocket.send_text(
                json.dumps(message)
            )

    async def disconnect(self, user_id, session_id=None, close_socket=False):
        websocket = self.active_connections.pop(user_id, None)

        if session_id is None or active_sessions.get(user_id) == session_id:
            active_sessions.pop(user_id, None)

        if close_socket and websocket is not None:
            await websocket.close(
                code=1000,
                reason="Logged out"
            )

        await self.broadcast(
            json.dumps({
                "type": "player_left",
                "user_id": user_id
            })
        )

    async def broadcast(self, message):
        for connection in self.active_connections.values():
            await connection.send_text(message)

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
    except (KeyError, ValueError):
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="Invalid token"
        )
        return

    if active_sessions.get(user_id) != session_id:
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

    connected = await manager.connect(user_id, websocket)

    if not connected:
        return

    await websocket.send_text(
        json.dumps({
            "type": "welcome",
            "user_id": user_id,
            "players": manager.get_active_players(),
            "unviewed_meeting_count": unviewed_count
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
            user_id,
            session_id=session_id
        )

        await manager.broadcast(
            json.dumps({
                "type": "player_left",
                "user_id": user_id
            })
        )

                