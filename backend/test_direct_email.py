#!/usr/bin/env python3
"""
Test email directly with hardcoded values
"""
import smtplib

def test_direct_gmail():
    """Test Gmail SMTP with direct values"""
    
    host = "smtp.gmail.com"
    port = 587
    username = "samelmayuresh40@gmail.com"
    password = "vlvfbbzcywjotfkl"  # New App Password
    
    print("Testing Gmail SMTP with new App Password")
    print("=" * 45)
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"Username: {username}")
    print(f"Password length: {len(password)}")
    print(f"Password (first 4 chars): {password[:4]}****")
    print()
    
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
        return False
        
    except Exception as e:
        print(f"❌ CONNECTION ERROR: {e}")
        return False

if __name__ == "__main__":
    success = test_direct_gmail()
    
    if success:
        print("\n🎉 New App Password is working!")
    else:
        print("\n⚠️  App Password still not working.")