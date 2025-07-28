"""
Mock database for development when real database is not accessible
This allows us to continue development and testing
"""
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from app.schemas.user import UserResponse, UserCredentials, UserRole

class MockDatabase:
    def __init__(self):
        # Mock data storage
        self.users = []
        self.leads = []
        self.tasks = []
        self.sessions = []
        
        # Create default super admin
        self._create_default_admin()
    
    def _create_default_admin(self):
        """Create default super admin user"""
        from app.services.auth_service import get_password_hash
        
        admin_user = {
            "id": str(uuid.uuid4()),
            "username": "superadmin",
            "email": "admin@crm.com",
            "password_hash": get_password_hash("admin123"),  # Generate fresh hash
            "full_name": "Super Admin",
            "role": "super_admin",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "created_by": None
        }
        self.users.append(admin_user)
    
    async def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user by username"""
        for user in self.users:
            if user["username"] == username:
                return user
        return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        for user in self.users:
            if user["email"] == email:
                return user
        return None
    
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new user"""
        new_user = {
            "id": str(uuid.uuid4()),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            **user_data
        }
        self.users.append(new_user)
        return new_user
    
    async def get_all_users(self) -> List[Dict[str, Any]]:
        """Get all active users"""
        return [user for user in self.users if user.get("is_active", True)]
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        for user in self.users:
            if user["id"] == user_id:
                return user
        return None
    
    async def create_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new lead"""
        new_lead = {
            "id": str(uuid.uuid4()),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            **lead_data
        }
        self.leads.append(new_lead)
        return new_lead
    
    async def get_all_leads(self) -> List[Dict[str, Any]]:
        """Get all leads"""
        return self.leads
    
    async def create_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new task"""
        new_task = {
            "id": str(uuid.uuid4()),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            **task_data
        }
        self.tasks.append(new_task)
        return new_task
    
    async def get_all_tasks(self) -> List[Dict[str, Any]]:
        """Get all tasks"""
        return self.tasks
    
    async def get_lead_by_id(self, lead_id: str) -> Optional[Dict[str, Any]]:
        """Get lead by ID"""
        for lead in self.leads:
            if lead["id"] == lead_id:
                return lead
        return None
    
    async def get_task_by_id(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get task by ID"""
        for task in self.tasks:
            if task["id"] == task_id:
                return task
        return None
    
    async def update_task(self, task_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update task by ID"""
        for task in self.tasks:
            if task["id"] == task_id:
                task.update(update_data)
                task["updated_at"] = datetime.utcnow()
                if update_data.get("status") == "completed":
                    task["completed_at"] = datetime.utcnow()
                return task
        return None

# Global mock database instance
mock_db = MockDatabase()

async def get_mock_db():
    """Get mock database instance"""
    return mock_db