import re
from typing import Any, Dict
from fastapi import HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import json

class InputValidationMiddleware(BaseHTTPMiddleware):
    """Middleware for input validation and sanitization"""
    
    def __init__(self, app):
        super().__init__(app)
        
        # Dangerous patterns to check for
        self.sql_injection_patterns = [
            r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)",
            r"(--|#|/\*|\*/)",
            r"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
            r"(\bOR\s+\w+\s*=\s*\w+)",
        ]
        
        self.xss_patterns = [
            r"<script[^>]*>.*?</script>",
            r"javascript:",
            r"on\w+\s*=",
            r"<iframe[^>]*>.*?</iframe>",
        ]
        
        # Compile patterns for better performance
        self.compiled_sql_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.sql_injection_patterns]
        self.compiled_xss_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.xss_patterns]
    
    async def dispatch(self, request: Request, call_next):
        # Skip validation for certain endpoints
        if self.should_skip_validation(request.url.path):
            return await call_next(request)
        
        # Validate request body if present
        if request.method in ["POST", "PUT", "PATCH"]:
            body = await request.body()
            if body:
                try:
                    # Parse JSON body
                    json_body = json.loads(body.decode())
                    self.validate_json_data(json_body)
                except json.JSONDecodeError:
                    # If not JSON, validate as string
                    self.validate_string_data(body.decode())
                except Exception as e:
                    raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
                
                # Recreate request with validated body
                request._body = body
        
        # Validate query parameters
        for key, value in request.query_params.items():
            self.validate_string_data(value, field_name=key)
        
        response = await call_next(request)
        return response
    
    def should_skip_validation(self, path: str) -> bool:
        """Skip validation for certain endpoints"""
        skip_paths = [
            "/docs",
            "/redoc",
            "/openapi.json",
            "/health",
            "/",
        ]
        return any(path.startswith(skip_path) for skip_path in skip_paths)
    
    def validate_string_data(self, data: str, field_name: str = "input") -> None:
        """Validate string data for malicious patterns"""
        if not isinstance(data, str):
            return
        
        # Check for SQL injection patterns
        for pattern in self.compiled_sql_patterns:
            if pattern.search(data):
                raise HTTPException(
                    status_code=400,
                    detail=f"Potentially malicious SQL pattern detected in {field_name}"
                )
        
        # Check for XSS patterns
        for pattern in self.compiled_xss_patterns:
            if pattern.search(data):
                raise HTTPException(
                    status_code=400,
                    detail=f"Potentially malicious XSS pattern detected in {field_name}"
                )
        
        # Check for excessively long input
        if len(data) > 10000:  # 10KB limit
            raise HTTPException(
                status_code=400,
                detail=f"Input too long in {field_name} (max 10KB)"
            )
    
    def validate_json_data(self, data: Any, path: str = "root") -> None:
        """Recursively validate JSON data"""
        if isinstance(data, dict):
            for key, value in data.items():
                self.validate_string_data(str(key), f"{path}.{key}")
                self.validate_json_data(value, f"{path}.{key}")
        elif isinstance(data, list):
            for i, item in enumerate(data):
                self.validate_json_data(item, f"{path}[{i}]")
        elif isinstance(data, str):
            self.validate_string_data(data, path)
    
    def sanitize_string(self, data: str) -> str:
        """Sanitize string data by removing dangerous characters"""
        if not isinstance(data, str):
            return data
        
        # Remove null bytes
        data = data.replace('\x00', '')
        
        # Remove control characters except newline and tab
        data = ''.join(char for char in data if ord(char) >= 32 or char in '\n\t')
        
        return data.strip()