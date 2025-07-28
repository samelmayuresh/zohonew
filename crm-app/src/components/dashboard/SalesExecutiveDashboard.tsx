'use client'

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';

interface DashboardStats {
  myLeads: number;
  myTasks: number;
  myDeals: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  leadsThisWeek: number;
  dealsClosedThisMonth: number;
  myRevenue: number;
  callsToday: number;
  emailsSent: number;
  meetingsScheduled: number;
}

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  description: string;
  timestamp: string;
  leadName?: string;
  status: 'completed' | 'scheduled' | 'pending';
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  period: string;
  type: 'leads' | 'deals' | 'revenue' | 'calls';
}

const SalesExecutiveDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    myLeads: 0,
    myTasks: 0,
    myDeals: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    leadsThisWeek: 0,
    dealsClosedThisMonth: 0,
    myRevenue: 0,
    callsToday: 0,
    emailsSent: 0,
    meetingsScheduled: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'goals'>('overview');

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardStats();
    fetchActivities();
    fetchGoals();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch only user's assigned data
      const [leadsRes, tasksRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/leads/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/tasks/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [leads, tasks] = await Promise.all([
        leadsRes.ok ? leadsRes.json() : [],
        tasksRes.ok ? tasksRes.json() : []
      ]);

      // Filter to only show user's assigned data
      const myLeads = leads.filter((l: any) => l.assigned_to === user?.id);
      const myTasks = tasks.filter((t: any) => t.assigned_to === user?.id);

      const today = new Date();
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = today.getMonth();
      const thisYear = today.getFullYear();

      const overdueTasks = myTasks.filter((t: any) => 
        t.due_date && new Date(t.due_date) < today && t.status !== 'completed'
      );
      
      const leadsThisWeek = myLeads.filter((l: any) => {
        const createdDate = new Date(l.created_at);
        return createdDate >= thisWeek;
      });

      const dealsClosedThisMonth = myLeads.filter((l: any) => {
        const closedDate = l.closed_at ? new Date(l.closed_at) : null;
        return closedDate && 
               closedDate.getMonth() === thisMonth && 
               closedDate.getFullYear() === thisYear &&
               l.status === 'closed_won';
      });

      // Mock activity stats
      const myRevenue = dealsClosedThisMonth.reduce((sum: number, deal: any) => 
        sum + (deal.value || 0), 0
      );

      setStats({
        myLeads: myLeads.length,
        myTasks: myTasks.length,
        myDeals: myLeads.filter((l: any) => l.status === 'qualified').length,
        completedTasks: myTasks.filter((t: any) => t.status === 'completed').length,
        pendingTasks: myTasks.filter((t: any) => t.status === 'pending').length,
        overdueTasks: overdueTasks.length,
        leadsThisWeek: leadsThisWeek.length,
        dealsClosedThisMonth: dealsClosedThisMonth.length,
        myRevenue,
        callsToday: Math.floor(Math.random() * 8) + 2,
        emailsSent: Math.floor(Math.random() * 15) + 5,
        meetingsScheduled: Math.floor(Math.random() * 4) + 1
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    // Mock activity data
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'call',
        description: 'Follow-up call with ABC Corp',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        leadName: 'ABC Corp',
        status: 'completed'
      },
      {
        id: '2',
        type: 'email',
        description: 'Sent proposal to XYZ Industries',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        leadName: 'XYZ Industries',
        status: 'completed'
      },
      {
        id: '3',
        type: 'meeting',
        description: 'Product demo scheduled',
        timestamp: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
        leadName: 'Tech Solutions Inc',
        status: 'scheduled'
      },
      {
        id: '4',
        type: 'note',
        description: 'Updated lead status and next steps',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        leadName: 'Global Systems',
        status: 'completed'
      },
      {
        id: '5',
        type: 'call',
        description: 'Discovery call with new prospect',
        timestamp: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
        leadName: 'Innovation Labs',
        status: 'scheduled'
      }
    ];
    setActivities(mockActivities);
  };

  const fetchGoals = async () => {
    // Mock goals data
    const mockGoals: Goal[] = [
      {
        id: '1',
        title: 'Monthly Leads',
        target: 20,
        current: 15,
        period: 'This Month',
        type: 'leads'
      },
      {
        id: '2',
        title: 'Deals Closed',
        target: 5,
        current: 3,
        period: 'This Month',
        type: 'deals'
      },
      {
        id: '3',
        title: 'Revenue Target',
        target: 50000,
        current: 32000,
        period: 'This Month',
        type: 'revenue'
      },
      {
        id: '4',
        title: 'Daily Calls',
        target: 10,
        current: 7,
        period: 'Today',
        type: 'calls'
      }
    ];
    setGoals(mockGoals);
  };

  const quickActions = [
    {
      title: 'My Leads',
      description: 'View and manage assigned leads',
      icon: '🎯',
      link: '/dashboard/leads',
      color: '#10b981'
    },
    {
      title: 'My Tasks',
      description: 'Check assigned tasks',
      icon: '📋',
      link: '/dashboard/tasks',
      color: '#8b5cf6'
    },
    {
      title: 'Log Activity',
      description: 'Record calls, meetings, notes',
      icon: '📝',
      link: '#',
      color: '#3b82f6',
      onClick: () => setActiveTab('activities')
    },
    {
      title: 'Email Templates',
      description: 'Use CRM email templates',
      icon: '📧',
      link: '#',
      color: '#f59e0b'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return '📞';
      case 'email': return '📧';
      case 'meeting': return '🤝';
      case 'note': return '📝';
      default: return '📋';
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'scheduled': return '#3b82f6';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
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
          <h1>Sales Executive Dashboard</h1>
          <p>Welcome back, {user?.full_name || 'Sales Executive'}! Focus on your leads and close more deals.</p>
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
              className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
              onClick={() => setActiveTab('activities')}
            >
              Activities
            </button>
            <button 
              className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
              onClick={() => setActiveTab('goals')}
            >
              Goals
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-number">{stats.myLeads}</div>
                <div className="stat-label">My Leads</div>
                <div className="stat-detail">{stats.leadsThisWeek} this week</div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">💼</div>
              <div className="stat-content">
                <div className="stat-number">{stats.myDeals}</div>
                <div className="stat-label">Active Deals</div>
                <div className="stat-detail">{stats.dealsClosedThisMonth} closed</div>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-number">{stats.myTasks}</div>
                <div className="stat-label">My Tasks</div>
                <div className="stat-detail">{stats.pendingTasks} pending</div>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-number">{stats.completedTasks}</div>
                <div className="stat-label">Completed</div>
                <div className="stat-detail">Tasks done</div>
              </div>
            </div>

            <div className="stat-card danger">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <div className="stat-number">{stats.overdueTasks}</div>
                <div className="stat-label">Overdue</div>
                <div className="stat-detail">Need attention</div>
              </div>
            </div>

            <div className="stat-card revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-number">${(stats.myRevenue / 1000).toFixed(0)}K</div>
                <div className="stat-label">My Revenue</div>
                <div className="stat-detail">This month</div>
              </div>
            </div>
          </div>

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

            <div className="performance-summary">
              <h2>Today's Activity</h2>
              <div className="activity-stats">
                <div className="activity-item">
                  <div className="activity-icon">📞</div>
                  <div className="activity-info">
                    <span className="activity-number">{stats.callsToday}</span>
                    <span className="activity-label">Calls Made</span>
                  </div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-icon">📧</div>
                  <div className="activity-info">
                    <span className="activity-number">{stats.emailsSent}</span>
                    <span className="activity-label">Emails Sent</span>
                  </div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-icon">🤝</div>
                  <div className="activity-info">
                    <span className="activity-number">{stats.meetingsScheduled}</span>
                    <span className="activity-label">Meetings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="management-links">
            <h2>My Work Areas</h2>
            <div className="links-grid">
              <Link href="/dashboard/leads" className="management-link">
                <div className="link-icon">🎯</div>
                <div className="link-content">
                  <h3>Lead Management</h3>
                  <p>View and update your assigned leads, track progress and conversions</p>
                </div>
              </Link>
              
              <Link href="/dashboard/tasks" className="management-link">
                <div className="link-icon">📋</div>
                <div className="link-content">
                  <h3>Task Management</h3>
                  <p>Complete assigned tasks, update status and manage your workload</p>
                </div>
              </Link>
              
              <div className="management-link" onClick={() => setActiveTab('activities')}>
                <div className="link-icon">📝</div>
                <div className="link-content">
                  <h3>Activity Logging</h3>
                  <p>Record calls, meetings, notes and track all customer interactions</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'activities' && (
        <div className="activities-section">
          <div className="activities-header">
            <h2>Activity Log</h2>
            <p>Track all your customer interactions, calls, meetings, and notes with timestamps</p>
          </div>
          
          <div className="activities-list">
            {activities.map((activity) => (
              <div key={activity.id} className="activity-card">
                <div className="activity-icon-wrapper">
                  <span className="activity-type-icon">{getActivityIcon(activity.type)}</span>
                </div>
                
                <div className="activity-content">
                  <div className="activity-main">
                    <h4>{activity.description}</h4>
                    {activity.leadName && (
                      <p className="activity-lead">Lead: {activity.leadName}</p>
                    )}
                  </div>
                  
                  <div className="activity-meta">
                    <span className="activity-time">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                    <span 
                      className="activity-status"
                      style={{ color: getActivityColor(activity.status) }}
                    >
                      {activity.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="goals-section">
          <div className="goals-header">
            <h2>Performance Goals</h2>
            <p>Track your personal performance goals and monitor progress towards targets</p>
          </div>
          
          <div className="goals-grid">
            {goals.map((goal) => (
              <div key={goal.id} className="goal-card">
                <div className="goal-header">
                  <h3>{goal.title}</h3>
                  <span className="goal-period">{goal.period}</span>
                </div>
                
                <div className="goal-progress">
                  <div className="goal-numbers">
                    <span className="current-number">
                      {goal.type === 'revenue' 
                        ? `$${(goal.current / 1000).toFixed(0)}K`
                        : goal.current
                      }
                    </span>
                    <span className="target-number">
                      / {goal.type === 'revenue' 
                        ? `$${(goal.target / 1000).toFixed(0)}K`
                        : goal.target
                      }
                    </span>
                  </div>
                  
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="progress-percentage">
                    {Math.round((goal.current / goal.target) * 100)}% Complete
                  </div>
                </div>
              </div>
            ))}
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

  .stat-card.revenue .stat-icon {
    background: #dcfce7;
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

  .quick-actions, .performance-summary {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .quick-actions h2, .performance-summary h2 {
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

  .activity-stats {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .activity-item:last-child {
    border-bottom: none;
  }

  .activity-icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    border-radius: 8px;
  }

  .activity-info {
    display: flex;
    flex-direction: column;
  }

  .activity-number {
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
  }

  .activity-label {
    font-size: 12px;
    color: #6b7280;
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
    cursor: pointer;
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

  .activities-section, .goals-section {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .activities-header, .goals-header {
    margin-bottom: 24px;
  }

  .activities-header h2, .goals-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .activities-header p, .goals-header p {
    color: #6b7280;
    margin: 0;
  }

  .activities-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .activity-card {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .activity-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  }

  .activity-icon-wrapper {
    width: 40px;
    height: 40px;
    background: #f3f4f6;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .activity-type-icon {
    font-size: 18px;
  }

  .activity-content {
    flex: 1;
  }

  .activity-main h4 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .activity-lead {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 8px 0;
  }

  .activity-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .activity-time {
    font-size: 12px;
    color: #9ca3af;
  }

  .activity-status {
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
  }

  .goals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .goal-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.2s ease;
  }

  .goal-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .goal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .goal-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .goal-period {
    font-size: 12px;
    color: #6b7280;
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .goal-numbers {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-bottom: 12px;
  }

  .current-number {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
  }

  .target-number {
    font-size: 16px;
    color: #6b7280;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #10b981);
    transition: width 0.3s ease;
  }

  .progress-percentage {
    font-size: 12px;
    color: #6b7280;
    text-align: center;
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

    .goals-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default SalesExecutiveDashboard;