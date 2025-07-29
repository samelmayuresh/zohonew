#!/usr/bin/env python3
"""
Complete database setup script for CRM system with Supabase PostgreSQL
This script will:
1. Test database connection
2. Drop existing tables if they exist
3. Create fresh tables with proper structure
4. Set up indexes for performance
5. Create default admin user
6. Verify the setup
"""
import os
import sys
import asyncio
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

async def test_database_connection():
    """Test the database connection"""
    print("🔗 Testing database connection...")
    
    try:
        DATABASE_URL = os.getenv("DATABASE_URL")
        if not DATABASE_URL:
            raise Exception("DATABASE_URL not found in environment variables")
        
        # Convert to async URL and handle SSL
        if DATABASE_URL.startswith("postgresql://"):
            DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        
        # Extract SSL mode if present
        ssl_mode = None
        if "?sslmode=" in DATABASE_URL:
            DATABASE_URL, ssl_params = DATABASE_URL.split("?", 1)
            if "sslmode=" in ssl_params:
                ssl_mode = ssl_params.split("sslmode=")[1].split("&")[0]
        
        print(f"📍 Database URL: {DATABASE_URL.split('@')[0]}@***")
        if ssl_mode:
            print(f"🔒 SSL Mode: {ssl_mode}")
        
        # Create engine with SSL configuration
        connect_args = {
            "server_settings": {
                "application_name": "CRM_Setup",
            }
        }
        
        if ssl_mode:
            connect_args["ssl"] = ssl_mode
        
        engine = create_async_engine(
            DATABASE_URL, 
            echo=False,
            connect_args=connect_args
        )
        
        # Test connection
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL: {version[:50]}...")
        
        await engine.dispose()
        return True, engine
        
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        return False, None

async def drop_existing_tables(engine):
    """Drop existing tables if they exist"""
    print("🗑️  Dropping existing tables...")
    
    try:
        async with engine.begin() as conn:
            # Drop tables in correct order (considering foreign keys)
            drop_queries = [
                "DROP TABLE IF EXISTS tasks CASCADE;",
                "DROP TABLE IF EXISTS leads CASCADE;", 
                "DROP TABLE IF EXISTS users CASCADE;",
                # Drop any other related tables or sequences
                "DROP SEQUENCE IF EXISTS users_id_seq CASCADE;",
                "DROP SEQUENCE IF EXISTS leads_id_seq CASCADE;",
                "DROP SEQUENCE IF EXISTS tasks_id_seq CASCADE;"
            ]
            
            for query in drop_queries:
                await conn.execute(text(query))
                print(f"   ✅ {query}")
        
        print("✅ All existing tables dropped successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error dropping tables: {str(e)}")
        return False

async def create_fresh_tables(engine):
    """Create fresh tables with proper structure"""
    print("🏗️  Creating fresh database tables...")
    
    try:
        # Import models to register them with Base
        from app.models.user import User
        from app.models.lead import Lead
        from app.models.task import Task
        from app.utils.database import Base
        
        # Create all tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        print("✅ Database tables created successfully:")
        print("   📋 users - User management with role-based access")
        print("   📊 leads - Lead tracking and assignment")
        print("   ✅ tasks - Task assignment and tracking")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {str(e)}")
        return False

async def create_database_indexes(engine):
    """Create performance indexes"""
    print("⚡ Creating performance indexes...")
    
    try:
        async with engine.begin() as conn:
            # User indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);"))
            
            # Lead indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_leads_created_by ON leads(created_by);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company);"))
            
            # Task indexes
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON tasks(assigned_by);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);"))
            
        print("✅ Performance indexes created successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error creating indexes: {str(e)}")
        return False

