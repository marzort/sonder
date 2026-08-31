import json
from fastapi import APIRouter, WebSocket, Query, status, WebSocketDisconnect
from auth import verify_access_token

DIRECTION_DELTAS = {
    "up": (0, -10),
    "down": (0, 10),
    "left": (-10, 0),
    "right": (10, 0)
}

router = APIRouter()

active_players = {}
active_connections = {}

async def broadcast(message):
    for connection in active_connections.values():
        await connection.send_text(message)

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    try:
        payload = verify_access_token(token)
        user_id = int(payload["sub"])
    except (Exception, KeyError, ValueError):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    if user_id in active_connections:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="User already has an active connection"
        )
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

                if direction not in DIRECTION_DELTAS:
                    continue

                player = active_players[user_id]

                dx, dy = DIRECTION_DELTAS[direction]

                new_x = player["x"] + dx
                new_y = player["y"] + dy

                if new_x < 0 or new_x > 570:
                    continue

                if new_y < 0 or new_y > 370:
                    continue

                player["x"] = new_x
                player["y"] = new_y

                print(
                    "Player moved:",
                    user_id,
                    player["x"],
                    player["y"]
                )

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

                