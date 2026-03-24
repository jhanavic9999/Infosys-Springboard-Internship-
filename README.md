# ChatterBox — Real-Time Chat

A clean, modern WebSocket chat built with FastAPI and vanilla frontend.

Run locally

```powershell
# create venv (optional)
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000

Features

- Room-based chat (general, room1, room2, tech)
- Typing indicator
- Message history per room (in-memory)
- Simple username-based login (no password)
- Read receipts
- Intelligent bot replies for `hello` and `help`

Notes

- History is kept in-memory in the backend and will reset when server restarts.
- For production, persist messages to a database and add authentication.
