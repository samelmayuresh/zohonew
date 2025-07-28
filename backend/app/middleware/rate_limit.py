import time
from typing import Dict, Optional
from fastapi import HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import asyncio
from collections import defaultdict, deque

class InMemoryRateLimiter:
    """In-memory rate limiter using sliding window"""
    
    def __init__(self):
        self.requests: Dict[str, deque] = defaultdict(deque)
        self.lock = asyncio.Lock()
    
    async def is_allowed(self, key: str, limit: int, window: int) -> bool:
        """Check if request is allowed based on rate limit"""
        async with self.lock:
            now = time.time()
            requests = self.requests[key]
            
            # Remove old requests outside the window
            while requests and requests[0] <= now - window:
                requests.popleft()
            
            # Check if limit exceeded
            if len(requests) >= limit:
                return False
            
            # Add current request
            requests.append(now)
            return True

# Global rate limiter instance
rate_limiter = InMemoryRateLimiter()

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware with different limits for different endpoints"""
    
    def __init__(self, app, default_limit: int = 100, default_window: int = 60):
        super().__init__(app)
        self.default_limit = default_limit
        self.default_window = default_window
        
        # Endpoint-specific rate limits
        self.endpoint_limits = {
            "/api/auth/login": (5, 60),  # 5 requests per minute for login
            "/api/auth/register": (3, 300),  # 3 requests per 5 minutes for registration
            "/api/users": (50, 60),  # 50 requests per minute for user operations
            "/api/leads": (100, 60),  # 100 requests per minute for leads
            "/api/tasks": (100, 60),  # 100 requests per minute for tasks
        }
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = self.get_client_ip(request)
        
        # Get rate limit for this endpoint
        path = request.url.path
        limit, window = self.get_rate_limit(path)
        
        # Create rate limit key
        rate_key = f"{client_ip}:{path}"
        
        # Check rate limit
        if not await rate_limiter.is_allowed(rate_key, limit, window):
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "limit": limit,
                    "window": window,
                    "retry_after": window
                }
            )
        
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Window"] = str(window)
        
        return response
    
    def get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        # Check for forwarded headers first
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to client host
        return request.client.host if request.client else "unknown"
    
    def get_rate_limit(self, path: str) -> tuple[int, int]:
        """Get rate limit for specific endpoint"""
        for endpoint, (limit, window) in self.endpoint_limits.items():
            if path.startswith(endpoint):
                return limit, window
        
        return self.default_limit, self.default_window