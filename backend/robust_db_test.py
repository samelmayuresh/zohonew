#!/usr/bin/env python3
"""
Robust database connection test with multiple approaches
"""
import os
import asyncio
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def test_connection_with_retry():
    """Test connection with retry logic and different approaches"""
    print("🔄 Testing database connection with retry logic...")
    
    # Connection parameters
    user = "postgres"
    password = "Minesh@2007"
    database = "postgres"
    port = 5432
    
    # Try different host formats
    hosts_to_try = [
        "db.lxfoxkdnsibznmyszsvz.supabase.co",
        "lxfoxkdnsibznmyszsvz.supabase.co",
    ]
    
    for host in hosts_to_try:
        print(f"\n🔗 Trying host: {host}")
        
        for attempt in range(3):
            try:
                print(f"   Attempt {attempt + 1}/3...")
                
                # Try with different connection parameters
                conn = await asyncpg.connect(
                    user=user,
                    password=password,
                    database=database,
                    host=host,
                    port=port,
                    timeout=30,
                    server_settings={
                        'application_name': 'CRM_Setup'
                    }
                )
                
                # Test the connection
                version = await conn.fetchval("SELECT version()")
                print(f"   ✅ Connected successfully!")
                print(f"   📊 PostgreSQL: {version[:60]}...")
                
                # Test basic operations
                await conn.execute("SELECT 1")
                print(f"   ✅ Basic query test passed")
                
                # Test table creation permissions
                try:
                    await conn.execute("CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY)")
                    await conn.execute("DROP TABLE IF EXISTS test_connection")
                    print(f"   ✅ Table creation permissions verified")
                except Exception as e:
                    print(f"   ⚠️  Limited permissions: {e}")
                
                await conn.close()
                return True, host
                
            except asyncio.TimeoutError:
                print(f"   ❌ Timeout on attempt {attempt + 1}")
            except Exception as e:
                print(f"   ❌ Failed attempt {attempt + 1}: {str(e)}")
            
            if attempt < 2:
                print(f"   ⏳ Waiting 2 seconds before retry...")
                await asyncio.sleep(2)
    
    return False, None

async def test_with_ssl_options():
    """Test connection with different SSL options"""
    print("\n🔒 Testing with SSL options...")
    
    user = "postgres"
    password = "Minesh@2007"
    database = "postgres"
    host = "db.lxfoxkdnsibznmyszsvz.supabase.co"
    port = 5432
    
    ssl_options = [
        "require",
        "prefer", 
        "disable"
    ]
    
    for ssl_mode in ssl_options:
        try:
            print(f"   🔐 Trying SSL mode: {ssl_mode}")
            
            conn = await asyncpg.connect(
                user=user,
                password=password,
                database=database,
                host=host,
                port=port,
                ssl=ssl_mode,
                timeout=15
            )
            
            version = await conn.fetchval("SELECT version()")
            print(f"   ✅ SSL {ssl_mode} worked!")
            await conn.close()
            return True, ssl_mode
            
        except Exception as e:
            print(f"   ❌ SSL {ssl_mode} failed: {str(e)}")
    
    return False, None

async def create_working_database_url(host, ssl_mode=None):
    """Create a working database URL"""
    user = "postgres"
    password = "Minesh%402007"  # URL encoded
    database = "postgres"
    port = 5432
    
    base_url = f"postgresql://{user}:{password}@{host}:{port}/{database}"
    
    if ssl_mode:
        base_url += f"?sslmode={ssl_mode}"
    
    return base_url

async def main():
    """Main test function"""
    print("🚀 Robust Database Connection Test")
    print("=" * 50)
    
    # Test basic connection with retry
    success, working_host = await test_connection_with_retry()
    
    if success:
        print(f"\n🎉 Connection successful with host: {working_host}")
        
        # Test SSL options
        ssl_success, ssl_mode = await test_with_ssl_options()
        
        # Generate working URL
        working_url = await create_working_database_url(working_host, ssl_mode if ssl_success else None)
        
        print(f"\n✅ Working Database Configuration:")
        print(f"DATABASE_URL={working_url}")
        
        # Update .env file
        try:
            with open('.env', 'r') as f:
                content = f.read()
            
            # Replace the DATABASE_URL line
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('DATABASE_URL='):
                    lines[i] = f"DATABASE_URL={working_url}"
                    break
            
            with open('.env', 'w') as f:
                f.write('\n'.join(lines))
            
            print("✅ .env file updated with working configuration")
            
        except Exception as e:
            print(f"⚠️  Could not update .env file: {e}")
            print("Please manually update your .env file with the URL above")
        
        print("\n🚀 Ready to run database setup!")
        print("Run: python setup_real_database.py")
        
    else:
        print("\n❌ All connection attempts failed")
        print("Please check:")
        print("1. Supabase project is active")
        print("2. Database credentials are correct")
        print("3. Network connectivity")
        print("4. Firewall settings")

if __name__ == "__main__":
    asyncio.run(main())