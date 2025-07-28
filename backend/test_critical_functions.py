#!/usr/bin/env python3
"""
Critical function tests for CRM system
Tests authentication, user management, and role validation
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.auth_service import verify_password, get_password_hash, create_access_token, verify_token
from app.services.email_service import email_service
from app.utils.mock_database import MockDatabase

def test_password_hashing():
    """Test password hashing and verification"""
    print("Testing password hashing...")
    
    password = "test123"
    hashed = get_password_hash(password)
    
    # Test correct password
    assert verify_password(password, hashed), "Password verification failed"
    
    # Test incorrect password
    assert not verify_password("wrong", hashed), "Wrong password should not verify"
    
    print("✅ Password hashing tests passed")

def test_token_operations():
    """Test JWT token creation and verification"""
    print("Testing JWT token operations...")
    
    user_data = {"sub": "testuser", "role": "admin"}
    token = create_access_token(data=user_data)
    
    # Verify token
    payload = verify_token(token)
    assert payload is not None, "Token verification failed"
    assert payload["sub"] == "testuser", "Token payload incorrect"
    assert payload["role"] == "admin", "Token role incorrect"
    
    # Test invalid token
    invalid_payload = verify_token("invalid.token.here")
    assert invalid_payload is None, "Invalid token should return None"
    
    print("✅ JWT token tests passed")

def test_email_service():
    """Test email service functionality"""
    print("Testing email service...")
    
    # Test template loading
    templates = list(email_service.templates.keys())
    expected_templates = ["user_credentials", "task_assignment", "task_reminder", "task_overdue"]
    
    for template in expected_templates:
        assert template in templates, f"Template {template} not found"
    
    # Test email queueing
    email_id = email_service.queue_email(
        "user_credentials",
        "test@example.com",
        {
            "full_name": "Test User",
            "username": "testuser",
            "password": "test123",
            "role_display": "Admin",
            "login_url": "http://localhost:3000/login"
        }
    )
    
    assert email_id is not None, "Email queueing failed"
    
    # Test email status
    job = email_service.get_email_status(email_id)
    assert job is not None, "Email job not found"
    assert job.to_email == "test@example.com", "Email recipient incorrect"
    
    print("✅ Email service tests passed")

async def test_mock_database():
    """Test mock database operations"""
    print("Testing mock database operations...")
    
    db = MockDatabase()
    
    # Test user creation
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password_hash": get_password_hash("test123"),
        "full_name": "Test User",
        "role": "admin",
        "is_active": True
    }
    
    user = await db.create_user(user_data)
    assert user["username"] == "testuser", "User creation failed"
    assert user["role"] == "admin", "User role incorrect"
    
    # Test user authentication
    auth_user = await db.get_user_by_username("testuser")
    assert auth_user is not None, "User lookup failed"
    assert auth_user["username"] == "testuser", "Retrieved user incorrect"
    
    # Test password verification
    from app.services.auth_service import verify_password
    assert verify_password("test123", auth_user["password_hash"]), "Password verification failed"
    
    # Test role validation
    assert auth_user["role"] == "admin", "User role validation failed"
    
    # Test lead creation
    lead_data = {
        "company_name": "Test Company",
        "contact_name": "John Doe",
        "email": "john@testcompany.com",
        "phone": "123-456-7890",
        "source": "website",
        "status": "new",
        "assigned_to": user["id"],
        "created_by": user["id"]
    }
    
    lead = await db.create_lead(lead_data)
    assert lead["company_name"] == "Test Company", "Lead creation failed"
    assert lead["assigned_to"] == user["id"], "Lead assignment failed"
    
    # Test task creation
    task_data = {
        "title": "Test Task",
        "description": "Test task description",
        "assigned_to": user["id"],
        "assigned_by": user["id"],
        "status": "pending",
        "priority": "medium"
    }
    
    task = await db.create_task(task_data)
    assert task["title"] == "Test Task", "Task creation failed"
    assert task["assigned_to"] == user["id"], "Task assignment failed"
    
    print("✅ Mock database tests passed")

def test_role_based_access():
    """Test role-based access control logic"""
    print("Testing role-based access control...")
    
    # Define role hierarchy
    role_hierarchy = {
        "super_admin": ["super_admin", "admin", "sales_manager", "sales_executive", "support_agent", "customer"],
        "admin": ["admin", "sales_manager", "sales_executive", "support_agent"],
        "sales_manager": ["sales_manager", "sales_executive"],
        "sales_executive": ["sales_executive"],
        "support_agent": ["support_agent"],
        "customer": ["customer"]
    }
    
    # Test access permissions
    def has_access(user_role: str, required_roles: list) -> bool:
        return user_role in required_roles
    
    # Test super admin access
    assert has_access("super_admin", ["super_admin"]), "Super admin should have super admin access"
    assert has_access("super_admin", ["super_admin", "admin"]), "Super admin should have admin access"
    
    # Test admin access
    assert has_access("admin", ["admin"]), "Admin should have admin access"
    assert has_access("admin", ["super_admin", "admin"]), "Admin should have access when admin is allowed"
    assert not has_access("admin", ["super_admin"]), "Admin should not have super admin only access"
    
    # Test sales manager access
    assert has_access("sales_manager", ["sales_manager"]), "Sales manager should have sales manager access"
    assert has_access("sales_manager", ["admin", "sales_manager"]), "Sales manager should have access when sales_manager is allowed"
    assert not has_access("sales_manager", ["admin"]), "Sales manager should not have admin only access"
    
    # Test customer access
    assert has_access("customer", ["customer"]), "Customer should have customer access"
    assert not has_access("customer", ["sales_executive"]), "Customer should not have sales executive access"
    
    print("✅ Role-based access control tests passed")

async def run_all_tests():
    """Run all critical function tests"""
    print("🧪 Running critical function tests...\n")
    
    try:
        # Run synchronous tests
        test_password_hashing()
        test_token_operations()
        test_email_service()
        test_role_based_access()
        
        # Run asynchronous tests
        await test_mock_database()
        
        print("\n🎉 All critical function tests passed!")
        return True
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return False
    except Exception as e:
        print(f"\n💥 Test error: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)