"""
Debug authentication issue
"""
import asyncio
from app.utils.mock_database import get_mock_db
from app.services.auth_service import verify_password

async def debug_auth():
    print("🔍 Debugging authentication...")
    
    mock_db = await get_mock_db()
    
    # Check if super admin exists
    user = await mock_db.get_user_by_username("superadmin")
    
    if user:
        print(f"✅ User found: {user['username']}")
        print(f"   Email: {user['email']}")
        print(f"   Role: {user['role']}")
        print(f"   Password hash: {user['password_hash'][:50]}...")
        
        # Test password verification
        is_valid = verify_password("admin123", user['password_hash'])
        print(f"   Password verification: {'✅ Valid' if is_valid else '❌ Invalid'}")
        
    else:
        print("❌ Super admin user not found!")
        
        # List all users
        all_users = await mock_db.get_all_users()
        print(f"All users in mock DB: {len(all_users)}")
        for u in all_users:
            print(f"  - {u.get('username', 'NO_USERNAME')} ({u.get('email', 'NO_EMAIL')})")

if __name__ == "__main__":
    asyncio.run(debug_auth())