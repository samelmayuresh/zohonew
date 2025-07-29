from pydantic import BaseModel, field_serializer
from typing import Optional, Union
from datetime import datetime
from uuid import UUID

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: str
    assigned_by: str
    status: Optional[str] = "pending"
    priority: Optional[str] = "medium"
    due_date: Optional[datetime] = None

class TaskResponse(BaseModel):
    id: Union[str, UUID]
    title: str
    description: Optional[str] = None
    assigned_to: Union[str, UUID]
    assigned_by: Union[str, UUID]
    status: str
    priority: str
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    @field_serializer('id', 'assigned_to', 'assigned_by')
    def serialize_uuids(self, value):
        return str(value) if isinstance(value, UUID) else value

    class Config:
        from_attributes = True
        json_encoders = {UUID: str}

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None