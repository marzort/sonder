import json
from fastapi import APIRouter, WebSocket, Query, status, WebSocketDisconnect
from auth import verify_access_token, active_sessions

DIRECTION_DELTAS = {
    "up": (0, -10),
    "down": (0, 10),
    "left": (-10, 0),
    "right": (10, 0)
}

router = APIRouter()

class ConnectionManager:

    def __init__(self):
        self.active_connections = {}
        self.active_players = {}

    async def connect(self, user_id, websocket):
        if user_id in self.active_connections:
            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION,
                reason="User already connected"
            )
            return False

        await websocket.accept()

        self.active_connections[user_id] = websocket

        self.active_players[user_id] = {
            "x": 100 + (len(self.active_players) * 50),
            "y": 100
        }

        return True

    async def disconnect(self, user_id, session_id=None, close_socket=False):
        websocket = self.active_connections.pop(user_id, None)

        self.active_players.pop(user_id, None)

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
    token: str = Query(...)
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

    connected = await manager.connect(user_id, websocket)

    if not connected:
        return

    await websocket.send_text(
        json.dumps({
            "type": "welcome",
            "user_id": user_id,
            "players": manager.active_players
        })
    )

    await manager.broadcast(
        json.dumps({
            "type": "player_joined",
            "user_id": user_id,
            "x": manager.active_players[user_id]["x"],
            "y": manager.active_players[user_id]["y"]
        })
    )

    try:
        while True:
            message = await websocket.receive_text()

            data = json.loads(message)

            print("Received:", data)

            if data["type"] == "move":
                direction = data["direction"]

                if direction not in DIRECTION_DELTAS:
                    continue

                player = manager.active_players[user_id]

                dx, dy = DIRECTION_DELTAS[direction]

                new_x = player["x"] + dx
                new_y = player["y"] + dy

                if new_x < 0 or new_x > 570:
                    continue

                if new_y < 0 or new_y > 370:
                    continue

                player["x"] = new_x
                player["y"] = new_y

                await manager.broadcast(
                    json.dumps({
                        "type": "player_moved",
                        "user_id": user_id,
                        "x": player["x"],
                        "y": player["y"]
                    })
                )

    except WebSocketDisconnect:
        await manager.disconnect(
            user_id,
            session_id=session_id
        )

                