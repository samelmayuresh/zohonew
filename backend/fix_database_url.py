#!/usr/bin/env python3
"""
Fix database URL encoding issues
"""
import urllib.parse

def fix_database_url():
    """Fix the database URL with proper encoding"""
    
    # Original credentials
    user = "postgres"
    password = "Minesh@2007"  # Contains @ symbol
    host = "db.lxfoxkdnsibznmyszsvz.supabase.co"
    port = "5432"
    database = "postgres"
    
    # URL encode the password
    encoded_password = urllib.parse.quote(password, safe='')
    
    # Construct the proper URL
    database_url = f"postgresql://{user}:{encoded_password}@{host}:{port}/{database}"
    
    print("🔧 Database URL Fix")
    print("=" * 50)
    print(f"Original password: {password}")
    print(f"Encoded password: {encoded_password}")
    print(f"Fixed URL: {database_url}")
    print()
    print("✅ Use this URL in your .env file:")
    print(f"DATABASE_URL={database_url}")
    
    return database_url

if __name__ == "__main__":
    fix_database_url()