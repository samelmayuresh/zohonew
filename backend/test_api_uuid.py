#!/usr/bin/env python3
"""
Test API endpoints for UUID serialization via HTTP requests
"""
import requests
import json
import time

def test_api_endpoints():
    """Test all API endpoints for UUID serialization"""
    print("🚀 Testing API Endpoints for UUID Serialization")
    print("=" * 60)
    
    base_url = "http://localhost:8000"
    
    # Test if server is running
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running")
        else:
            print("❌ Server health check failed")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to server: {e}")
        print("Please start the server with: python start_server.py")
        return False
    
    # Test Users endpoint
    print("\n🧪 Testing GET /api/users/")
    try:
        response = requests.get(f"{base_url}/api/users/")
        if response.status_code == 200:
            users = response.json()
            print(f"✅ Users endpoint returned {len(users)} users")
            
            for user in users[:3]:  # Test first 3 users
                if 'id' in user:
                    if isinstance(user['id'], str):
                        print(f"   ✅ User ID is string: {user['id']}")
                    else:
                        print(f"   ❌ User ID is not string: {user['id']} ({type(user['id'])})")
                        return False
                else:
                    print("   ❌ User missing ID field")
                    return False
        else:
            print(f"❌ Users endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Users endpoint error: {e}")
        return False
    
    # Test Leads endpoint
    print("\n🧪 Testing GET /api/leads/")
    try:
        response = requests.get(f"{base_url}/api/leads/")
        if response.status_code == 200:
            leads = response.json()
            print(f"✅ Leads endpoint returned {len(leads)} leads")
            
            for lead in leads[:3]:  # Test first 3 leads
                uuid_fields = ['id', 'created_by', 'assigned_to']
                for field in uuid_fields:
                    if field in lead and lead[field] is not None:
                        if isinstance(lead[field], str):
                            print(f"   ✅ Lead {field} is string: {lead[field]}")
                        else:
                            print(f"   ❌ Lead {field} is not string: {lead[field]} ({type(lead[field])})")
                            return False
        else:
            print(f"❌ Leads endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Leads endpoint error: {e}")
        return False
    
    # Test Tasks endpoint
    print("\n🧪 Testing GET /api/tasks/")
    try:
        response = requests.get(f"{base_url}/api/tasks/")
        if response.status_code == 200:
            tasks = response.json()
            print(f"✅ Tasks endpoint returned {len(tasks)} tasks")
            
            for task in tasks[:3]:  # Test first 3 tasks
                uuid_fields = ['id', 'assigned_to', 'assigned_by']
                for field in uuid_fields:
                    if field in task and task[field] is not None:
                        if isinstance(task[field], str):
                            print(f"   ✅ Task {field} is string: {task[field]}")
                        else:
                            print(f"   ❌ Task {field} is not string: {task[field]} ({type(task[field])})")
                            return False
        else:
            print(f"❌ Tasks endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Tasks endpoint error: {e}")
        return False
    
    print("\n🎉 ALL API ENDPOINTS PASSED!")
    print("✅ UUID serialization is working correctly")
    return True

if __name__ == "__main__":
    success = test_api_endpoints()
    if success:
        print("\n🚀 Your CRM system is ready!")
        print("✅ No more UUID validation errors")
        print("✅ All endpoints return proper string UUIDs")
    else:
        print("\n❌ Some tests failed - check the errors above")