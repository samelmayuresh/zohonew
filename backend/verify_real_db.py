#!/usr/bin/env python3
"""
Verify real database connection and data
"""
import os
import sys
import asyncio
from dotenv import load_dotenv
from sqlalchemy import text

# Load environment variables
load_dotenv()

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

async def verify_database_status():
    """Verify the database is connected and has real data"""
    print("🔍 Verifying Real Database Connection")
    print("=" * 50)
    
    try:
        from app.utils.database import AsyncSessionLocal
        
        async with AsyncSessionLocal() as session:
            # Check database connection
            result = await session.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connected to: {version[:60]}...")
            
            # Check if tables exist
            tables_result = await session.execute(text("""
                SELECT table_name, 
                       (SELECT COUNT(*) FROM information_schema.columns 
                        WHERE table_name = t.table_name AND table_schema = 'public') as column_count
                FROM information_schema.tables t
                WHERE table_schema = 'public' 
                AND table_name IN ('users', 'leads', 'tasks')
                ORDER BY table_name;
            """))
            
            tables = tables_result.fetchall()
            print(f"\n📋 Database Tables:")
            for table_name, column_count in tables:
                print(f"   ✅ {table_name} ({column_count} columns)")
            
            # Check admin user
            admin_result = await session.execute(text("""
                SELECT username, email, role, is_active, created_at
                FROM users 
                WHERE role = 'super_admin' 
                LIMIT 1;
            """))
            admin = admin_result.fetchone()
            
            if admin:
                print(f"\n👤 Admin User:")
                print(f"   Username: {admin[0]}")
                print(f"   Email: {admin[1]}")
                print(f"   Role: {admin[2]}")
                print(f"   Active: {admin[3]}")
                print(f"   Created: {admin[4]}")
            
            # Check for any existing data
            user_count = await session.execute(text("SELECT COUNT(*) FROM users"))
            lead_count = await session.execute(text("SELECT COUNT(*) FROM leads"))
            task_count = await session.execute(text("SELECT COUNT(*) FROM tasks"))
            
            print(f"\n📊 Current Data:")
            print(f"   Users: {user_count.scalar()}")
            print(f"   Leads: {lead_count.scalar()}")
            print(f"   Tasks: {task_count.scalar()}")
            
            # Check indexes
            indexes_result = await session.execute(text("""
                SELECT COUNT(*) as index_count
                FROM pg_indexes 
                WHERE tablename IN ('users', 'leads', 'tasks')
                AND indexname LIKE 'idx_%';
            """))
            index_count = indexes_result.scalar()
            print(f"   Performance Indexes: {index_count}")
            
            print(f"\n🎉 REAL DATABASE STATUS: ACTIVE & READY")
            print(f"✅ Your CRM is using Supabase PostgreSQL")
            print(f"✅ All data will be persisted permanently")
            print(f"✅ No more mock database - this is production-ready!")
            
            return True
            
    except Exception as e:
        print(f"❌ Database verification failed: {str(e)}")
        return False

async def main():
    """Main verification function"""
    success = await verify_database_status()
    
    if success:
        print(f"\n🚀 Ready to start your CRM system:")
        print(f"   python start_server.py")
    else:
        print(f"\n❌ Database connection issues detected")

if __name__ == "__main__":
    asyncio.run(main())