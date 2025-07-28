"""
Test if the server can start without database connection
"""
import uvicorn
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_server():
    print("🧪 Testing server startup...")
    print("📝 This will start the server without requiring database connection")
    print("🔧 Press CTRL+C to stop")
    print("=" * 50)
    
    try:
        uvicorn.run(
            "app.main:app",
            host="127.0.0.1",
            port=8000,
            reload=False,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Server failed to start: {e}")

if __name__ == "__main__":
    test_server()