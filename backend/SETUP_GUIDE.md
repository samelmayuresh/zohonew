# CRM Database Setup Guide

## Quick Setup (Recommended)

### Step 1: Manual Database Setup
Since the automatic connection might fail due to network issues, please set up the database manually:

1. **Open your Supabase project**
2. **Go to SQL Editor**
3. **Copy and paste the entire content from `manual_db_setup.sql`**
4. **Click "Run" to execute all commands**

This will create:
- ✅ `users` table with role-based access control
- ✅ `leads` table for customer management
- ✅ `tasks` table for task assignment
- ✅ `user_sessions` table for authentication
- ✅ Default super admin account

### Step 2: Verify Database Setup
After running the SQL commands, you should see:
```
Database setup completed!
users
leads  
tasks
user_sessions
superadmin | admin@crm.com | super_admin | [timestamp]
```

### Step 3: Start the API Server
```bash
cd backend
python test_server.py
```

Or use uvicorn directly:
```bash
python -m uvicorn app.main:app --reload --port 8000
```

### Step 4: Test the API
Visit: http://localhost:8000/docs

## Default Admin Credentials
- **Username:** `superadmin`
- **Password:** `admin123`
- **Email:** `admin@crm.com`
- **Role:** `super_admin`

## API Endpoints

### Health Check
- **GET** `/health` - Check database connection status

### Authentication
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/logout` - User logout

### User Management
- **POST** `/api/users/` - Create new user (returns auto-generated credentials)
- **GET** `/api/users/` - Get all users
- **GET** `/api/users/{id}` - Get user by ID

### Lead Management
- **POST** `/api/leads/` - Create new lead
- **GET** `/api/leads/` - Get all leads

### Task Management
- **POST** `/api/tasks/` - Create new task
- **GET** `/api/tasks/` - Get all tasks

## Features

### 🔐 Auto-Generated User Credentials
When a Super Admin creates a new user:
1. **Unique username** is generated from the full name + random numbers
2. **Secure password** is auto-generated (12 characters with mixed case, numbers, symbols)
3. **Credentials popup** shows the generated username/password to the admin
4. **Email notification** is automatically sent to the new user

### 📧 Email Notifications
- User creation credentials
- Task assignment notifications
- Configurable SMTP settings

### 🛡️ Role-Based Access Control
- **Super Admin:** Full system access
- **Admin:** Operational management (no billing)
- **Sales Manager:** Team oversight and reporting
- **Sales Executive:** Personal leads and deals
- **Support Agent:** Customer support tickets
- **Customer:** Limited portal access

## Troubleshooting

### Database Connection Issues
If you see connection errors:
1. Check your internet connection
2. Verify DATABASE_URL in `.env` file
3. Ensure Supabase project is active
4. Use manual SQL setup instead

### Server Won't Start
1. Make sure all dependencies are installed: `pip install -r requirements.txt`
2. Check if port 8000 is available
3. Try using `python test_server.py` instead

### Email Not Working
1. Update EMAIL_PASS in `.env` with your Gmail app password
2. Enable 2-factor authentication on Gmail
3. Generate an app-specific password

## Next Steps

After successful setup:
1. Test user creation via API
2. Verify email notifications work
3. Start building the frontend components
4. Implement authentication flow

## Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test database connection using `/health` endpoint
4. Ensure all required tables exist in Supabase