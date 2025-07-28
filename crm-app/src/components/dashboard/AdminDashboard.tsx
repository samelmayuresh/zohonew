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
  teamMembers: number;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
  lastRun: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  type: string;
  isActive: boolean;
}

const AdminDashboard: React.FC = () => {
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
    teamMembers: 0
  });
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'automation' | 'reports'>('overview');
  const [showBillingDenied, setShowBillingDenied] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardStats();
    fetchAutomationData();
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
      
      // Filter out super admins for team member count
      const teamMembers = users.filter((u: any) => u.role !== 'super_admin');

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
        teamMembers: teamMembers.length
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAutomationData = async () => {
    // Mock automation rules and email templates
    const mockRules: AutomationRule[] = [
      {
        id: '1',
        name: 'New Lead Assignment',
        trigger: 'Lead Created',
        action: 'Assign to Sales Manager',
        isActive: true,
        lastRun: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: '2',
        name: 'Task Reminder',
        trigger: 'Task Due in 24 hours',
        action: 'Send Email Reminder',
        isActive: true,
        lastRun: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: '3',
        name: 'Welcome Email',
        trigger: 'User Created',
        action: 'Send Welcome Email',
        isActive: false,
        lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      }
    ];

    const mockTemplates: EmailTemplate[] = [
      {
        id: '1',
        name: 'User Welcome',
        subject: 'Welcome to CRM System',
        type: 'User Onboarding',
        isActive: true
      },
      {
        id: '2',
        name: 'Task Assignment',
        subject: 'New Task Assigned: {{task_title}}',
        type: 'Task Management',
        isActive: true
      },
      {
        id: '3',
        name: 'Lead Follow-up',
        subject: 'Follow up with {{lead_name}}',
        type: 'Lead Management',
        isActive: true
      }
    ];

    setAutomationRules(mockRules);
    setEmailTemplates(mockTemplates);
  };

  const handleBillingAccess = () => {
    setShowBillingDenied(true);
    setTimeout(() => setShowBillingDenied(false), 3000);
  };

  const toggleAutomationRule = (ruleId: string) => {
    setAutomationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const quickActions = [
    {
      title: 'Team Management',
      description: 'Manage team members and roles',
      icon: '👥',
      link: '/dashboard/users',
      color: '#3b82f6'
    },
    {
      title: 'Lead Overview',
      description: 'View all leads and assignments',
      icon: '🎯',
      link: '/dashboard/leads',
      color: '#10b981'
    },
    {
      title: 'Task Management',
      description: 'Monitor team tasks',
      icon: '📋',
      link: '/dashboard/tasks',
      color: '#8b5cf6'
    },
    {
      title: 'Automation Setup',
      description: 'Configure workflows',
      icon: '⚙️',
      link: '#',
      color: '#f59e0b',
      onClick: () => setActiveTab('automation')
    },
    {
      title: 'Reports & Analytics',
      description: 'View system reports',
      icon: '📊',
      link: '#',
      color: '#8b5cf6',
      onClick: () => setActiveTab('reports')
    },
    {
      title: 'Billing (Restricted)',
      description: 'Access denied for Admin role',
      icon: '💳',
      link: '#',
      color: '#ef4444',
      onClick: handleBillingAccess,
      disabled: true
    }
  ];

  if (loading) {
    return (
      <StyledWrapper>
        <div className="loading">Loading dashboard...</div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      {showBillingDenied && (
        <div className="access-denied-banner">
          <div className="banner-content">
            <span className="banner-icon">🚫</span>
            <span>Access Denied: Billing features are restricted for Admin role</span>
          </div>
        </div>
      )}

      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.full_name || 'Admin'}! Manage your team and system operations.</p>
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
              className={`tab-btn ${activeTab === 'automation' ? 'active' : ''}`}
              onClick={() => setActiveTab('automation')}
            >
              Automation
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              Reports
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
                <div className="stat-number">{stats.teamMembers}</div>
                <div className="stat-label">Team Members</div>
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

            <div className="stat-card automation">
              <div className="stat-icon">🤖</div>
              <div className="stat-content">
                <div className="stat-number">{automationRules.filter(r => r.isActive).length}</div>
                <div className="stat-label">Active Rules</div>
                <div className="stat-detail">{automationRules.length} total</div>
              </div>
            </div>
          </div>

          <div className="content-grid">
            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                {quickActions.map((action, index) => (
                  action.onClick ? (
                    <button 
                      key={index} 
                      onClick={action.onClick} 
                      className={`action-card action-button ${action.disabled ? 'disabled' : ''}`}
                      disabled={action.disabled}
                    >
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

            <div className="team-overview">
              <h2>Team Overview</h2>
              <div className="overview-items">
                <div className="overview-item">
                  <div className="overview-label">Team Members</div>
                  <div className="overview-value">
                    <span className="value-number">{stats.teamMembers}</span>
                    <span className="value-total">managed</span>
                  </div>
                </div>
                
                <div className="overview-item">
                  <div className="overview-label">Active Users</div>
                  <div className="overview-value">
                    <span className="value-number">{stats.activeUsers}</span>
                    <span className="value-total">/ {stats.totalUsers}</span>
                  </div>
                </div>
                
                <div className="overview-item">
                  <div className="overview-label">Task Completion</div>
                  <div className="overview-value">
                    <span className="value-number">{Math.round((stats.completedTasks / stats.totalTasks) * 100) || 0}%</span>
                    <span className="value-total">rate</span>
                  </div>
                </div>

                <div className="overview-item">
                  <div className="overview-label">Automation Rules</div>
                  <div className="overview-value">
                    <span className="status-indicator active">●</span>
                    <span>{automationRules.filter(r => r.isActive).length} active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="management-links">
            <h2>Management Areas</h2>
            <div className="links-grid">
              <Link href="/dashboard/users" className="management-link">
                <div className="link-icon">👥</div>
                <div className="link-content">
                  <h3>Team Management</h3>
                  <p>Manage team members, assign roles (excluding Super Admin), and monitor user activity</p>
                </div>
              </Link>
              
              <Link href="/dashboard/leads" className="management-link">
                <div className="link-icon">🎯</div>
                <div className="link-content">
                  <h3>Lead Management</h3>
                  <p>Oversee lead distribution, track conversions, and manage sales pipeline</p>
                </div>
              </Link>
              
              <Link href="/dashboard/tasks" className="management-link">
                <div className="link-icon">📋</div>
                <div className="link-content">
                  <h3>Task Management</h3>
                  <p>Monitor team tasks, track progress, and ensure timely completion</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}

      {activeTab === 'automation' && (
        <div className="automation-section">
          <div className="automation-header">
            <h2>Workflow Automation</h2>
            <p>Configure automated workflows and email templates to streamline operations</p>
          </div>
          
          <div className="automation-content">
            <div className="automation-rules">
              <h3>Automation Rules</h3>
              <div className="rules-list">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="rule-card">
                    <div className="rule-header">
                      <div className="rule-info">
                        <h4>{rule.name}</h4>
                        <p>{rule.trigger} → {rule.action}</p>
                      </div>
                      <div className="rule-controls">
                        <span className={`status-badge ${rule.isActive ? 'active' : 'inactive'}`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button 
                          onClick={() => toggleAutomationRule(rule.id)}
                          className={`toggle-btn ${rule.isActive ? 'active' : ''}`}
                        >
                          {rule.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                    <div className="rule-footer">
                      <span className="last-run">
                        Last run: {new Date(rule.lastRun).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="email-templates">
              <h3>Email Templates</h3>
              <div className="templates-list">
                {emailTemplates.map((template) => (
                  <div key={template.id} className="template-card">
                    <div className="template-header">
                      <div className="template-info">
                        <h4>{template.name}</h4>
                        <p className="template-subject">{template.subject}</p>
                        <span className="template-type">{template.type}</span>
                      </div>
                      <div className="template-status">
                        <span className={`status-badge ${template.isActive ? 'active' : 'inactive'}`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="reports-section">
          <div className="reports-header">
            <h2>Reports & Analytics</h2>
            <p>Access comprehensive reports and dashboards for all users and system activities</p>
          </div>
          
          <div className="reports-grid">
            <div className="report-card">
              <div className="report-icon">📊</div>
              <div className="report-content">
                <h3>User Activity Report</h3>
                <p>Track user login patterns, activity levels, and engagement metrics</p>
                <div className="report-stats">
                  <span>Active Users: {stats.activeUsers}</span>
                  <span>Total Sessions: 247</span>
                </div>
              </div>
            </div>

            <div className="report-card">
              <div className="report-icon">🎯</div>
              <div className="report-content">
                <h3>Lead Performance</h3>
                <p>Analyze lead conversion rates, sources, and assignment effectiveness</p>
                <div className="report-stats">
                  <span>Conversion Rate: 23%</span>
                  <span>New Leads: {stats.newLeadsToday}</span>
                </div>
              </div>
            </div>

            <div className="report-card">
              <div className="report-icon">📋</div>
              <div className="report-content">
                <h3>Task Completion</h3>
                <p>Monitor task completion rates, overdue items, and team productivity</p>
                <div className="report-stats">
                  <span>Completion Rate: {Math.round((stats.completedTasks / stats.totalTasks) * 100) || 0}%</span>
                  <span>Overdue: {stats.overdueTasks}</span>
                </div>
              </div>
            </div>

            <div className="report-card">
              <div className="report-icon">🤖</div>
              <div className="report-content">
                <h3>Automation Performance</h3>
                <p>Review automation rule effectiveness and email delivery rates</p>
                <div className="report-stats">
                  <span>Active Rules: {automationRules.filter(r => r.isActive).length}</span>
                  <span>Success Rate: 98%</span>
                </div>
              </div>
            </div>

            <div className="report-card">
              <div className="report-icon">👥</div>
              <div className="report-content">
                <h3>Team Performance</h3>
                <p>Evaluate team productivity, workload distribution, and performance metrics</p>
                <div className="report-stats">
                  <span>Team Size: {stats.teamMembers}</span>
                  <span>Avg Tasks/User: {Math.round(stats.totalTasks / stats.teamMembers) || 0}</span>
                </div>
              </div>
            </div>

            <div className="report-card">
              <div className="report-icon">📈</div>
              <div className="report-content">
                <h3>System Analytics</h3>
                <p>Overall system usage, growth trends, and operational insights</p>
                <div className="report-stats">
                  <span>Daily Active: {stats.activeUsers}</span>
                  <span>Growth: +12%</span>
                </div>
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

  .access-denied-banner {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
  }

  .banner-content {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #991b1b;
    font-weight: 500;
  }

  .banner-icon {
    font-size: 18px;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
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

  .stat-card.automation .stat-icon {
    background: #fef3c7;
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

  .quick-actions, .team-overview {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .quick-actions h2, .team-overview h2 {
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

  .action-card:hover:not(.disabled) {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .action-button {
    background: white;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    font: inherit;
  }

  .action-button.disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

  .automation-section, .reports-section {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .automation-header, .reports-header {
    margin-bottom: 24px;
  }

  .automation-header h2, .reports-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .automation-header p, .reports-header p {
    color: #6b7280;
    margin: 0;
  }

  .automation-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .automation-rules h3, .email-templates h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 16px 0;
  }

  .rules-list, .templates-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .rule-card, .template-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    transition: all 0.2s ease;
  }

  .rule-card:hover, .template-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  }

  .rule-header, .template-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }

  .rule-info h4, .template-info h4 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .rule-info p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  .template-subject {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 4px 0;
  }

  .template-type {
    font-size: 12px;
    background: #f3f4f6;
    color: #374151;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .rule-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .status-badge.active {
    background: #d1fae5;
    color: #065f46;
  }

  .status-badge.inactive {
    background: #fee2e2;
    color: #991b1b;
  }

  .toggle-btn {
    padding: 4px 12px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toggle-btn:hover {
    border-color: #3b82f6;
  }

  .toggle-btn.active {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
  }

  .rule-footer {
    font-size: 12px;
    color: #9ca3af;
  }

  .reports-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .report-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.2s ease;
  }

  .report-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .report-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .report-content h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .report-content p {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 12px 0;
    line-height: 1.4;
  }

  .report-stats {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .report-stats span {
    font-size: 12px;
    color: #9ca3af;
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

    .automation-content {
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

    .reports-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default AdminDashboard;