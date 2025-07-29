#!/usr/bin/env python3
"""
Test database connection with different approaches
"""
import os
import asyncio
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def test_direct_connection():
    """Test direct connection using asyncpg"""
    print("🔗 Testing direct asyncpg connection...")
    
    try:
        # Parse the connection details
        DATABASE_URL = os.getenv("DATABASE_URL")
        print(f"📍 Original URL: {DATABASE_URL}")
        
        # Extract connection details
        # postgresql://postgres:Minesh@2007@db.lxfoxkdnsibznmyszsvz.supabase.co:5432/postgres
        url_parts = DATABASE_URL.replace("postgresql://", "").split("@")
        
        if len(url_parts) >= 3:
            # Handle case where password contains @
            user_pass = url_parts[0]
            host_port_db = "@".join(url_parts[1:])
            
            user, password = user_pass.split(":", 1)
            host_port, database = host_port_db.rsplit("/", 1)
            host, port = host_port.rsplit(":", 1)
            
            print(f"👤 User: {user}")
            print(f"🔑 Password: {password[:4]}****")
            print(f"🌐 Host: {host}")
            print(f"🔌 Port: {port}")
            print(f"💾 Database: {database}")
            
            # Test connection
            conn = await asyncpg.connect(
                user=user,
                password=password,
                database=database,
                host=host,
                port=int(port)
            )
            
            # Test query
            version = await conn.fetchval("SELECT version()")
            print(f"✅ Connected! PostgreSQL version: {version[:50]}...")
            
            # Test basic operations
            await conn.execute("SELECT 1")
            print("✅ Basic query test passed")
            
            await conn.close()
            return True
            
    except Exception as e:
        print(f"❌ Direct connection failed: {str(e)}")
        return False

async def test_sqlalchemy_connection():
    """Test SQLAlchemy async connection"""
    print("\n🔗 Testing SQLAlchemy async connection...")
    
    try:
        from sqlalchemy.ext.asyncio import create_async_engine
        from sqlalchemy import text
        
        DATABASE_URL = os.getenv("DATABASE_URL")
        if DATABASE_URL.startswith("postgresql://"):
            DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        
        print(f"📍 SQLAlchemy URL: {DATABASE_URL.split('@')[0]}@***")
        
        engine = create_async_engine(
            DATABASE_URL,
            echo=False,
            pool_pre_ping=True,
            connect_args={
                "server_settings": {
                    "application_name": "CRM_Test",
                }
            }
        )
        
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ SQLAlchemy connected! Version: {version[:50]}...")
        
        await engine.dispose()
        return True
        
    except Exception as e:
        print(f"❌ SQLAlchemy connection failed: {str(e)}")
        return False

async def test_network_connectivity():
    """Test basic network connectivity to Supabase"""
    print("\n🌐 Testing network connectivity...")
    
    try:
        import socket
        
        host = "db.lxfoxkdnsibznmyszsvz.supabase.co"
        port = 5432
        
        print(f"🔍 Testing connection to {host}:{port}")
        
        # Test DNS resolution
        try:
            ip = socket.gethostbyname(host)
            print(f"✅ DNS resolved: {host} -> {ip}")
        except Exception as e:
            print(f"❌ DNS resolution failed: {e}")
            return False
        
        # Test port connectivity
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            print(f"✅ Port {port} is accessible")
            return True
        else:
            print(f"❌ Port {port} is not accessible (error code: {result})")
            return False
            
    except Exception as e:
        print(f"❌ Network test failed: {str(e)}")
        return False

async def main():
    """Main test function"""
    print("🧪 CRM Database Connection Test")
    print("=" * 50)
    
    # Test network connectivity first
    network_ok = await test_network_connectivity()
    
    if not network_ok:
        print("\n❌ Network connectivity failed. Please check:")
        print("   1. Internet connection")
        print("   2. Firewall settings")
        print("   3. Supabase service status")
        return
    
    # Test direct connection
    direct_ok = await test_direct_connection()
    
    # Test SQLAlchemy connection
    sqlalchemy_ok = await test_sqlalchemy_connection()
    
    print("\n" + "=" * 50)
    print("📊 Connection Test Results:")
    print(f"🌐 Network: {'✅ OK' if network_ok else '❌ Failed'}")
    print(f"🔗 Direct: {'✅ OK' if direct_ok else '❌ Failed'}")
    print(f"🏗️  SQLAlchemy: {'✅ OK' if sqlalchemy_ok else '❌ Failed'}")
    
    if direct_ok and sqlalchemy_ok:
        print("\n🎉 All tests passed! Database connection is working.")
        print("You can now run: python setup_real_database.py")
    else:
        print("\n❌ Some tests failed. Please check the error messages above.")

if __name__ == "__main__":
    asyncio.run(main())