from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
import datetime
import asyncio
import json

app = FastAPI()
clients = set()
clients_lock = asyncio.Lock()


@app.get("/")
async def index():
    return FileResponse("index.html")


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    async with clients_lock:
        clients.add(ws)
    try:
        while True:
            data = await ws.receive_text()
            try:
                payload = json.loads(data)
                username = payload.get("username", "Anonymous")
                message = payload.get("message", "")
            except Exception:
                username = "Anonymous"
                message = data

            timestamp = datetime.datetime.now().strftime("%H:%M")
            msg = {"username": username, "message": message, "timestamp": timestamp}
            text = json.dumps(msg)

            async with clients_lock:
                closed = []
                for client in clients:
                    try:
                        await client.send_text(text)
                    except Exception:
                        closed.append(client)
                for c in closed:
                    clients.discard(c)

    except WebSocketDisconnect:
        async with clients_lock:
            clients.discard(ws)
