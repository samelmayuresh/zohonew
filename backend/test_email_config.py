#!/usr/bin/env python3
"""
Test email configuration
"""
import os
import smtplib
from dotenv import load_dotenv

# Force reload the .env file
load_dotenv(override=True)

def test_gmail_connection():
    """Test Gmail SMTP connection"""
    
    # Debug: Read .env file directly
    print("Reading .env file directly:")
    try:
        with open('.env', 'r') as f:
            for line in f:
                if 'EMAIL_PASS' in line:
                    print(f"  {line.strip()}")
    except Exception as e:
        print(f"  Error reading .env: {e}")
    print()
    
    host = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    port = int(os.getenv("EMAIL_PORT", "587"))
    username = os.getenv("EMAIL_USER", "")
    password = os.getenv("EMAIL_PASS", "").strip()
    
    print("Testing Gmail SMTP Configuration")
    print("=" * 40)
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"Username: {username}")
    print(f"Password length: {len(password)}")
    print(f"Password (first 4 chars): {password[:4]}****")
    print(f"Password (repr): {repr(password)}")
    print()
    
    if not username or not password:
        print("❌ ERROR: EMAIL_USER or EMAIL_PASS not configured")
        return False
    
    try:
        print("🔗 Connecting to Gmail SMTP...")
        server = smtplib.SMTP(host, port)
        
        print("🔒 Starting TLS...")
        server.starttls()
        
        print("🔑 Attempting login...")
        server.login(username, password)
        
        print("✅ SUCCESS: Gmail SMTP connection successful!")
        server.quit()
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ AUTHENTICATION ERROR: {e}")
        print("\n💡 Troubleshooting tips:")
        print("1. Make sure 2-Step Verification is enabled on your Google account")
        print("2. Generate a new App Password:")
        print("   - Go to Google Account → Security → App Passwords")
        print("   - Select 'Mail' and generate a new 16-character password")
        print("3. Update EMAIL_PASS in .env file with the new App Password")
        print("4. Make sure there are no extra spaces or characters")
        return False
        
    except Exception as e:
        print(f"❌ CONNECTION ERROR: {e}")
        print("\n💡 Check your internet connection and firewall settings")
        return False

if __name__ == "__main__":
    success = test_gmail_connection()
    
    if success:
        print("\n🎉 Email configuration is working!")
        print("You can now create users and they will receive credentials via email.")
    else:
        print("\n⚠️  Email configuration needs to be fixed.")
        print("Please follow the troubleshooting tips above.")