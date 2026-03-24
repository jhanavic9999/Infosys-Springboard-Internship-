import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .websocket_manager import WebSocketConnectionManager
from .models import Message
from .utils import current_timestamp, bot_response


app = FastAPI()

# Serve frontend static files under /static to avoid catching websocket scopes
app.mount("/static", StaticFiles(directory="frontend"), name="static")


@app.get("/")
async def index():
    return FileResponse('frontend/index.html')


@app.get('/api/room/{room}/history')
async def room_history(room: str, limit: int = 200):
    try:
        history = manager.get_history(room, limit=limit)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

manager = WebSocketConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Accept connection first
    await websocket.accept()
    username = None
    room = None
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            event = payload.get("type")

            if event == "join":
                username = payload.get("username")
                room = payload.get("room")
                await manager.connect_user(websocket, username, room)
                # send recent history to the newly joined user
                history = manager.get_history(room, limit=200)
                for h in history:
                    await manager.send_personal(websocket, h)
                # broadcast system join
                msg = Message(type="system", username="SYSTEM", message=f"{username} joined the room", room=room, timestamp=current_timestamp()).dict()
                await manager.broadcast_room(msg, room)
                # broadcast presence list to room
                users = manager.get_usernames(room)
                presence = {"type":"system","username":"SYSTEM","message":"presence:" + ",".join(users),"room":room,"timestamp":current_timestamp()}
                await manager.broadcast_room(presence, room)

            elif event == "message":
                text = payload.get("message")
                room = payload.get("room")
                username = payload.get("username")
                msg = Message(type="message", username=username, message=text, room=room, timestamp=current_timestamp()).dict()
                # add id handled by manager
                await manager.broadcast_room(msg, room)
                # bot reply if applicable
                bot = bot_response(text)
                if bot:
                    bot_msg = Message(type="message", username="BOT", message=bot, room=room, timestamp=current_timestamp()).dict()
                    await manager.broadcast_room(bot_msg, room)

            elif event == "read":
                # read receipt: {type: 'read', username, room, id}
                room = payload.get('room')
                uid = payload.get('id')
                reader = payload.get('username')
                receipt = {"type":"system","username":"SYSTEM","message":f"read:{uid}:{reader}","room":room,"timestamp":current_timestamp()}
                await manager.broadcast_room(receipt, room)

            elif event == "typing":
                room = payload.get("room")
                username = payload.get("username")
                typing_msg = Message(type="typing", username=username, message="", room=room, timestamp=current_timestamp()).dict()
                await manager.broadcast_room(typing_msg, room)

            elif event == "leave":
                room = payload.get("room")
                username = payload.get("username")
                await manager.disconnect_user(websocket)
                msg = Message(type="system", username="SYSTEM", message=f"{username} left the room", room=room, timestamp=current_timestamp()).dict()
                await manager.broadcast_room(msg, room)
                # update presence
                users = manager.get_usernames(room)
                presence = {"type":"system","username":"SYSTEM","message":"presence:" + ",".join(users),"room":room,"timestamp":current_timestamp()}
                await manager.broadcast_room(presence, room)

    except WebSocketDisconnect:
        # Clean up on disconnect
        usr, r = await manager.disconnect_user(websocket)
        if usr and r:
            msg = Message(type="system", username="SYSTEM", message=f"{usr} left the room", room=r, timestamp=current_timestamp()).dict()
            await manager.broadcast_room(msg, r)
            # update presence after disconnect
            users = manager.get_usernames(r)
            presence = {"type":"system","username":"SYSTEM","message":"presence:" + ",".join(users),"room":r,"timestamp":current_timestamp()}
            await manager.broadcast_room(presence, r)