async def create_default_admin(engine):
    """Create default super admin user"""
    print("👤 Creating default admin user...")
    
    try:
        from app.models.user import User
        from app.services.auth_service import get_password_hash
        
        # Create session
        AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with AsyncSessionLocal() as session:
            # Check if super admin already exists
            result = await session.execute(
                text("SELECT id FROM users WHERE role = 'super_admin' LIMIT 1")
            )
            if result.fetchone():
                print("   ⚠️  Super admin already exists, skipping creation")
                return True
            
            # Create default super admin
            admin_user = User(
                username="superadmin",
                email="admin@crm.com",
                password_hash=get_password_hash("admin123"),
                full_name="Super Admin",
                role="super_admin",
                is_active=True
            )
            
            session.add(admin_user)
            await session.commit()
            
            print("✅ Default super admin created:")
            print("   👤 Username: superadmin")
            print("   🔑 Password: admin123")
            print("   📧 Email: admin@crm.com")
            print("   🎭 Role: super_admin")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin user: {str(e)}")
        return False

async def verify_database_setup(engine):
    """Verify the database setup is working correctly"""
    print("🔍 Verifying database setup...")
    
    try:
        AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with AsyncSessionLocal() as session:
            # Check tables exist
            tables_check = await session.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('users', 'leads', 'tasks')
                ORDER BY table_name;
            """))
            tables = [row[0] for row in tables_check.fetchall()]
            
            print(f"   📋 Tables found: {', '.join(tables)}")
            
            if len(tables) != 3:
                raise Exception(f"Expected 3 tables, found {len(tables)}")
            
            # Check admin user
            admin_check = await session.execute(text("""
                SELECT username, email, role, is_active 
                FROM users 
                WHERE role = 'super_admin' 
                LIMIT 1;
            """))
            admin = admin_check.fetchone()
            
            if admin:
                print(f"   👤 Admin user: {admin[0]} ({admin[1]}) - Active: {admin[3]}")
            else:
                raise Exception("Admin user not found")
            
            # Check indexes
            indexes_check = await session.execute(text("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename IN ('users', 'leads', 'tasks')
                AND indexname LIKE 'idx_%'
                ORDER BY indexname;
            """))
            indexes = [row[0] for row in indexes_check.fetchall()]
            print(f"   ⚡ Performance indexes: {len(indexes)} created")
        
        print("✅ Database setup verification completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Database verification failed: {str(e)}")
        return False

async def main():
    """Main setup function"""
    print("🚀 CRM Database Setup - Supabase PostgreSQL")
    print("=" * 60)
    print()
    
    # Test connection
    connected, engine = await test_database_connection()
    if not connected:
        print("❌ Cannot proceed without database connection")
        return False
    
    print()
    
    try:
        # Drop existing tables
        if not await drop_existing_tables(engine):
            return False
        print()
        
        # Create fresh tables
        if not await create_fresh_tables(engine):
            return False
        print()
        
        # Create indexes
        if not await create_database_indexes(engine):
            return False
        print()
        
        # Create admin user
        if not await create_default_admin(engine):
            return False
        print()
        
        # Verify setup
        if not await verify_database_setup(engine):
            return False
        print()
        
        print("🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print("Your CRM system is now ready with:")
        print("✅ Fresh database tables with proper structure")
        print("✅ Performance indexes for fast queries")
        print("✅ Default admin user (superadmin / admin123)")
        print("✅ Full role-based access control")
        print("✅ Lead management system")
        print("✅ Task assignment system")
        print("✅ Email notification system")
        print()
        print("🚀 Start your CRM system with:")
        print("   cd zohonew\\backend")
        print("   python start_server.py")
        print()
        print("🌐 Access your CRM at:")
        print("   Backend API: http://localhost:8000")
        print("   API Docs: http://localhost:8000/docs")
        print("   Frontend: http://localhost:3000 (after starting)")
        
        return True
        
    except Exception as e:
        print(f"❌ Setup failed: {str(e)}")
        return False
        
    finally:
        if engine:
            await engine.dispose()

if __name__ == "__main__":
    success = asyncio.run(main())
    if not success:
        sys.exit(1)