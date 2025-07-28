"""
Test user creation functionality
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_user_creation():
    print("👤 Testing user creation...")
    
    # Test data for new user
    user_data = {
        "email": "testuser@example.com",
        "full_name": "Test User",
        "role": "sales_executive"
    }
    
    try:
        # Create user
        response = requests.post(f"{BASE_URL}/api/users/", json=user_data)
        print(f"Create user response: {response.status_code}")
        
        if response.status_code == 200:
            credentials = response.json()
            print("✅ User creation successful!")
            print(f"   Username: {credentials['username']}")
            print(f"   Password: {credentials['password']}")
            print(f"   Email: {credentials['email']}")
            print(f"   Role: {credentials['role']}")
            
            # Test login with new credentials
            login_data = {
                "username": credentials['username'],
                "password": credentials['password']
            }
            
            login_response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
            
            if login_response.status_code == 200:
                print("✅ New user can login successfully!")
                login_result = login_response.json()
                print(f"   User role: {login_result['user']['role']}")
            else:
                print(f"❌ New user login failed: {login_response.status_code}")
                
        else:
            print(f"❌ User creation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
        # Test duplicate email
        print("\n🔄 Testing duplicate email...")
        duplicate_response = requests.post(f"{BASE_URL}/api/users/", json=user_data)
        
        if duplicate_response.status_code == 400:
            print("✅ Duplicate email properly rejected")
        else:
            print(f"❌ Duplicate email not handled: {duplicate_response.status_code}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_user_creation()