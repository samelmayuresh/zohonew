'use client'

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalLeads: number;
  totalTasks: number;
  activeUsers: number;
  pendingTasks: number;
  completedTasks: number;
  overdueTasks: number;
  newLeadsToday: number;
  tasksCompletedToday: number;
  systemUptime: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

interface SystemConfig {
  emailEnabled: boolean;
  maxUsers: number;
  sessionTimeout: number;
  backupEnabled: boolean;
  lastBackup: string;
}

const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalLeads: 0,
    totalTasks: 0,
    activeUsers: 0,
    pendingTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    newLeadsToday: 0,
    tasksCompletedToday: 0,
    systemUptime: '0 days'
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    emailEnabled: true,
    maxUsers: 100,
    sessionTimeout: 30,
    backupEnabled: true,
    lastBackup: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'config'>('overview');

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardStats();
    fetchAuditLogs();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch users, leads, and tasks in parallel
      const [usersRes, leadsRes, tasksRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/leads/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/tasks/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [users, leads, tasks] = await Promise.all([
        usersRes.ok ? usersRes.json() : [],
        leadsRes.ok ? leadsRes.json() : [],
        tasksRes.ok ? tasksRes.json() : []
      ]);

      const today = new Date().toISOString().split('T')[0];
      const overdueTasks = tasks.filter((t: any) => 
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
      );
      const newLeadsToday = leads.filter((l: any) => 
        l.created_at && l.created_at.split('T')[0] === today
      );
      const tasksCompletedToday = tasks.filter((t: any) => 
        t.completed_at && t.completed_at.split('T')[0] === today
      );

      setStats({
        totalUsers: users.length,
        totalLeads: leads.length,
        totalTasks: tasks.length,
        activeUsers: users.filter((u: any) => u.is_active).length,
        pendingTasks: tasks.filter((t: any) => t.status === 'pending').length,
        completedTasks: tasks.filter((t: any) => t.status === 'completed').length,
        overdueTasks: overdueTasks.length,
        newLeadsToday: newLeadsToday.length,
        tasksCompletedToday: tasksCompletedToday.length,
        systemUptime: calculateUptime()
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    // Mock audit logs for now - in a real system, this would fetch from an audit log API
    const mockLogs: AuditLogEntry[] = [
      {
        id: '1',
        action: 'User Created',
        user: 'Super Admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        details: 'Created new Sales Executive: john.doe@company.com'
      },
      {
        id: '2',
        action: 'Lead Assigned',
        user: 'Super Admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        details: 'Assigned lead "ABC Corp" to Sales Executive'
      },
      {
        id: '3',
        action: 'Task Created',
        user: 'Super Admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        details: 'Created task "Follow up with client" assigned to Sales Manager'
      },
      {
        id: '4',
        action: 'User Login',
        user: 'Sales Manager',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        details: 'Successful login from IP: 192.168.1.100'
      },
      {
        id: '5',
        action: 'System Config',
        user: 'Super Admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        details: 'Updated email notification settings'
      }
    ];
    setAuditLogs(mockLogs);
  };

  const calculateUptime = (): string => {
    // Mock uptime calculation - in a real system, this would be calculated from server start time
    const uptimeHours = Math.floor(Math.random() * 720) + 24; // Random between 1-30 days
    const days = Math.floor(uptimeHours / 24);
    const hours = uptimeHours % 24;
    return `${days} days, ${hours} hours`;
  };

  const quickActions = [
    {
      title: 'Create User',
      description: 'Add new team member',
      icon: '👤',
      link: '/dashboard/users',
      color: '#3b82f6'
    },
    {
      title: 'Create Lead',
      description: 'Add potential customer',
      icon: '🎯',
      link: '/dashboard/leads',
      color: '#10b981'
    },
    {
      title: 'Assign Task',
      description: 'Create new assignment',
      icon: '📋',
      link: '/dashboard/tasks',
      color: '#8b5cf6'
    },
    {
      title: 'System Config',
      description: 'Manage settings',
      icon: '⚙️',
      link: '#',
      color: '#ef4444',
      onClick: () => setActiveTab('config')
    },
    {
      title: 'Audit Logs',
      description: 'View system activity',
      icon: '📋',
      link: '#',
      color: '#f59e0b',
      onClick: () => setActiveTab('audit')
    },
    {
      title: 'View Reports',
      description: 'System analytics',
      icon: '📊',
      link: '/dashboard/reports',
      color: '#8b5cf6'
    }
  ];

  const handleConfigUpdate = async (key: keyof SystemConfig, value: any) => {
    setSystemConfig(prev => ({ ...prev, [key]: value }));
    // In a real system, this would make an API call to update the configuration
    console.log(`Updated ${key} to ${value}`);
  };

  if (loading) {
    return (
      <StyledWrapper>
        <div className="loading">Loading dashboard...</div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.full_name || 'Super Admin'}!</h1>
          <p>Here's what's happening in your CRM system today.</p>
        </div>
        <div className="header-controls">
          <div className="date-info">
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="tab-controls">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              Audit Logs
            </button>
            <button 
              className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`}
              onClick={() => setActiveTab('config')}
            >
              System Config
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-number">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
                <div className="stat-detail">{stats.activeUsers} active</div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-number">{stats.totalLeads}</div>
                <div className="stat-label">Total Leads</div>
                <div className="stat-detail">{stats.newLeadsToday} today</div>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-number">{stats.totalTasks}</div>
                <div className="stat-label">Total Tasks</div>
                <div className="stat-detail">{stats.pendingTasks} pending</div>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-number">{stats.completedTasks}</div>
                <div className="stat-label">Completed</div>
                <div className="stat-detail">{stats.tasksCompletedToday} today</div>
              </div>
            </div>

            <div className="stat-card danger">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <div className="stat-number">{stats.overdueTasks}</div>
                <div className="stat-label">Overdue Tasks</div>
                <div className="stat-detail">Need attention</div>
              </div>
            </div>

            <div className="stat-card system">
              <div className="stat-icon">🖥️</div>
              <div className="stat-content">
                <div className="stat-number">Online</div>
                <div className="stat-label">System Status</div>
                <div className="stat-detail">{stats.systemUptime}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'overview' && (
        <div className="content-grid">
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              {quickActions.map((action, index) => (
                action.onClick ? (
                  <button key={index} onClick={action.onClick} className="action-card action-button">
                    <div className="action-icon" style={{ backgroundColor: action.color }}>
                      {action.icon}
                    </div>
                    <div className="action-content">
                      <h3>{action.title}</h3>
                      <p>{action.description}</p>
                    </div>
                    <div className="action-arrow">→</div>
                  </button>
                ) : (
                  <Link key={index} href={action.link} className="action-card">
                    <div className="action-icon" style={{ backgroundColor: action.color }}>
                      {action.icon}
                    </div>
                    <div className="action-content">
                      <h3>{action.title}</h3>
                      <p>{action.description}</p>
                    </div>
                    <div className="action-arrow">→</div>
                  </Link>
                )
              ))}
            </div>
          </div>

          <div className="system-overview">
            <h2>System Overview</h2>
            <div className="overview-items">
              <div className="overview-item">
                <div className="overview-label">User Activity</div>
                <div className="overview-value">
                  <span className="value-number">{stats.activeUsers}</span>
                  <span className="value-total">/ {stats.totalUsers}</span>
                </div>
              </div>
              
              <div className="overview-item">
                <div className="overview-label">Task Progress</div>
                <div className="overview-value">
                  <span className="value-number">{stats.completedTasks}</span>
                  <span className="value-total">/ {stats.totalTasks}</span>
                </div>
              </div>
              
              <div className="overview-item">
                <div className="overview-label">System Status</div>
                <div className="overview-value">
                  <span className="status-indicator active">●</span>
                  <span>Online</span>
                </div>
              </div>

              <div className="overview-item">
                <div className="overview-label">System Uptime</div>
                <div className="overview-value">
                  <span className="value-number">{stats.systemUptime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="management-links">
          <h2>Management Areas</h2>
          <div className="links-grid">
            <Link href="/dashboard/users" className="management-link">
              <div className="link-icon">👥</div>
              <div className="link-content">
                <h3>User Management</h3>
                <p>Create, edit, and manage user accounts and permissions</p>
              </div>
            </Link>
            
            <Link href="/dashboard/leads" className="management-link">
              <div className="link-icon">🎯</div>
              <div className="link-content">
                <h3>Lead Management</h3>
                <p>Track and manage potential customers and opportunities</p>
              </div>
            </Link>
            
            <Link href="/dashboard/tasks" className="management-link">
              <div className="link-icon">📋</div>
              <div className="link-content">
                <h3>Task Management</h3>
                <p>Assign, track, and monitor team tasks and assignments</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="audit-logs">
          <div className="audit-header">
            <h2>System Audit Logs</h2>
            <p>Track all system activities and user actions</p>
          </div>
          
          <div className="audit-table">
            <div className="table-header">
              <div className="header-cell">Timestamp</div>
              <div className="header-cell">User</div>
              <div className="header-cell">Action</div>
              <div className="header-cell">Details</div>
            </div>
            
            {auditLogs.map((log) => (
              <div key={log.id} className="table-row">
                <div className="table-cell" data-label="Timestamp">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                <div className="table-cell" data-label="User">
                  <span className="user-badge">{log.user}</span>
                </div>
                <div className="table-cell" data-label="Action">
                  <span className={`action-badge ${log.action.toLowerCase().replace(' ', '-')}`}>
                    {log.action}
                  </span>
                </div>
                <div className="table-cell details" data-label="Details">
                  {log.details}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="system-config">
          <div className="config-header">
            <h2>System Configuration</h2>
            <p>Manage system settings and preferences</p>
          </div>
          
          <div className="config-sections">
            <div className="config-section">
              <h3>Email Settings</h3>
              <div className="config-item">
                <label>
                  <input
                    type="checkbox"
                    checked={systemConfig.emailEnabled}
                    onChange={(e) => handleConfigUpdate('emailEnabled', e.target.checked)}
                  />
                  Enable Email Notifications
                </label>
              </div>
            </div>

            <div className="config-section">
              <h3>User Management</h3>
              <div className="config-item">
                <label>
                  Maximum Users:
                  <input
                    type="number"
                    value={systemConfig.maxUsers}
                    onChange={(e) => handleConfigUpdate('maxUsers', parseInt(e.target.value))}
                    min="1"
                    max="1000"
                  />
                </label>
              </div>
            </div>

            <div className="config-section">
              <h3>Security Settings</h3>
              <div className="config-item">
                <label>
                  Session Timeout (minutes):
                  <input
                    type="number"
                    value={systemConfig.sessionTimeout}
                    onChange={(e) => handleConfigUpdate('sessionTimeout', parseInt(e.target.value))}
                    min="5"
                    max="480"
                  />
                </label>
              </div>
            </div>

            <div className="config-section">
              <h3>Backup Settings</h3>
              <div className="config-item">
                <label>
                  <input
                    type="checkbox"
                    checked={systemConfig.backupEnabled}
                    onChange={(e) => handleConfigUpdate('backupEnabled', e.target.checked)}
                  />
                  Enable Automatic Backups
                </label>
              </div>
              <div className="config-item">
                <span>Last Backup: {new Date(systemConfig.lastBackup).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f8fafc;

  .loading {
    text-align: center;
    padding: 40px;
    font-size: 18px;
    color: #6b7280;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .header-controls {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 16px;
  }

  .tab-controls {
    display: flex;
    gap: 8px;
  }

  .tab-btn {
    padding: 8px 16px;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tab-btn:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }

  .tab-btn.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .welcome-section h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .welcome-section p {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }

  .date-info {
    font-size: 14px;
    color: #6b7280;
    background: #f3f4f6;
    padding: 8px 16px;
    border-radius: 8px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .stat-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 16px;
    transition: transform 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
  }

  .stat-icon {
    font-size: 32px;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: #f3f4f6;
  }

  .stat-card.primary .stat-icon {
    background: #dbeafe;
  }

  .stat-card.success .stat-icon {
    background: #d1fae5;
  }

  .stat-card.warning .stat-icon {
    background: #fef3c7;
  }

  .stat-card.info .stat-icon {
    background: #e0e7ff;
  }

  .stat-card.danger .stat-icon {
    background: #fee2e2;
  }

  .stat-card.system .stat-icon {
    background: #f3f4f6;
  }

  .stat-number {
    font-size: 32px;
    font-weight: 700;
    color: #1f2937;
    line-height: 1;
  }

  .stat-label {
    font-size: 14px;
    color: #6b7280;
    margin: 4px 0;
  }

  .stat-detail {
    font-size: 12px;
    color: #9ca3af;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
    margin-bottom: 32px;
  }

  .quick-actions, .system-overview {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .quick-actions h2, .system-overview h2 {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 20px 0;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .action-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
  }

  .action-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .action-button {
    background: white;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    font: inherit;
  }

  .action-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: white;
  }

  .action-content h3 {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .action-content p {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
  }

  .action-arrow {
    margin-left: auto;
    color: #9ca3af;
    font-size: 16px;
  }

  .overview-items {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .overview-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .overview-item:last-child {
    border-bottom: none;
  }

  .overview-label {
    font-size: 14px;
    color: #6b7280;
  }

  .overview-value {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .value-number {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .value-total {
    font-size: 14px;
    color: #9ca3af;
  }

  .status-indicator {
    font-size: 12px;
  }

  .status-indicator.active {
    color: #10b981;
  }

  .management-links {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .management-links h2 {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 20px 0;
  }

  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  }

  .management-link {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
  }

  .management-link:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .link-icon {
    font-size: 24px;
    width: 48px;
    height: 48px;
    background: #f3f4f6;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .link-content h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .link-content p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    line-height: 1.4;
  }

  .audit-logs, .system-config {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .audit-header, .config-header {
    margin-bottom: 24px;
  }

  .audit-header h2, .config-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .audit-header p, .config-header p {
    color: #6b7280;
    margin: 0;
  }

  .audit-table {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }

  .table-header {
    display: grid;
    grid-template-columns: 200px 150px 150px 1fr;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  .header-cell {
    padding: 12px 16px;
    font-weight: 600;
    color: #374151;
    font-size: 14px;
  }

  .table-row {
    display: grid;
    grid-template-columns: 200px 150px 150px 1fr;
    border-bottom: 1px solid #f3f4f6;
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .table-cell {
    padding: 12px 16px;
    font-size: 14px;
    color: #374151;
    display: flex;
    align-items: center;
  }

  .table-cell.details {
    color: #6b7280;
    font-size: 13px;
  }

  .user-badge {
    background: #dbeafe;
    color: #1e40af;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .action-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .action-badge.user-created {
    background: #d1fae5;
    color: #065f46;
  }

  .action-badge.lead-assigned {
    background: #fef3c7;
    color: #92400e;
  }

  .action-badge.task-created {
    background: #e0e7ff;
    color: #3730a3;
  }

  .action-badge.user-login {
    background: #f3f4f6;
    color: #374151;
  }

  .action-badge.system-config {
    background: #fee2e2;
    color: #991b1b;
  }

  .config-sections {
    display: grid;
    gap: 24px;
  }

  .config-section {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
  }

  .config-section h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 16px 0;
  }

  .config-item {
    margin-bottom: 12px;
  }

  .config-item label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #374151;
    cursor: pointer;
  }

  .config-item input[type="checkbox"] {
    width: 16px;
    height: 16px;
  }

  .config-item input[type="number"] {
    padding: 6px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
    width: 80px;
    margin-left: 8px;
  }

  .config-item span {
    font-size: 14px;
    color: #6b7280;
  }

  @media (max-width: 768px) {
    padding: 16px;

    .dashboard-header {
      flex-direction: column;
      gap: 16px;
    }

    .header-controls {
      align-items: stretch;
    }

    .tab-controls {
      justify-content: center;
    }

    .content-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .actions-grid {
      grid-template-columns: 1fr;
    }

    .links-grid {
      grid-template-columns: 1fr;
    }

    .table-header, .table-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .header-cell, .table-cell {
      padding: 8px 12px;
    }

    .table-header {
      display: none;
    }

    .table-cell::before {
      content: attr(data-label);
      font-weight: 600;
      margin-right: 8px;
    }
  }
`;

export default SuperAdminDashboard;