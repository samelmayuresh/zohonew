import os
import smtplib
import asyncio
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, List
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
from dotenv import load_dotenv
import json
import time

# Force reload environment variables
load_dotenv(override=True)

EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USER = os.getenv("EMAIL_USER", "your-actual-email@gmail.com")
EMAIL_PASS = os.getenv("EMAIL_PASS", "")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailStatus(Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    RETRY = "retry"

@dataclass
class EmailJob:
    id: str
    to_email: str
    subject: str
    body: str
    template_name: str
    template_data: Dict
    status: EmailStatus
    created_at: datetime
    sent_at: Optional[datetime] = None
    retry_count: int = 0
    max_retries: int = 3
    error_message: Optional[str] = None

class EmailService:
    def __init__(self):
        self.email_queue: List[EmailJob] = []
        self.templates = self._load_templates()
        
        # Load configuration at runtime
        self._load_config()
    
    def _load_config(self):
        """Load email configuration from environment variables"""
        # Force reload environment variables
        load_dotenv(override=True)
        
        self.host = os.getenv("EMAIL_HOST", "smtp.gmail.com")
        self.port = int(os.getenv("EMAIL_PORT", "587"))
        self.username = os.getenv("EMAIL_USER", "your-actual-email@gmail.com")
        self.password = os.getenv("EMAIL_PASS", "").strip()
        
        # Debug logging
        logger.info(f"Email service configuration loaded:")
        logger.info(f"  Host: {self.host}")
        logger.info(f"  Port: {self.port}")
        logger.info(f"  Username: {self.username}")
        logger.info(f"  Password length: {len(self.password)}")
        logger.info(f"  Password (first 4 chars): {self.password[:4]}****" if self.password else "  Password: NOT SET")
        
    def _load_templates(self) -> Dict[str, Dict]:
        """Load email templates"""
        return {
            "user_credentials": {
                "subject": "Welcome to CRM System - Your Account Credentials",
                "body": """
Dear {full_name},

Welcome to our CRM System! Your account has been created successfully.

Here are your login credentials:

Username: {username}
Password: {password}
Role: {role_display}

Login URL: {login_url}

Please keep these credentials secure and change your password after your first login.

If you have any questions, please contact your system administrator.

Best regards,
CRM System Team
                """
            },
            "task_assignment": {
                "subject": "New Task Assigned: {task_title}",
                "body": """
Dear {assignee_name},

You have been assigned a new task in the CRM System.

Task Details:
Title: {task_title}
Description: {task_description}
{due_date_text}
Priority: {priority}

Please log in to the CRM system to view more details and update the task status.

Login URL: {login_url}

Best regards,
CRM System Team
                """
            },
            "task_reminder": {
                "subject": "Task Reminder: {task_title}",
                "body": """
Dear {assignee_name},

This is a reminder about your upcoming task.

Task Details:
Title: {task_title}
Description: {task_description}
Due Date: {due_date}
Status: {status}

Please log in to the CRM system to update the task status.

Login URL: {login_url}

Best regards,
CRM System Team
                """
            },
            "task_overdue": {
                "subject": "Overdue Task: {task_title}",
                "body": """
Dear {assignee_name},

The following task is now overdue and requires immediate attention.

Task Details:
Title: {task_title}
Description: {task_description}
Due Date: {due_date}
Days Overdue: {days_overdue}

Please log in to the CRM system immediately to update the task status.

Login URL: {login_url}

Best regards,
CRM System Team
                """
            }
        }

    def queue_email(self, template_name: str, to_email: str, template_data: Dict) -> str:
        """Queue an email for sending"""
        template = self.templates.get(template_name)
        if not template:
            raise ValueError(f"Template '{template_name}' not found")
        
        # Generate unique ID
        email_id = f"{template_name}_{int(time.time())}_{len(self.email_queue)}"
        
        # Format template
        subject = template["subject"].format(**template_data)
        body = template["body"].format(**template_data)
        
        # Create email job
        job = EmailJob(
            id=email_id,
            to_email=to_email,
            subject=subject,
            body=body,
            template_name=template_name,
            template_data=template_data,
            status=EmailStatus.PENDING,
            created_at=datetime.now()
        )
        
        self.email_queue.append(job)
        logger.info(f"Email queued: {email_id} to {to_email}")
        return email_id

    def send_user_credentials(self, to_email: str, full_name: str, username: str, password: str, role: str) -> str:
        """Queue user credentials email"""
        template_data = {
            "full_name": full_name,
            "username": username,
            "password": password,
            "role_display": role.replace('_', ' ').title(),
            "login_url": "http://localhost:3000/login"
        }
        return self.queue_email("user_credentials", to_email, template_data)

    def send_task_assignment(self, to_email: str, assignee_name: str, task_title: str, task_description: str, due_date: Optional[str] = None, priority: str = "Medium") -> str:
        """Queue task assignment email"""
        due_date_text = f"Due Date: {due_date}" if due_date else "No due date specified"
        
        template_data = {
            "assignee_name": assignee_name,
            "task_title": task_title,
            "task_description": task_description,
            "due_date_text": due_date_text,
            "priority": priority,
            "login_url": "http://localhost:3000/login"
        }
        return self.queue_email("task_assignment", to_email, template_data)

    def send_task_reminder(self, to_email: str, assignee_name: str, task_title: str, task_description: str, due_date: str, status: str) -> str:
        """Queue task reminder email"""
        template_data = {
            "assignee_name": assignee_name,
            "task_title": task_title,
            "task_description": task_description,
            "due_date": due_date,
            "status": status,
            "login_url": "http://localhost:3000/login"
        }
        return self.queue_email("task_reminder", to_email, template_data)

    def send_task_overdue(self, to_email: str, assignee_name: str, task_title: str, task_description: str, due_date: str, days_overdue: int) -> str:
        """Queue task overdue email"""
        template_data = {
            "assignee_name": assignee_name,
            "task_title": task_title,
            "task_description": task_description,
            "due_date": due_date,
            "days_overdue": days_overdue,
            "login_url": "http://localhost:3000/login"
        }
        return self.queue_email("task_overdue", to_email, template_data)

    def _send_email(self, job: EmailJob) -> bool:
        """Send a single email"""
        try:
            # Reload config to get latest environment variables
            self._load_config()
            
            # Debug logging
            logger.info(f"Attempting to send email {job.id} using {self.username} to {self.host}:{self.port}")
            logger.info(f"Using password length: {len(self.password)} characters")
            
            if not self.password:
                raise Exception("EMAIL_PASS not configured")
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.username
            msg['To'] = job.to_email
            msg['Subject'] = job.subject

            msg.attach(MIMEText(job.body, 'plain'))

            # Send email
            server = smtplib.SMTP(self.host, self.port)
            server.starttls()
            server.login(self.username, self.password)
            text = msg.as_string()
            server.sendmail(self.username, job.to_email, text)
            server.quit()

            job.status = EmailStatus.SENT
            job.sent_at = datetime.now()
            logger.info(f"Email sent successfully: {job.id}")
            return True

        except Exception as e:
            job.error_message = str(e)
            job.retry_count += 1
            
            if job.retry_count >= job.max_retries:
                job.status = EmailStatus.FAILED
                logger.error(f"Email failed permanently: {job.id} - {str(e)}")
            else:
                job.status = EmailStatus.RETRY
                logger.warning(f"Email failed, will retry: {job.id} - {str(e)}")
            
            return False

    def process_email_queue(self) -> Dict[str, int]:
        """Process all pending emails in the queue"""
        stats = {"sent": 0, "failed": 0, "retried": 0}
        
        for job in self.email_queue:
            if job.status in [EmailStatus.PENDING, EmailStatus.RETRY]:
                if self._send_email(job):
                    stats["sent"] += 1
                else:
                    if job.status == EmailStatus.RETRY:
                        stats["retried"] += 1
                    else:
                        stats["failed"] += 1
        
        logger.info(f"Email queue processed: {stats}")
        return stats

    def get_email_status(self, email_id: str) -> Optional[EmailJob]:
        """Get status of a specific email"""
        for job in self.email_queue:
            if job.id == email_id:
                return job
        return None

    def get_queue_stats(self) -> Dict[str, int]:
        """Get email queue statistics"""
        stats = {
            "total": len(self.email_queue),
            "pending": 0,
            "sent": 0,
            "failed": 0,
            "retry": 0
        }
        
        for job in self.email_queue:
            stats[job.status.value] += 1
        
        return stats

    def clear_old_emails(self, days: int = 7) -> int:
        """Clear emails older than specified days"""
        cutoff_date = datetime.now() - timedelta(days=days)
        initial_count = len(self.email_queue)
        
        self.email_queue = [
            job for job in self.email_queue 
            if job.created_at > cutoff_date or job.status in [EmailStatus.PENDING, EmailStatus.RETRY]
        ]
        
        cleared_count = initial_count - len(self.email_queue)
        logger.info(f"Cleared {cleared_count} old emails from queue")
        return cleared_count
    
    def reload_config(self):
        """Reload email configuration from environment variables"""
        logger.info("Reloading email configuration...")
        self._load_config()

# Global email service instance
email_service = EmailService()