import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Minesh@2007@db.lxfoxkdnsibznmyszsvz.supabase.co:5432/postgres")

# Handle SSL mode and convert to async URL
ssl_mode = None
if DATABASE_URL and "?sslmode=" in DATABASE_URL:
    DATABASE_URL, ssl_params = DATABASE_URL.split("?", 1)
    if "sslmode=" in ssl_params:
        ssl_mode = ssl_params.split("sslmode=")[1].split("&")[0]

if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Prepare connection arguments
connect_args = {
    "server_settings": {
        "application_name": "CRM_API",
    },
    "command_timeout": 60,
}

# Add SSL configuration if present
if ssl_mode:
    connect_args["ssl"] = ssl_mode

# Create engine with optimized connection pooling
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # Set to False to reduce noise
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=20,  # Number of connections to maintain in pool
    max_overflow=30,  # Additional connections beyond pool_size
    pool_timeout=30,  # Timeout for getting connection from pool
    connect_args=connect_args
)

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def create_tables():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        return True
    except Exception as e:
        print(f"Could not create tables: {e}")
        return False
        
async def create_default_admin():
    """Create default super admin user if not exists"""
    try:
        from app.models.user import User
        from app.services.auth_service import get_password_hash
        
        async with AsyncSessionLocal() as session:
            # Check if super admin exists
            result = await session.execute(
                text("SELECT id FROM users WHERE role = 'super_admin' LIMIT 1")
            )
            if result.fetchone():
                print("Super admin already exists")
                return
                
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
            print("Default super admin created: superadmin / admin123")
    except Exception as e:
        print(f"Could not create default admin: {e}")
        raise