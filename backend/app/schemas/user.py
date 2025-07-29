from pydantic import BaseModel, EmailStr, field_serializer
from typing import Optional, Union
from datetime import datetime
from enum import Enum
from uuid import UUID

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    SALES_MANAGER = "sales_manager"
    SALES_EXECUTIVE = "sales_executive"
    SUPPORT_AGENT = "support_agent"
    CUSTOMER = "customer"

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

class UserResponse(BaseModel):
    id: Union[str, UUID]
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @field_serializer('id')
    def serialize_id(self, value):
        return str(value) if isinstance(value, UUID) else value

    class Config:
        from_attributes = True
        json_encoders = {UUID: str}

class UserCredentials(BaseModel):
    username: str
    password: str
    email: str
    full_name: str
    role: str
    email_status: Optional[str] = "not_sent"
    email_error: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None