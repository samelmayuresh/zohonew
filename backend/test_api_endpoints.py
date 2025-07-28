#!/usr/bin/env python3
"""
API endpoint validation tests
Tests all major API endpoints for proper functionality
"""

import asyncio
import sys
import os
import json
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    """Test health check endpoint"""
    print("Testing health endpoint...")
    
    response = client.get("/health")
    assert response.status_code == 200, f"Health check failed: {response.status_code}"
    
    data = response.json()
    assert "status" in data, "Health response missing status"
    
    print("✅ Health endpoint test passed")

def test_root_endpoint():
    """Test root endpoint"""
    print("Testing root endpoint...")
    
    response = client.get("/")
    assert response.status_code == 200, f"Root endpoint failed: {response.status_code}"
    
    data = response.json()
    assert "message" in data, "Root response missing message"
    assert "version" in data, "Root response missing version"
    
    print("✅ Root endpoint test passed")

def test_auth_endpoints():
    """Test authentication endpoints"""
    print("Testing authentication endpoints...")
    
    # Test login with mock credentials
    login_data = {
        "username": "superadmin",
        "password": "admin123"
    }
    
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200, f"Login failed: {response.status_code}"
    
    data = response.json()
    assert "access_token" in data, "Login response missing access token"
    assert "user" in data, "Login response missing user data"
    
    token = data["access_token"]
    
    # Test protected endpoint with token
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200, f"Auth me endpoint failed: {response.status_code}"
    
    print("✅ Authentication endpoint tests passed")
    return token

def test_user_endpoints(token: str):
    """Test user management endpoints"""
    print("Testing user endpoints...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test get users
    response = client.get("/api/users/", headers=headers)
    assert response.status_code == 200, f"Get users failed: {response.status_code}"
    
    # Test create user
    user_data = {
        "email": "test@example.com",
        "full_name": "Test User",
        "role": "sales_executive"
    }
    
    response = client.post("/api/users/", json=user_data, headers=headers)
    assert response.status_code == 200, f"Create user failed: {response.status_code}"
    
    data = response.json()
    assert "username" in data, "Create user response missing username"
    assert "password" in data, "Create user response missing password"
    
    print("✅ User endpoint tests passed")

def test_lead_endpoints(token: str):
    """Test lead management endpoints"""
    print("Testing lead endpoints...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test get leads
    response = client.get("/api/leads/", headers=headers)
    assert response.status_code == 200, f"Get leads failed: {response.status_code}"
    
    # Test create lead
    lead_data = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@testcompany.com",
        "phone": "123-456-7890",
        "company": "Test Company",
        "source": "website",
        "status": "new",
        "created_by": "test-user-id"
    }
    
    response = client.post("/api/leads/", json=lead_data, headers=headers)
    assert response.status_code == 200, f"Create lead failed: {response.status_code}"
    
    data = response.json()
    assert "id" in data, "Create lead response missing id"
    assert data["company"] == "Test Company", "Lead data incorrect"
    
    print("✅ Lead endpoint tests passed")

def test_task_endpoints(token: str):
    """Test task management endpoints"""
    print("Testing task endpoints...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test get tasks
    response = client.get("/api/tasks/", headers=headers)
    assert response.status_code == 200, f"Get tasks failed: {response.status_code}"
    
    # Get a user ID for task assignment
    users_response = client.get("/api/users/", headers=headers)
    users = users_response.json()
    if users:
        user_id = users[0]["id"]
        
        # Test create task
        task_data = {
            "title": "Test Task",
            "description": "Test task description",
            "assigned_to": user_id,
            "assigned_by": user_id,
            "status": "pending",
            "priority": "medium"
        }
        
        response = client.post("/api/tasks/", json=task_data, headers=headers)
        assert response.status_code == 200, f"Create task failed: {response.status_code}"
        
        data = response.json()
        assert "id" in data, "Create task response missing id"
        assert data["title"] == "Test Task", "Task data incorrect"
    
    print("✅ Task endpoint tests passed")

def test_email_endpoints(token: str):
    """Test email management endpoints"""
    print("Testing email endpoints...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test get email templates
    response = client.get("/api/email/templates", headers=headers)
    assert response.status_code == 200, f"Get email templates failed: {response.status_code}"
    
    data = response.json()
    assert "templates" in data, "Email templates response missing templates"
    
    # Test get queue stats
    response = client.get("/api/email/queue/stats", headers=headers)
    assert response.status_code == 200, f"Get queue stats failed: {response.status_code}"
    
    data = response.json()
    assert "queue_stats" in data, "Queue stats response missing queue_stats"
    
    print("✅ Email endpoint tests passed")

def test_unauthorized_access():
    """Test unauthorized access protection"""
    print("Testing unauthorized access protection...")
    
    # Test email endpoints that require authentication
    protected_endpoints = [
        "/api/email/templates",
        "/api/email/queue/stats"
    ]
    
    for endpoint in protected_endpoints:
        response = client.get(endpoint)
        assert response.status_code in [401, 403], f"Endpoint {endpoint} should require authentication"
    
    # Test with invalid token
    invalid_headers = {"Authorization": "Bearer invalid.token.here"}
    
    for endpoint in protected_endpoints:
        response = client.get(endpoint, headers=invalid_headers)
        assert response.status_code in [401, 403], f"Endpoint {endpoint} should reject invalid token"
    
    print("✅ Unauthorized access protection tests passed")

def run_all_api_tests():
    """Run all API endpoint tests"""
    print("🧪 Running API endpoint tests...\n")
    
    try:
        # Test public endpoints
        test_health_endpoint()
        test_root_endpoint()
        
        # Test authentication and get token
        token = test_auth_endpoints()
        
        # Test protected endpoints
        test_user_endpoints(token)
        test_lead_endpoints(token)
        test_task_endpoints(token)
        test_email_endpoints(token)
        
        # Test security
        test_unauthorized_access()
        
        print("\n🎉 All API endpoint tests passed!")
        return True
        
    except AssertionError as e:
        print(f"\n❌ API test failed: {e}")
        return False
    except Exception as e:
        print(f"\n💥 API test error: {e}")
        return False

if __name__ == "__main__":
    success = run_all_api_tests()
    sys.exit(0 if success else 1)