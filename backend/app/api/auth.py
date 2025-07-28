from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.utils.database import get_db
from app.utils.mock_database import get_mock_db
from app.models.user import User
from app.schemas.user import LoginRequest, LoginResponse, UserResponse
from app.services.auth_service import verify_password, create_access_token, verify_token
from datetime import timedelta

router = APIRouter()
security = HTTPBearer()

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """User login with username and password"""
    use_real_db = getattr(request.app.state, 'use_real_db', False)
    
    if use_real_db:
        # Real database authentication
        result = await db.execute(select(User).where(User.username == login_data.username))
        user = result.scalar_one_or_none()
    else:
        # Mock database authentication
        mock_db = await get_mock_db()
        user_data = await mock_db.get_user_by_username(login_data.username)
        user = user_data
    
    # Verify user exists and password is correct
    if not user or not verify_password(login_data.password, user.password_hash if use_real_db else user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Check if user is active
    is_active = user.is_active if use_real_db else user["is_active"]
    if not is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": str(user.id if use_real_db else user["id"]),
            "username": user.username if use_real_db else user["username"],
            "role": user.role if use_real_db else user["role"]
        }
    )
    
    # Prepare user response
    if use_real_db:
        user_response = UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    else:
        user_response = UserResponse(**user)
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@router.post("/logout")
async def logout():
    """User logout"""
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
async def get_current_user(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_db)):
    """Get current authenticated user"""
    # Verify token
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    use_real_db = getattr(request.app.state, 'use_real_db', False)
    
    if use_real_db:
        # Get user from real database
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    else:
        # Get user from mock database
        mock_db = await get_mock_db()
        user = await mock_db.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(**user)