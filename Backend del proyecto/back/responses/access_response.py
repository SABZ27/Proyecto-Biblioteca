
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AccessResponse(BaseModel):
    id: int
    user_id: int
    message: str
    status: bool
    created_at: datetime

    class Config:
        from_attributes = True