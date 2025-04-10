from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from requests.access_requests import AccessRequest
from responses.access_response import AccessResponse
from services.acces_service import create_access
from services.user_service import get_user_by_dni

access_router = APIRouter(
    prefix="/api/library-access",
    tags=["library-access"]
)

@access_router.post("/", response_model = AccessResponse, status_code = status.HTTP_201_CREATED)
def create_library_access(access_req: AccessRequest, db: Session = Depends(get_db)):
    # Buscar el usuario por su DNI
    user = get_user_by_dni(db, access_req.dni)

    # Crear el registro de acceso
    new_access = create_access(db, access_req, user.id)

    # Crear la respuesta
    return {
        "id": new_access.id,
        "user_id": new_access.user_id,
        "message": new_access.message,
        "status": new_access.status,
        "created_at": new_access.created_at,
        "user_name": user.nombre
    }
