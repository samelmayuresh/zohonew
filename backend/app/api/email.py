from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List, Optional
from app.services.email_service import email_service, EmailJob, EmailStatus
from app.services.auth_service import verify_token
from pydantic import BaseModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

class EmailRequest(BaseModel):
    template_name: str
    to_email: str
    template_data: Dict

class EmailResponse(BaseModel):
    email_id: str
    status: str
    message: str

class EmailStatusResponse(BaseModel):
    id: str
    to_email: str
    subject: str
    template_name: str
    status: str
    created_at: str
    sent_at: Optional[str]
    retry_count: int
    error_message: Optional[str]

@router.post("/send", response_model=EmailResponse)
async def send_email(
    email_request: EmailRequest,
    current_user: dict = Depends(get_current_user)
):
    """Queue an email for sending"""
    try:
        # Only admins and super admins can send arbitrary emails
        if current_user["role"] not in ["super_admin", "admin"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        email_id = email_service.queue_email(
            email_request.template_name,
            email_request.to_email,
            email_request.template_data
        )
        
        return EmailResponse(
            email_id=email_id,
            status="queued",
            message="Email queued successfully"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to queue email: {str(e)}")

@router.post("/process-queue")
async def process_email_queue(current_user: dict = Depends(get_current_user)):
    """Process all pending emails in the queue"""
    # Only super admins can process the email queue
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        stats = email_service.process_email_queue()
        return {
            "message": "Email queue processed",
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process email queue: {str(e)}")

@router.get("/status/{email_id}", response_model=EmailStatusResponse)
async def get_email_status(
    email_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get status of a specific email"""
    job = email_service.get_email_status(email_id)
    if not job:
        raise HTTPException(status_code=404, detail="Email not found")
    
    return EmailStatusResponse(
        id=job.id,
        to_email=job.to_email,
        subject=job.subject,
        template_name=job.template_name,
        status=job.status.value,
        created_at=job.created_at.isoformat(),
        sent_at=job.sent_at.isoformat() if job.sent_at else None,
        retry_count=job.retry_count,
        error_message=job.error_message
    )

@router.get("/queue/stats")
async def get_queue_stats(current_user: dict = Depends(get_current_user)):
    """Get email queue statistics"""
    # Only admins and super admins can view queue stats
    if current_user["role"] not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    stats = email_service.get_queue_stats()
    return {"queue_stats": stats}

@router.delete("/queue/clear")
async def clear_old_emails(
    days: int = 7,
    current_user: dict = Depends(get_current_user)
):
    """Clear old emails from the queue"""
    # Only super admins can clear the queue
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        cleared_count = email_service.clear_old_emails(days)
        return {
            "message": f"Cleared {cleared_count} old emails",
            "cleared_count": cleared_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear emails: {str(e)}")

@router.get("/templates")
async def get_email_templates(current_user: dict = Depends(get_current_user)):
    """Get available email templates"""
    # Only admins and super admins can view templates
    if current_user["role"] not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    templates = list(email_service.templates.keys())
    return {"templates": templates}

@router.get("/config/status")
async def get_email_config_status(current_user: dict = Depends(get_current_user)):
    """Get email configuration status"""
    # Only super admins can view email config
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    import os
    
    config_status = {
        "host": email_service.host,
        "port": email_service.port,
        "username": email_service.username,
        "password_configured": bool(email_service.password and email_service.password != ""),
        "password_looks_like_app_password": bool(
            email_service.password and 
            len(email_service.password) == 16 and 
            email_service.password.replace(' ', '').isalnum()
        ),
        "queue_stats": email_service.get_queue_stats(),
        "instructions": {
            "gmail_app_password": "For Gmail, you need to generate an App Password:",
            "steps": [
                "1. Go to your Google Account settings",
                "2. Select Security",
                "3. Under 'Signing in to Google', select 2-Step Verification",
                "4. At the bottom, select App passwords",
                "5. Generate a new app password for 'Mail'",
                "6. Update EMAIL_PASS in your .env file with the 16-character app password"
            ]
        }
    }
    
    return config_status

@router.post("/test")
async def test_email_configuration(current_user: dict = Depends(get_current_user)):
    """Test email configuration by sending a test email"""
    # Only super admins can test email config
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        # Send a test email to the admin
        email_id = email_service.queue_email(
            "user_credentials",  # Use existing template for test
            email_service.username,  # Send to self
            {
                "full_name": "Test User",
                "username": "testuser",
                "password": "testpass123",
                "role_display": "Test Role",
                "login_url": "http://localhost:3000/login"
            }
        )
        
        # Try to process the email immediately
        stats = email_service.process_email_queue()
        
        # Get the job status
        job = email_service.get_email_status(email_id)
        
        return {
            "message": "Test email queued and processed",
            "email_id": email_id,
            "status": job.status.value if job else "unknown",
            "error": job.error_message if job and job.error_message else None,
            "stats": stats
        }
        
    except Exception as e:
        return {
            "message": "Test email failed",
            "error": str(e),
            "suggestion": "Check your email configuration in .env file"
        }