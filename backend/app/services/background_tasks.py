import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict
from app.services.email_service import email_service
from app.utils.mock_database import get_mock_db

logger = logging.getLogger(__name__)

class BackgroundTaskManager:
    def __init__(self):
        self.running = False
        self.tasks = []

    async def start(self):
        """Start background tasks"""
        if self.running:
            return
        
        self.running = True
        logger.info("Starting background tasks...")
        
        # Start email queue processor
        email_task = asyncio.create_task(self._process_email_queue())
        self.tasks.append(email_task)
        
        # Start task reminder checker
        reminder_task = asyncio.create_task(self._check_task_reminders())
        self.tasks.append(reminder_task)
        
        logger.info("Background tasks started")

    async def stop(self):
        """Stop background tasks"""
        if not self.running:
            return
        
        self.running = False
        logger.info("Stopping background tasks...")
        
        for task in self.tasks:
            task.cancel()
        
        await asyncio.gather(*self.tasks, return_exceptions=True)
        self.tasks.clear()
        
        logger.info("Background tasks stopped")

    async def _process_email_queue(self):
        """Process email queue every 30 seconds"""
        while self.running:
            try:
                stats = email_service.process_email_queue()
                if stats["sent"] > 0 or stats["failed"] > 0:
                    logger.info(f"Email queue processed: {stats}")
                
                # Clean up old emails weekly
                if datetime.now().hour == 2 and datetime.now().minute < 1:  # 2 AM daily
                    email_service.clear_old_emails(days=7)
                
            except Exception as e:
                logger.error(f"Error processing email queue: {e}")
            
            await asyncio.sleep(30)  # Process every 30 seconds

    async def _check_task_reminders(self):
        """Check for task reminders every hour"""
        while self.running:
            try:
                await self._send_task_reminders()
            except Exception as e:
                logger.error(f"Error checking task reminders: {e}")
            
            await asyncio.sleep(3600)  # Check every hour

    async def _send_task_reminders(self):
        """Send reminders for upcoming and overdue tasks"""
        try:
            mock_db = await get_mock_db()
            tasks = await mock_db.get_all_tasks()
            users = await mock_db.get_all_users()
            
            # Create user lookup
            user_lookup = {user["id"]: user for user in users}
            
            now = datetime.now()
            tomorrow = now + timedelta(days=1)
            
            for task in tasks:
                if task["status"] in ["completed", "cancelled"]:
                    continue
                
                assignee = user_lookup.get(task["assigned_to"])
                if not assignee:
                    continue
                
                due_date_str = task.get("due_date")
                if not due_date_str:
                    continue
                
                try:
                    due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
                    due_date = due_date.replace(tzinfo=None)  # Remove timezone for comparison
                except:
                    continue
                
                # Send reminder for tasks due tomorrow
                if due_date.date() == tomorrow.date() and task["status"] == "pending":
                    try:
                        email_id = email_service.send_task_reminder(
                            to_email=assignee["email"],
                            assignee_name=assignee["full_name"],
                            task_title=task["title"],
                            task_description=task.get("description", ""),
                            due_date=due_date.strftime("%Y-%m-%d"),
                            status=task["status"]
                        )
                        logger.info(f"Task reminder queued: {email_id}")
                    except Exception as e:
                        logger.error(f"Failed to queue task reminder: {e}")
                
                # Send overdue notification for tasks past due date
                elif due_date < now and task["status"] != "completed":
                    days_overdue = (now - due_date).days
                    
                    # Only send overdue notification once per day
                    if days_overdue > 0 and now.hour == 9:  # 9 AM
                        try:
                            email_id = email_service.send_task_overdue(
                                to_email=assignee["email"],
                                assignee_name=assignee["full_name"],
                                task_title=task["title"],
                                task_description=task.get("description", ""),
                                due_date=due_date.strftime("%Y-%m-%d"),
                                days_overdue=days_overdue
                            )
                            logger.info(f"Task overdue notification queued: {email_id}")
                        except Exception as e:
                            logger.error(f"Failed to queue overdue notification: {e}")
                            
        except Exception as e:
            logger.error(f"Error in task reminder check: {e}")

# Global background task manager
background_manager = BackgroundTaskManager()