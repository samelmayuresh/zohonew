"""
Simple API test script
Run this to test if the API is working correctly
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_api():
    print("🧪 Testing CRM API...")
    print()
    
    try:
        # Test root endpoint
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Root endpoint working")
            data = response.json()
            print(f"   Message: {data['message']}")
        else:
            print("❌ Root endpoint failed")
            return
        
        # Test health check
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check: {data['status']}")
            print(f"   Database: {data['database']}")
        else:
            print("❌ Health check failed")
        
        # Test API docs
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ API documentation available at /docs")
        else:
            print("❌ API documentation not accessible")
        
        print()
        print("🎉 API is running successfully!")
        print(f"📖 Visit {BASE_URL}/docs for interactive API documentation")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API")
        print("   Make sure the server is running with:")
        print("   python -m uvicorn app.main:app --reload --port 8000")
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_api()