"""
Test database connection
This script will test if we can connect to the Supabase database
"""
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def test_connection():
    print("🔗 Testing database connection...")
    
    DATABASE_URL = os.getenv("DATABASE_URL")
    if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    print(f"📍 Database URL: {DATABASE_URL[:50]}...")
    
    try:
        # Create engine
        engine = create_async_engine(DATABASE_URL, echo=False)
        
        # Test connection
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            print(f"✅ Connection successful! Test query result: {row[0]}")
            
            # Check if tables exist
            tables_result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('users', 'leads', 'tasks', 'user_sessions')
                ORDER BY table_name
            """))
            
            tables = tables_result.fetchall()
            if tables:
                print("📋 Existing tables:")
                for table in tables:
                    print(f"   ✓ {table[0]}")
            else:
                print("📋 No CRM tables found - need to run setup")
                
        await engine.dispose()
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Check internet connection")
        print("2. Verify DATABASE_URL in .env file")
        print("3. Ensure Supabase project is active")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_connection())
    if success:
        print("\n🎉 Database connection is working!")
        print("🚀 You can now start the API server")
    else:
        print("\n💡 Try manual setup using backend/manual_db_setup.sql")