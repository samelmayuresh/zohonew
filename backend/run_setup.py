"""
Manual database setup script
Run this after setting up your database tables in Supabase
"""
import asyncio
from app.utils.database import create_default_admin

async def main():
    print("🚀 Setting up CRM Database...")
    print()
    
    try:
        await create_default_admin()
        print("✅ Database setup completed successfully!")
        print()
        print("Default Super Admin Account:")
        print("Username: superadmin")
        print("Password: admin123")
        print("Email: admin@crm.com")
        print()
        print("You can now start the API server with:")
        print("python -m uvicorn app.main:app --reload --port 8000")
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        print()
        print("Please ensure you have:")
        print("1. Created the database tables using the SQL from backend/setup_db.py")
        print("2. Updated the DATABASE_URL in backend/.env with correct credentials")
        print("3. Your Supabase database is accessible")

if __name__ == "__main__":
    asyncio.run(main())