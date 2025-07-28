from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.utils.database import get_db
from app.utils.mock_database import get_mock_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserCredentials
from app.services.auth_service import get_password_hash, generate_unique_username, generate_secure_password
from app.services.email_service import email_service
from typing import List

router = APIRouter()

@router.post("/", response_model=UserCredentials)
async def create_user(user_data: UserCreate, request: Request, db: AsyncSession = Depends(get_db)):
    """Create a new user with auto-generated username and password"""
    
    # Check if using real or mock database
    use_real_db = getattr(request.app.state, 'use_real_db', False)
    
    if use_real_db:
        # Real database logic
        result = await db.execute(select(User).where(User.email == user_data.email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Generate unique username and secure password
        username = generate_unique_username(user_data.full_name)
        password = generate_secure_password()
        
        # Ensure username is unique
        while True:
            result = await db.execute(select(User).where(User.username == username))
            if not result.scalar_one_or_none():
                break
            username = generate_unique_username(user_data.full_name)
        
        # Create new user
        new_user = User(
            username=username,
            email=user_data.email,
            password_hash=get_password_hash(password),
            full_name=user_data.full_name,
            role=user_data.role.value,
            is_active=True
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
    else:
        # Mock database logic
        mock_db = await get_mock_db()
        
        # Check if email already exists
        existing_user = await mock_db.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Generate unique username and secure password
        username = generate_unique_username(user_data.full_name)
        password = generate_secure_password()
        
        # Ensure username is unique
        while True:
            existing_user = await mock_db.get_user_by_username(username)
            if not existing_user:
                break
            username = generate_unique_username(user_data.full_name)
        
        # Create new user in mock database
        await mock_db.create_user({
            "username": username,
            "email": user_data.email,
            "password_hash": get_password_hash(password),
            "full_name": user_data.full_name,
            "role": user_data.role.value,
            "is_active": True
        })
    
    # Queue credentials email for sending
    email_status = "not_sent"
    email_error = None
    
    try:
        email_id = email_service.send_user_credentials(
            to_email=user_data.email,
            full_name=user_data.full_name,
            username=username,
            password=password,
            role=user_data.role.value
        )
        print(f"User credentials email queued: {email_id}")
        
        # Try to process the email immediately
        stats = email_service.process_email_queue()
        
        # Check if email was sent
        job = email_service.get_email_status(email_id)
        if job:
            if job.status.value == "sent":
                email_status = "sent"
            elif job.status.value == "failed":
                email_status = "failed"
                email_error = job.error_message
            else:
                email_status = "queued"
        
    except Exception as e:
        email_error = str(e)
        print(f"Email queueing failed: {e}")
    
    # Return credentials for popup display with email status
    credentials = UserCredentials(
        username=username,
        password=password,
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role.value
    )
    
    # Add email status info (this will be shown in the response)
    credentials.email_status = email_status
    credentials.email_error = email_error
    
    return credentials

@router.get("/", response_model=List[UserResponse])
async def get_users(request: Request, db: AsyncSession = Depends(get_db)):
    """Get all users"""
    use_real_db = getattr(request.app.state, 'use_real_db', False)
    
    if use_real_db:
        result = await db.execute(select(User).where(User.is_active == True))
        users = result.scalars().all()
        return users
    else:
        mock_db = await get_mock_db()
        users = await mock_db.get_all_users()
        return [UserResponse(**user) for user in users]

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Get user by ID"""
    use_real_db = getattr(request.app.state, 'use_real_db', False)
    
    if use_real_db:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
    else:
        mock_db = await get_mock_db()
        user = await mock_db.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserResponse(**user)