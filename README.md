# Chatterbox — Milestone 1

Basic WebSocket echo app using FastAPI and Uvicorn.

Files created:
- `main.py` — FastAPI app and WebSocket endpoint
- `requirements.txt` — needed Python packages
- `static/index.html` — simple frontend that connects to `/ws`

Quick start (Windows):

```powershell
python -m venv venv
venv\Scripts\Activate.ps1   # or venv\Scripts\activate.bat for cmd.exe
pip install -r requirements.txt
uvicorn main:app --reload
```

Open http://localhost:8000 in your browser. The page served by the app
connects to `ws://localhost:8000/ws` and will echo messages.

Notes:
- The server logs connect/disconnect events and incoming messages to stdout.
- The frontend is intentionally simple for Milestone 1.
