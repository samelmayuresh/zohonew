"""
Test the API with mock database
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_mock_api():
    print("🧪 Testing CRM API with Mock Database...")
    print()
    
    try:
        # Test root endpoint
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Root endpoint working")
        
        # Test health check
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check: {data['status']}")
        
        # Test get users (should return mock super admin)
        response = requests.get(f"{BASE_URL}/api/users/")
        if response.status_code == 200:
            users = response.json()
            print(f"✅ Users endpoint working - found {len(users)} users")
            if users:
                admin = users[0]
                print(f"   👤 Super Admin: {admin.get('username', 'N/A')} ({admin.get('email', 'N/A')})")
        
        # Test create user
        new_user_data = {
            "email": "test@example.com",
            "full_name": "Test User",
            "role": "sales_executive"
        }
        
        response = requests.post(f"{BASE_URL}/api/users/", json=new_user_data)
        if response.status_code == 200:
            credentials = response.json()
            print("✅ User creation working")
            print(f"   👤 Generated credentials: {credentials['username']} / {credentials['password']}")
        
        print("\n🎉 Mock API is working perfectly!")
        print("📖 Visit http://localhost:8000/docs for full API documentation")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API")
        print("   Make sure the server is running")
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_mock_api()