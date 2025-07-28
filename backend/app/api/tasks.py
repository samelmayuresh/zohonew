from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.utils.database import get_db
from app.utils.mock_database import get_mock_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.email_service import email_service
from typing import List

router = APIRouter()

@router.post("/", response_model=TaskResponse)
async def create_task(task_data: TaskCreate, request: Request, db: AsyncSession = Depends(get_db)):
    """Create a new task and send notification email"""
    use_real_db = getattr(request.app.state, 'use_real_db', False)
    
    if use_real_db:
        # Real database logic
        new_task = Task(
            title=task_data.title,
            description=task_data.description,
            assigned_to=task_data.assigned_to,
            assigned_by=task_data.assigned_by,
            status=task_data.status or "pending",
            priority=task_data.priority or "medium",
            due_date=task_data.due_date
        )
        
        db.add(new_task)
        await db.commit()
        await db.refresh(new_task)
        
        # Get assignee details for email
        assignee_result = await db.execute(select(User).where(User.id == task_data.assigned_to))
        assignee = assignee_result.scalar_one_or_none()
        
        task_response = TaskResponse(
            id=str(new_task.id),
            title=new_task.title,
            description=new_task.description,
            assigned_to=str(new_task.assigned_to),
            assigned_by=str(new_task.assigned_by),
            status=new_task.status,
            priority=new_task.priority,
            due_date=new_task.due_date,
            completed_at=new_task.completed_at,
            created_at=new_task.created_at,
            updated_at=new_task.updated_at
        )
    else:
        # Mock database logic
        mock_db = await get_mock_db()
        task_dict = {
            "title": task_data.title,
            "description": task_data.description,
            "assigned_to": task_data.assigned_to,
            "assigned_by": task_data.assigned_by,
            "status": task_data.status or "pending",
            "priority": task_data.priority or "medium",
            "due_date": task_data.due_date.isoformat() if task_data.due_date else None
        }
        
        new_task = await mock_db.create_task(task_dict)
        
        # Get assignee details for email
        assignee = await mock_db.get_user_by_id(task_data.assigned_to)
        
        task_response = TaskResponse(**new_task)
    
    # Queue email notification to assignee
    if assignee:
        try:
            email_id = email_service.send_task_assignment(
                to_email=assignee.email if use_real_db else assignee["email"],
                assignee_name=assignee.full_name if use_real_db else assignee["full_name"],
                task_title=task_data.title,
                task_description=task_data.description or "",
                due_date=task_data.due_date.strftime("%Y-%m-%d") if task_data.due_date else None,
                priority=task_data.priority or "Medium"
            )
            print(f"Task assignment email queued: {email_id}")
        except Exception as e:
            print(f"Failed to queue task assignment email: {e}")
    
    return task_response

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(request: Request, db: AsyncSession = Depends(get_db)):
    """Get all tasks"""
    use_real_db = getattr(request.app.state, 'use_real_db', False)
    
    if use_real_db:
        result = await db.execute(select(Task))
        tasks = result.scalars().all()
        return [TaskResponse(
            id=str(task.id),
            title=task.title,
            description=task.description,
            assigned_to=str(task.assigned_to),
            assigned_by=str(task.assigned_by),
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            completed_at=task.completed_at,
            created_at=task.created_at,
            updated_at=task.updated_at
        ) for task in tasks]
    else:
        mock_db = await get_mock_db()
        tasks = await mock_db.get_all_tasks()
        return [TaskResponse(**task) for task in tasks]

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Get task by ID"""
    use_real_db = getattr(request.app.state, 'use_real_db', False)
    
    if use_real_db:
        result = await db.execute(select(Task).where(Task.id == task_id))
        task = result.scalar_one_or_none()
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        return TaskResponse(
            id=str(task.id),
            title=task.title,
            description=task.description,
            assigned_to=str(task.assigned_to),
            assigned_by=str(task.assigned_by),
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            completed_at=task.completed_at,
            created_at=task.created_at,
            updated_at=task.updated_at
        )
    else:
        mock_db = await get_mock_db()
        task = await mock_db.get_task_by_id(task_id)
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        return TaskResponse(**task)

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task_update: TaskUpdate, request: Request, db: AsyncSession = Depends(get_db)):
    """Update task status and details"""
    use_real_db = getattr(request.app.state, 'use_real_db', False)
    
    if use_real_db:
        result = await db.execute(select(Task).where(Task.id == task_id))
        task = result.scalar_one_or_none()
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        # Update fields
        if task_update.title is not None:
            task.title = task_update.title
        if task_update.description is not None:
            task.description = task_update.description
        if task_update.status is not None:
            task.status = task_update.status
            if task_update.status == "completed":
                from datetime import datetime
                task.completed_at = datetime.utcnow()
        if task_update.priority is not None:
            task.priority = task_update.priority
        if task_update.due_date is not None:
            task.due_date = task_update.due_date
        
        await db.commit()
        await db.refresh(task)
        
        return TaskResponse(
            id=str(task.id),
            title=task.title,
            description=task.description,
            assigned_to=str(task.assigned_to),
            assigned_by=str(task.assigned_by),
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            completed_at=task.completed_at,
            created_at=task.created_at,
            updated_at=task.updated_at
        )
    else:
        mock_db = await get_mock_db()
        task = await mock_db.update_task(task_id, task_update.dict(exclude_unset=True))
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        return TaskResponse(**task)