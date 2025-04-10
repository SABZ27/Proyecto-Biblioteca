
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AccessRequest(BaseModel):
    dni: str
    message: Optional[str] = "Acceso a biblioteca"