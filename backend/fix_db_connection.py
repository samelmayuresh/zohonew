"""
Fix database connection issues
This script will test and fix the database connection
"""
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Minesh@2007@db.lxfoxkdnsibznmyszsvz.supabase.co:5432/postgres")

# Convert to async format
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

async def test_and_fix_connection():
    print("🔧 Testing and fixing database connection...")
    print(f"📍 Database URL: {DATABASE_URL[:50]}...")
    
    try:
        # Create engine with better connection settings
        engine = create_async_engine(
            DATABASE_URL,
            echo=False,
            pool_pre_ping=True,
            pool_recycle=300,
            connect_args={
                "server_settings": {
                    "application_name": "CRM_API",
                }
            }
        )
        
        # Create session maker
        AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        print("🔗 Testing connection...")
        
        # Test basic connection
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            print(f"✅ Basic connection successful! Test result: {row[0]}")
        
        # Test session-based queries
        async with AsyncSessionLocal() as session:
            # Check if tables exist
            result = await session.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('users', 'leads', 'tasks', 'user_sessions')
                ORDER BY table_name
            """))
            
            tables = result.fetchall()
            if tables:
                print("📋 Found CRM tables:")
                for table in tables:
                    print(f"   ✓ {table[0]}")
            else:
                print("❌ No CRM tables found!")
                return False
            
            # Check if super admin exists
            result = await session.execute(text(
                "SELECT username, email, role FROM users WHERE role = 'super_admin' LIMIT 1"
            ))
            admin = result.fetchone()
            
            if admin:
                print(f"👤 Super Admin found:")
                print(f"   Username: {admin[0]}")
                print(f"   Email: {admin[1]}")
                print(f"   Role: {admin[2]}")
            else:
                print("⚠️  No super admin found - creating one...")
                
                # Create super admin
                await session.execute(text("""
                    INSERT INTO users (username, email, password_hash, full_name, role, is_active)
                    VALUES ('superadmin', 'admin@crm.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'Super Admin', 'super_admin', true)
                    ON CONFLICT (email) DO NOTHING
                """))
                await session.commit()
                print("✅ Super admin created!")
        
        await engine.dispose()
        print("\n🎉 Database connection is working perfectly!")
        print("👤 Default credentials: superadmin / admin123")
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\n🔧 Troubleshooting steps:")
        print("1. Check if your internet connection is stable")
        print("2. Verify the DATABASE_URL in .env file")
        print("3. Ensure your Supabase project is active")
        print("4. Try running the manual SQL setup again")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_and_fix_connection())
    if success:
        print("\n🚀 Ready to start the API server!")
    else:
        print("\n💡 Please check your database setup")