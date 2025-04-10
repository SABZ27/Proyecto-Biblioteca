from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional


class UserCreateRequest(BaseModel):
    nombre: str = Field(..., min_length = 2, max_length = 100, description = "Nombre completo del usuario")
    username: str = Field(..., min_length = 3, max_length = 50, description = "Nombre de usuario único")
    email: EmailStr = Field(..., description = "Correo electrónico del usuario")
    phone: str = Field(..., min_length = 5, max_length = 50, description = "Número de teléfono")
    address: str = Field(..., min_length = 5, max_length = 255, description = "Dirección completa")
    role_id: int = Field(..., description = "ID del rol asignado")
    password: str = Field(..., min_length = 6, description = "Contraseña del usuario")
    identificacion: str = Field(..., min_length = 5, max_length = 50, description = "Número de identificación/DNI")
    nivel_academico: Optional[str] = Field(None, max_length = 50, description = "Nivel académico del usuario")
    carrera: Optional[str] = Field(None, max_length = 100, description = "Carrera o programa académico")