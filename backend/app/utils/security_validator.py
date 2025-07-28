"""
Comprehensive security validation utilities
"""
import re
import hashlib
import secrets
import time
from typing import Any, Dict, List, Optional
from email_validator import validate_email, EmailNotValidError
import logging

logger = logging.getLogger(__name__)

class SecurityValidator:
    """Comprehensive security validation class"""
    
    # Password requirements
    PASSWORD_MIN_LENGTH = 8
    PASSWORD_MAX_LENGTH = 128
    
    # Input size limits
    MAX_STRING_LENGTH = 1000
    MAX_TEXT_LENGTH = 10000
    MAX_EMAIL_LENGTH = 254
    MAX_NAME_LENGTH = 100
    
    # Dangerous patterns
    SQL_INJECTION_PATTERNS = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)",
        r"(--|#|/\*|\*/)",
        r"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
        r"(\bOR\s+\w+\s*=\s*\w+)",
        r"(\bUNION\s+SELECT)",
        r"(\bINTO\s+OUTFILE)",
        r"(\bLOAD_FILE)",
        r"(\bSCRIPT\b)",
    ]
    
    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe[^>]*>.*?</iframe>",
        r"<object[^>]*>.*?</object>",
        r"<embed[^>]*>.*?</embed>",
        r"<link[^>]*>",
        r"<meta[^>]*>",
        r"vbscript:",
        r"data:text/html",
    ]
    
    COMMAND_INJECTION_PATTERNS = [
        r"[;&|`$(){}[\]\\]",
        r"\b(rm|del|format|fdisk|mkfs)\b",
        r"\b(wget|curl|nc|netcat)\b",
        r"\b(python|perl|ruby|php|node)\b",
        r"\b(sudo|su|chmod|chown)\b",
    ]
    
    def __init__(self):
        # Compile patterns for better performance
        self.sql_patterns = [re.compile(p, re.IGNORECASE) for p in self.SQL_INJECTION_PATTERNS]
        self.xss_patterns = [re.compile(p, re.IGNORECASE) for p in self.XSS_PATTERNS]
        self.cmd_patterns = [re.compile(p, re.IGNORECASE) for p in self.COMMAND_INJECTION_PATTERNS]
    
    def validate_email(self, email: str) -> tuple[bool, str]:
        """Validate email address"""
        if not email or len(email) > self.MAX_EMAIL_LENGTH:
            return False, "Invalid email length"
        
        try:
            validated_email = validate_email(email)
            return True, validated_email.email
        except EmailNotValidError as e:
            return False, str(e)
    
    def validate_password(self, password: str) -> tuple[bool, str]:
        """Validate password strength"""
        if not password:
            return False, "Password is required"
        
        if len(password) < self.PASSWORD_MIN_LENGTH:
            return False, f"Password must be at least {self.PASSWORD_MIN_LENGTH} characters"
        
        if len(password) > self.PASSWORD_MAX_LENGTH:
            return False, f"Password must be less than {self.PASSWORD_MAX_LENGTH} characters"
        
        # Check for required character types
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
        
        if not (has_upper and has_lower and has_digit and has_special):
            return False, "Password must contain uppercase, lowercase, digit, and special character"
        
        # Check for common patterns
        if self._has_common_patterns(password):
            return False, "Password contains common patterns"
        
        return True, "Password is valid"
    
    def _has_common_patterns(self, password: str) -> bool:
        """Check for common password patterns"""
        common_patterns = [
            r"123456",
            r"password",
            r"qwerty",
            r"abc123",
            r"admin",
            r"(.)\1{3,}",  # Repeated characters
        ]
        
        for pattern in common_patterns:
            if re.search(pattern, password, re.IGNORECASE):
                return True
        
        return False
    
    def validate_string_input(self, value: str, field_name: str, max_length: int = None) -> tuple[bool, str]:
        """Validate string input for security threats"""
        if not isinstance(value, str):
            return False, f"{field_name} must be a string"
        
        # Check length
        max_len = max_length or self.MAX_STRING_LENGTH
        if len(value) > max_len:
            return False, f"{field_name} exceeds maximum length of {max_len}"
        
        # Check for null bytes
        if '\x00' in value:
            return False, f"{field_name} contains null bytes"
        
        # Check for SQL injection
        for pattern in self.sql_patterns:
            if pattern.search(value):
                logger.warning(f"SQL injection attempt detected in {field_name}: {value[:100]}")
                return False, f"{field_name} contains potentially malicious SQL patterns"
        
        # Check for XSS
        for pattern in self.xss_patterns:
            if pattern.search(value):
                logger.warning(f"XSS attempt detected in {field_name}: {value[:100]}")
                return False, f"{field_name} contains potentially malicious XSS patterns"
        
        # Check for command injection
        for pattern in self.cmd_patterns:
            if pattern.search(value):
                logger.warning(f"Command injection attempt detected in {field_name}: {value[:100]}")
                return False, f"{field_name} contains potentially malicious command patterns"
        
        return True, "Valid input"
    
    def validate_user_data(self, data: Dict[str, Any]) -> tuple[bool, Dict[str, str]]:
        """Validate user creation/update data"""
        errors = {}
        
        # Validate email
        if 'email' in data:
            valid, msg = self.validate_email(data['email'])
            if not valid:
                errors['email'] = msg
        
        # Validate password
        if 'password' in data:
            valid, msg = self.validate_password(data['password'])
            if not valid:
                errors['password'] = msg
        
        # Validate name fields
        for field in ['full_name', 'first_name', 'last_name']:
            if field in data:
                valid, msg = self.validate_string_input(
                    data[field], field, self.MAX_NAME_LENGTH
                )
                if not valid:
                    errors[field] = msg
        
        # Validate role
        if 'role' in data:
            valid_roles = ['super_admin', 'admin', 'sales_manager', 'sales_executive', 'support_agent', 'customer']
            if data['role'] not in valid_roles:
                errors['role'] = f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        
        return len(errors) == 0, errors
    
    def validate_lead_data(self, data: Dict[str, Any]) -> tuple[bool, Dict[str, str]]:
        """Validate lead creation/update data"""
        errors = {}
        
        # Validate required fields
        required_fields = ['first_name', 'last_name']
        for field in required_fields:
            if field not in data or not data[field]:
                errors[field] = f"{field} is required"
        
        # Validate string fields
        string_fields = ['first_name', 'last_name', 'company', 'source', 'status']
        for field in string_fields:
            if field in data and data[field]:
                valid, msg = self.validate_string_input(
                    data[field], field, self.MAX_NAME_LENGTH
                )
                if not valid:
                    errors[field] = msg
        
        # Validate email if provided
        if 'email' in data and data['email']:
            valid, msg = self.validate_email(data['email'])
            if not valid:
                errors['email'] = msg
        
        # Validate phone if provided
        if 'phone' in data and data['phone']:
            if not re.match(r'^[\d\s\-\+\(\)\.]+$', data['phone']):
                errors['phone'] = "Invalid phone number format"
        
        return len(errors) == 0, errors
    
    def validate_task_data(self, data: Dict[str, Any]) -> tuple[bool, Dict[str, str]]:
        """Validate task creation/update data"""
        errors = {}
        
        # Validate required fields
        if 'title' not in data or not data['title']:
            errors['title'] = "Title is required"
        
        # Validate string fields
        if 'title' in data:
            valid, msg = self.validate_string_input(
                data['title'], 'title', self.MAX_STRING_LENGTH
            )
            if not valid:
                errors['title'] = msg
        
        if 'description' in data and data['description']:
            valid, msg = self.validate_string_input(
                data['description'], 'description', self.MAX_TEXT_LENGTH
            )
            if not valid:
                errors['description'] = msg
        
        # Validate priority
        if 'priority' in data:
            valid_priorities = ['low', 'medium', 'high', 'urgent']
            if data['priority'] not in valid_priorities:
                errors['priority'] = f"Invalid priority. Must be one of: {', '.join(valid_priorities)}"
        
        # Validate status
        if 'status' in data:
            valid_statuses = ['pending', 'in_progress', 'completed', 'cancelled']
            if data['status'] not in valid_statuses:
                errors['status'] = f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        
        return len(errors) == 0, errors
    
    def sanitize_string(self, value: str) -> str:
        """Sanitize string by removing dangerous characters"""
        if not isinstance(value, str):
            return str(value)
        
        # Remove null bytes
        value = value.replace('\x00', '')
        
        # Remove control characters except newline and tab
        value = ''.join(char for char in value if ord(char) >= 32 or char in '\n\t')
        
        # Limit length
        if len(value) > self.MAX_STRING_LENGTH:
            value = value[:self.MAX_STRING_LENGTH]
        
        return value.strip()
    
    def generate_secure_token(self, length: int = 32) -> str:
        """Generate cryptographically secure random token"""
        return secrets.token_urlsafe(length)
    
    def hash_sensitive_data(self, data: str) -> str:
        """Hash sensitive data for logging/storage"""
        return hashlib.sha256(data.encode()).hexdigest()[:16]

# Global validator instance
security_validator = SecurityValidator()