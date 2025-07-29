#!/usr/bin/env python3
"""
Test email sending functionality
"""
import os
import sys
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.email_service import email_service

def test_email_configuration():
    """Test basic email configuration"""
    print("🧪 Testing Email Configuration")
    print("=" * 50)
    
    # Reload config to get latest environment variables
    email_service.reload_config()
    
    print(f"📧 Email Host: {email_service.host}")
    print(f"🔌 Email Port: {email_service.port}")
    print(f"👤 Email User: {email_service.username}")
    print(f"🔑 Password Length: {len(email_service.password)} characters")
    print(f"🔑 Password Preview: {email_service.password[:4]}****" if email_service.password else "🔑 Password: NOT SET")
    print()
    
    if not email_service.password:
        print("❌ EMAIL_PASS not configured!")
        return False
    
    if email_service.username == "your-actual-email@gmail.com":
        print("❌ EMAIL_USER still has placeholder value!")
        return False
    
    print("✅ Email configuration looks good!")
    return True

def test_send_sample_email():
    """Test sending a sample email"""
    print("📤 Testing Email Sending")
    print("=" * 50)
    
    try:
        # Queue a test email
        email_id = email_service.send_user_credentials(
            to_email="samelmayuresh40@gmail.com",  # Send to same email for testing
            full_name="Test User",
            username="testuser",
            password="testpass123",
            role="sales_executive"
        )
        
        print(f"📋 Email queued with ID: {email_id}")
        
        # Process the email queue
        print("🔄 Processing email queue...")
        stats = email_service.process_email_queue()
        
        print(f"📊 Email Stats: {stats}")
        
        # Check email status
        job = email_service.get_email_status(email_id)
        if job:
            print(f"📧 Email Status: {job.status.value}")
            if job.error_message:
                print(f"❌ Error: {job.error_message}")
            if job.sent_at:
                print(f"✅ Sent at: {job.sent_at}")
        
        return job and job.status.value == "sent"
        
    except Exception as e:
        print(f"❌ Email test failed: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 CRM Email Service Test")
    print("=" * 50)
    print()
    
    # Test configuration
    config_ok = test_email_configuration()
    print()
    
    if not config_ok:
        print("❌ Email configuration failed. Please check your .env file.")
        return
    
    # Test sending email
    send_ok = test_send_sample_email()
    print()
    
    if send_ok:
        print("🎉 Email test PASSED! Email functionality is working.")
    else:
        print("❌ Email test FAILED. Check the error messages above.")
        print()
        print("💡 Common solutions:")
        print("   1. Verify the Gmail address is correct")
        print("   2. Ensure 2-Step Verification is enabled on Gmail")
        print("   3. Generate a new App Password for Mail")
        print("   4. Check if 'Less secure app access' is disabled (should be)")
        print("   5. Try logging into Gmail from a browser first")

if __name__ == "__main__":
    main()