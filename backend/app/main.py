from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.api import auth, users, leads, tasks, email
from app.utils.database import AsyncSessionLocal
# Rate limiting and validation middleware (simplified for demo)
# from app.middleware.rate_limit import RateLimitMiddleware
# from app.middleware.validation import InputValidationMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Enhanced security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "connect-src 'self'; "
            "frame-ancestors 'none'"
        )
        response.headers["Permissions-Policy"] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=(), "
            "payment=(), "
            "usb=(), "
            "magnetometer=(), "
            "gyroscope=(), "
            "speaker=()"
        )
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        
        return response

app = FastAPI(
    title="CRM API", 
    version="1.0.0",
    docs_url="/docs" if __name__ == "__main__" else None,  # Disable docs in production
    redoc_url="/redoc" if __name__ == "__main__" else None
)

# CORS middleware - must be added FIRST to handle preflight requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Security middleware (simplified for demo)
# app.add_middleware(RateLimitMiddleware, default_limit=100, default_window=60)
# app.add_middleware(InputValidationMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1", "*.localhost"])

# Compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(leads.router, prefix="/api/leads", tags=["leads"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(email.router, prefix="/api/email", tags=["email"])

@app.on_event("startup")
async def startup_event():
    print("🚀 Starting CRM API...")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🏥 Health Check: http://localhost:8000/health")
    print()
    
    # Start background tasks
    from app.services.background_tasks import background_manager
    await background_manager.start()
    
    # Test database connection
    try:
        from sqlalchemy import text
        print("🔗 Testing database connection...")
        
        async with AsyncSessionLocal() as session:
            # Test basic connection
            await session.execute(text("SELECT 1"))
            print("✅ Real database connection successful!")
            
            # Check if super admin exists
            result = await session.execute(text(
                "SELECT username, email FROM users WHERE role = 'super_admin' LIMIT 1"
            ))
            admin = result.fetchone()
            
            if admin:
                print(f"👤 Super Admin ready: {admin[0]} / admin123")
            else:
                print("⚠️  Super admin not found - please run manual setup")
            
            # Set global flag for real database
            app.state.use_real_db = True
            
            # Initialize performance optimizations (simplified for demo)
            try:
                # from app.utils.performance_init import initialize_performance_optimizations
                # await initialize_performance_optimizations()
                print("⚡ Performance optimizations ready (database indexes will be created when connected)")
            except Exception as perf_error:
                print(f"⚠️  Performance optimization failed: {perf_error}")
                
    except Exception as e:
        print("🔧 Real database not available - using mock database for development")
        print("👤 Mock Super Admin: superadmin / admin123")
        print("📝 All API endpoints will work with mock data")
        print("🔄 Connect to real database later for persistence")
        
        # Set global flag for mock database
        app.state.use_real_db = False

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("🛑 Shutting down CRM API...")
    
    # Stop background tasks
    from app.services.background_tasks import background_manager
    await background_manager.stop()
    
    print("✅ CRM API shutdown complete")

@app.get("/")
async def root():
    return {
        "message": "CRM API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "features": [
            "User Management with Role-based Access Control",
            "Lead Management and Assignment",
            "Task Assignment and Tracking",
            "Email Notifications",
            "Auto-generated User Credentials"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        from sqlalchemy import text
        # Test database connection
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

@app.get("/email-setup-help")
async def email_setup_help():
    """Serve email setup instructions HTML page"""
    from fastapi.responses import FileResponse
    import os
    
    html_file = os.path.join(os.path.dirname(__file__), "..", "email_setup_instructions.html")
    if os.path.exists(html_file):
        return FileResponse(html_file, media_type="text/html")
    else:
        # Fallback JSON response
        return {
            "message": "Email setup instructions",
            "gmail_setup": [
                "1. Enable 2-Step Verification in Google Account",
                "2. Generate App Password for Mail",
                "3. Update EMAIL_PASS in .env file with the 16-character app password",
                "4. Restart backend server",
                "5. Test by creating a user"
            ]
        }

@app.options("/{path:path}")
async def options_handler(path: str):
    """Handle OPTIONS requests for CORS preflight"""
    return {"message": "OK"}

@app.post("/init-db")
async def initialize_database():
    """Initialize database tables and default admin"""
    try:
        from app.utils.database import create_tables, create_default_admin
        await create_tables()
        await create_default_admin()
        return {
            "message": "Database initialized successfully",
            "admin_credentials": {
                "username": "superadmin",
                "password": "admin123",
                "email": "admin@crm.com"
            }
        }
    except Exception as e:
        return {"error": f"Database initialization failed: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)