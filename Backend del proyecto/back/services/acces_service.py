from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException, status

from models.models import UserTable, LibraryAccess
from requests.access_requests import AccessRequest


def create_access(db: Session, access_req: AccessRequest, user_id: int):
    new_access = LibraryAccess(
        user_id = user_id,
        message = access_req.message,
        status = True
    )

    db.add(new_access)
    db.commit()
    db.refresh(new_access)

    return new_access
