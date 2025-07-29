from pydantic import BaseModel, EmailStr, field_serializer
from typing import Optional, Union
from datetime import datetime
from uuid import UUID

class LeadCreate(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = "new"
    assigned_to: Optional[str] = None
    created_by: str

class LeadResponse(BaseModel):
    id: Union[str, UUID]
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = None
    status: str
    assigned_to: Optional[Union[str, UUID]] = None
    created_by: Union[str, UUID]
    created_at: datetime
    updated_at: datetime

    @field_serializer('id', 'assigned_to', 'created_by')
    def serialize_uuids(self, value):
        if value is None:
            return None
        return str(value) if isinstance(value, UUID) else value

    class Config:
        from_attributes = True
        json_encoders = {UUID: str}

class LeadUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None