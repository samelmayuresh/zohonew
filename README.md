# CRM System - Role-Based Access Management

A comprehensive Customer Relationship Management (CRM) system built with Next.js frontend and FastAPI backend, featuring role-based access control, user management, lead tracking, task assignment, and email notifications.

## 🚀 Features

### Core Functionality
- **Role-Based Access Control**: 6 distinct user roles with specific permissions
- **User Management**: Create users with auto-generated credentials
- **Lead Management**: Track and assign leads to sales team
- **Task Assignment**: Assign and track tasks with email notifications
- **Email Notifications**: Automated credential and task notification emails
- **Dashboard Views**: Role-specific dashboards for each user type

### User Roles
1. **Super Admin** - Full system access and user management
2. **Admin** - Operational management without billing access
3. **Sales Manager** - Team performance monitoring and lead assignment
4. **Sales Executive** - Personal lead and deal management
5. **Support Agent** - Customer support and ticket management
6. **Customer** - Limited portal access for project tracking

### Performance & Security Optimizations
- **Database Optimization**: Connection pooling, indexing, query optimization
- **Security Features**: Rate limiting, input validation, security headers
- **Frontend Performance**: Code splitting, lazy loading, bundle optimization
- **Monitoring**: Performance tracking and web vitals monitoring

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with TypeScript
- **Styled Components** for styling
- **Axios** for API calls
- **Performance Monitoring** with Web Vitals

### Backend
- **FastAPI** with Python
- **SQLAlchemy** with AsyncPG for PostgreSQL
- **JWT Authentication** with role-based permissions
- **Email Service** with SMTP integration
- **Background Tasks** for email processing

### Database
- **PostgreSQL** (Supabase)
- **Mock Database** for development

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL database (or use mock database)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   ```

4. **Start the backend server:**
   ```bash
   python start_server.py
   ```
   Or alternatively:
   ```bash
   python -m app.main
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd crm-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Email Setup (Gmail)

To enable email notifications for user credentials and task assignments:

1. **Enable 2-Step Verification** on your Google account
2. **Generate App Password**:
   - Go to Google Account → Security → App Passwords
   - Select "Mail" and generate a 16-character password
3. **Update .env file** with the app password
4. **Restart the backend server**

For detailed instructions, visit: `http://localhost:8000/email-setup-help`

### Database Setup

The system supports both real PostgreSQL database and mock database for development:

- **Real Database**: Configure `DATABASE_URL` in `.env`
- **Mock Database**: Automatically used if real database is unavailable

## 🚀 Usage

### Default Credentials
- **Username**: `superadmin`
- **Password**: `admin123`

### Creating Users
1. Login as Super Admin
2. Navigate to Users section
3. Click "Create User"
4. Fill in user details and select role
5. User credentials will be auto-generated and emailed

### Managing Leads
1. Navigate to Leads section
2. Create new leads with contact information
3. Assign leads to sales team members
4. Track lead status and progress

### Task Assignment
1. Go to Tasks section
2. Create tasks with assignee and due date
3. Email notifications sent automatically
4. Track task completion and overdue items

## 📊 API Documentation

Once the backend is running, visit:
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Email Setup Help**: http://localhost:8000/email-setup-help

## 🔒 Security Features

- **JWT Authentication** with role-based access control
- **Input Validation** against SQL injection and XSS
- **Rate Limiting** on API endpoints
- **Security Headers** (CSP, HSTS, etc.)
- **Password Hashing** with bcrypt

## ⚡ Performance Features

- **Database Connection Pooling** with optimized settings
- **Query Optimization** with proper indexing
- **Frontend Code Splitting** and lazy loading
- **API Response Caching** and request deduplication
- **Bundle Optimization** with Next.js

## 🧪 Testing

### Backend Testing
```bash
cd backend
python test_email_config.py  # Test email configuration
python optimize_system.py    # Verify optimizations
```

### Frontend Testing
```bash
cd crm-app
npm run build:analyze  # Analyze bundle size
```

## 📁 Project Structure

```
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utilities
│   │   └── middleware/     # Custom middleware
│   ├── .env               # Environment variables
│   └── requirements.txt   # Python dependencies
├── crm-app/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   └── utils/         # Utilities
│   ├── package.json       # Node dependencies
│   └── next.config.js     # Next.js configuration
├── ui components/         # Reusable UI components
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/docs`
- Review email setup instructions at `/email-setup-help`
- Check the health endpoint at `/health`

## 🔄 Development Status

- ✅ User Management with Role-Based Access Control
- ✅ Lead Management and Assignment
- ✅ Task Assignment and Tracking
- ✅ Email Notifications System
- ✅ Performance and Security Optimizations
- ✅ Role-Specific Dashboards
- 🚧 Advanced Reporting (Coming Soon)
- 🚧 Workflow Automation (Coming Soon)
- 🚧 Advanced Analytics (Coming Soon)

---

Built with ❤️ for efficient CRM management