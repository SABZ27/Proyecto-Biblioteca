from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

from database import Base

class UserTable(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    phone = Column(String(50), nullable=False)
    address = Column(String(255), nullable=False)
    rol = Column(Enum('Administrador', 'Funcionario', 'Docente', 'Estudiante'), nullable=False)
    password = Column(String(255), nullable=False)
    identificacion = Column(String(50), unique=True, index=True)
    nivel_academico = Column(String(50), nullable=True)
    carrera = Column(String(100), nullable=True)

class LibraryAccess(Base):
    __tablename__ = "library_access"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    message = Column(String(255), nullable=False)
    status = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)