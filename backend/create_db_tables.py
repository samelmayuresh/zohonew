"""
Direct database table creation script
This will connect to Supabase and create all required tables
"""
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Minesh@2007@db.lxfoxkdnsibznmyszsvz.supabase.co:5432/postgres")

async def create_tables():
    """Create all database tables"""
    print("🔗 Connecting to Supabase database...")
    
    try:
        # Connect to database
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Connected to database successfully!")
        
        # Create users table
        print("📝 Creating users table...")
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username VARCHAR(100) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'sales_manager', 'sales_executive', 'support_agent', 'customer')),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_by UUID REFERENCES users(id)
            );
        ''')
        
        # Create indexes
        await conn.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);')
        await conn.execute('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);')
        print("✅ Users table created!")
        
        # Create leads table
        print("📝 Creating leads table...")
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS leads (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(50),
                company VARCHAR(255),
                source VARCHAR(100),
                status VARCHAR(50) DEFAULT 'new',
                assigned_to UUID REFERENCES users(id),
                created_by UUID REFERENCES users(id) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        print("✅ Leads table created!")
        
        # Create tasks table
        print("📝 Creating tasks table...")
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                assigned_to UUID REFERENCES users(id) NOT NULL,
                assigned_by UUID REFERENCES users(id) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                priority VARCHAR(20) DEFAULT 'medium',
                due_date TIMESTAMP WITH TIME ZONE,
                completed_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        print("✅ Tasks table created!")
        
        # Create user sessions table
        print("📝 Creating user_sessions table...")
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) NOT NULL,
                token_hash VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        print("✅ User sessions table created!")
        
        # Create default super admin user
        print("👤 Creating default super admin...")
        await conn.execute('''
            INSERT INTO users (username, email, password_hash, full_name, role, is_active)
            VALUES ('superadmin', 'admin@crm.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'Super Admin', 'super_admin', true)
            ON CONFLICT (email) DO NOTHING;
        ''')
        print("✅ Default super admin created!")
        
        # Verify tables were created
        print("\n📊 Verifying database setup...")
        tables = await conn.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'leads', 'tasks', 'user_sessions')
            ORDER BY table_name;
        """)
        
        print("📋 Created tables:")
        for table in tables:
            print(f"   ✓ {table['table_name']}")
        
        # Check if admin user exists
        admin_check = await conn.fetchrow("SELECT username, email, role FROM users WHERE role = 'super_admin' LIMIT 1")
        if admin_check:
            print(f"\n👤 Super Admin Account:")
            print(f"   Username: {admin_check['username']}")
            print(f"   Email: {admin_check['email']}")
            print(f"   Password: admin123")
            print(f"   Role: {admin_check['role']}")
        
        await conn.close()
        print("\n🎉 Database setup completed successfully!")
        print("🚀 You can now start the API server!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Check your internet connection")
        print("2. Verify the DATABASE_URL in .env file")
        print("3. Ensure your Supabase project is active")
        print("4. Check if the database credentials are correct")

if __name__ == "__main__":
    asyncio.run(create_tables())