from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.utils.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Relationships - using string references to avoid circular imports
    created_leads = relationship("Lead", foreign_keys="Lead.created_by", back_populates="creator", lazy="select")
    assigned_leads = relationship("Lead", foreign_keys="Lead.assigned_to", back_populates="assignee", lazy="select")
    created_tasks = relationship("Task", foreign_keys="Task.assigned_by", back_populates="creator", lazy="select")
    assigned_tasks = relationship("Task", foreign_keys="Task.assigned_to", back_populates="assignee", lazy="select")