"""
Test login functionality
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_login():
    print("🔐 Testing login functionality...")
    
    # Test login with super admin credentials
    login_data = {
        "username": "superadmin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        print(f"Login response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"   Token: {data['access_token'][:50]}...")
            print(f"   User: {data['user']['full_name']} ({data['user']['role']})")
            
            # Test protected endpoint
            headers = {"Authorization": f"Bearer {data['access_token']}"}
            me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
            
            if me_response.status_code == 200:
                print("✅ Protected endpoint working!")
            else:
                print(f"❌ Protected endpoint failed: {me_response.status_code}")
                
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_login()