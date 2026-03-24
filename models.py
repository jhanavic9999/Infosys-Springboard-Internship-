from pydantic import BaseModel
from typing import Literal


class Message(BaseModel):
    type: Literal["message", "system", "typing"]
    username: str = ""
    message: str = ""
    room: str = ""
    timestamp: str = ""
