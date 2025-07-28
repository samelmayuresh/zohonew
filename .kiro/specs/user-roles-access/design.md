# Design Document

## Overview

The User Roles and Access Management system is designed as a full-stack web application using Next.js for the frontend and Python (FastAPI) for the backend, with Supabase PostgreSQL as the database. The system implements role-based access control (RBAC) with six distinct user roles, each having specific permissions and interface components.

## Architecture

### Frontend Architecture (Next.js)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Styled-components (reusing existing UI component patterns)
- **State Management**: React Context API for user authentication and role management
- **Routing**: Next.js App Router with middleware for role-based route protection
- **Components**: Modular component structure adapted from existing UI components

### Backend Architecture (Python FastAPI)
- **Framework**: FastAPI for REST API development
- **Database ORM**: SQLAlchemy with asyncpg for PostgreSQL
- **Authentication**: JWT tokens with role-based claims
- **Email Service**: SMTP integration for user credential notifications
- **Validation**: Pydantic models for request/response validation

### Database Architecture (Supabase PostgreSQL)
- **Connection**: Direct PostgreSQL connection using provided credentials
- **Schema**: Normalized relational design with proper foreign key relationships
- **Security**: Row Level Security (RLS) policies for data access control
- **Audit**: Timestamp tracking for all CRUD operations

## Components and Interfaces

### Database Schema

```sql
-- Users table with role-based access
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'sales_manager', 'sales_executive', 'support_agent', 'customer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Leads table for sales management
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table for assignment and tracking
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES users(id),
    assigned_by UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for authentication tracking
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Frontend Components Structure

```
crm-app/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx (adapted from login1.tsx)
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/
│   │   ├── SuperAdminDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── SalesManagerDashboard.tsx
│   │   ├── SalesExecutiveDashboard.tsx
│   │   ├── SupportAgentDashboard.tsx
│   │   └── CustomerPortal.tsx
│   ├── users/
│   │   ├── CreateUserForm.tsx (adapted from form1.tsx)
│   │   ├── UserList.tsx (using card1.tsx pattern)
│   │   └── UserCredentialsPopup.tsx (adapted from popup1.tsx)
│   ├── leads/
│   │   ├── CreateLeadForm.tsx
│   │   ├── LeadList.tsx
│   │   └── LeadCard.tsx
│   ├── tasks/
│   │   ├── CreateTaskForm.tsx
│   │   ├── TaskList.tsx
│   │   └── TaskCard.tsx
│   └── common/
│       ├── Navigation.tsx (adapted from nav1.tsx)
│       ├── Button.tsx (adapted from btn1.tsx)
│       └── Loader.tsx (adapted from loader1.tsx)
```

### Backend API Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── auth.py (login, logout, token refresh)
│   │   ├── users.py (CRUD operations with role checks)
│   │   ├── leads.py (lead management endpoints)
│   │   └── tasks.py (task assignment and tracking)
│   ├── models/
│   │   ├── user.py (SQLAlchemy User model)
│   │   ├── lead.py (SQLAlchemy Lead model)
│   │   └── task.py (SQLAlchemy Task model)
│   ├── schemas/
│   │   ├── user.py (Pydantic schemas)
│   │   ├── lead.py (Pydantic schemas)
│   │   └── task.py (Pydantic schemas)
│   ├── services/
│   │   ├── auth_service.py (JWT handling, password hashing)
│   │   ├── email_service.py (SMTP email sending)
│   │   └── permission_service.py (role-based access control)
│   └── utils/
│       ├── database.py (database connection)
│       └── security.py (security utilities)
```

## Data Models

### User Model
```python
class User(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID]

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    SALES_MANAGER = "sales_manager"
    SALES_EXECUTIVE = "sales_executive"
    SUPPORT_AGENT = "support_agent"
    CUSTOMER = "customer"
```

### Lead Model
```python
class Lead(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: Optional[str]
    phone: Optional[str]
    company: Optional[str]
    source: Optional[str]
    status: str
    assigned_to: Optional[UUID]
    created_by: UUID
    created_at: datetime
    updated_at: datetime
```

### Task Model
```python
class Task(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    assigned_to: UUID
    assigned_by: UUID
    status: str
    priority: str
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
```

## Error Handling

### Frontend Error Handling
- Global error boundary for React components
- Toast notifications for user feedback (using popup component pattern)
- Form validation with real-time feedback
- Network error handling with retry mechanisms

### Backend Error Handling
- Custom exception classes for different error types
- HTTP status code mapping for API responses
- Detailed error logging for debugging
- Validation error responses with field-specific messages

### Database Error Handling
- Connection pool management with retry logic
- Transaction rollback on failures
- Constraint violation handling
- Audit trail for error tracking

## Testing Strategy

### Frontend Testing
- Unit tests for individual components using Jest and React Testing Library
- Integration tests for user flows and API interactions
- E2E tests using Playwright for critical user journeys
- Visual regression testing for UI consistency

### Backend Testing
- Unit tests for service functions and utilities
- Integration tests for API endpoints
- Database tests with test fixtures
- Authentication and authorization tests

### Database Testing
- Schema migration tests
- Data integrity tests
- Performance tests for query optimization
- Security tests for access control

## Security Considerations

### Authentication Security
- JWT tokens with short expiration times
- Secure password hashing using bcrypt
- Session management with token blacklisting
- Rate limiting for login attempts

### Authorization Security
- Role-based access control at API level
- Database row-level security policies
- Input validation and sanitization
- SQL injection prevention

### Data Security
- Encrypted database connections
- Sensitive data masking in logs
- CORS configuration for frontend access
- Environment variable management for secrets

## Performance Optimization

### Frontend Performance
- Code splitting for role-based components
- Lazy loading for dashboard modules
- Memoization for expensive computations
- Optimized bundle sizes

### Backend Performance
- Database connection pooling
- Query optimization with indexes
- Caching for frequently accessed data
- Async/await for non-blocking operations

### Database Performance
- Proper indexing strategy
- Query optimization
- Connection pooling
- Regular maintenance tasks