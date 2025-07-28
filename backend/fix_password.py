"""
Fix password hash issue
"""
import asyncio
from app.services.auth_service import get_password_hash, verify_password

async def fix_password():
    print("🔧 Fixing password hash...")
    
    # Generate new hash for admin123
    new_hash = get_password_hash("admin123")
    print(f"New hash: {new_hash}")
    
    # Test verification
    is_valid = verify_password("admin123", new_hash)
    print(f"Verification test: {'✅ Valid' if is_valid else '❌ Invalid'}")
    
    # Update mock database
    from app.utils.mock_database import mock_db
    
    # Find and update super admin
    for user in mock_db.users:
        if user['username'] == 'superadmin':
            user['password_hash'] = new_hash
            print("✅ Updated super admin password hash")
            break
    
    # Test again
    user = await mock_db.get_user_by_username("superadmin")
    if user:
        is_valid = verify_password("admin123", user['password_hash'])
        print(f"Final verification: {'✅ Valid' if is_valid else '❌ Invalid'}")

if __name__ == "__main__":
    asyncio.run(fix_password())