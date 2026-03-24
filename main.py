rom fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import logging
import uvicorn

# Basic logging setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

app = FastAPI()

# Serve files from the "static" directory (index.html lives there)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def get_index():
    """Return the chat frontend HTML."""
    with open("static/index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(f.read())


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Accept WebSocket connections, echo back received text messages,
    and log connect / disconnect events.
    """
    # Accept the incoming connection (completes the WS handshake)
    await websocket.accept()
    client = websocket.client or ("unknown", 0)
    logging.info(f"Client connected: {client}")

    try:
        while True:
            # Wait for a text message from the client
            data = await websocket.receive_text()
            logging.info(f"Received from {client}: {data}")

            # Simple echo logic: send the same message back with a prefix
            await websocket.send_text(f"Echo: {data}")

    except WebSocketDisconnect:
        # Normal disconnect from client side
        logging.info(f"Client disconnected: {client}")

    except Exception:
        # Log unexpected errors and try to close the socket gracefully
        logging.exception("Unexpected WebSocket error")
        try:
            await websocket.close(code=1000)
        except Exception:
            pass


if __name__ == "__main__":
    # Run with: python main.py  OR: uvicorn main:app --reload
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info")
