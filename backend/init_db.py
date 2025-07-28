import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def create_database_schema():
    """Create the database schema with all required tables"""
    
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    # Connect to database
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        # Create users table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
        
        # Create index on email
        await conn.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);')
        
        # Create leads table
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
        
        # Create tasks table
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
        
        # Create user sessions table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) NOT NULL,
                token_hash VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        
        # Create default super admin user (password: admin123)
        await conn.execute('''
            INSERT INTO users (email, password_hash, full_name, role, is_active)
            VALUES ('admin@crm.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflLxQjm', 'Super Admin', 'super_admin', true)
            ON CONFLICT (email) DO NOTHING;
        ''')
        
        print("Database schema created successfully!")
        print("Default Super Admin created:")
        print("Email: admin@crm.com")
        print("Password: admin123")
        
    except Exception as e:
        print(f"Error creating database schema: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(create_database_schema())