'use client'

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';

interface DashboardStats {
  teamMembers: number;
  teamLeads: number;
  teamTasks: number;
  teamDeals: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  leadsThisMonth: number;
  dealsClosedThisMonth: number;
  teamRevenue: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  leadsAssigned: number;
  tasksCompleted: number;
  performance: number;
  status: 'active' | 'inactive';
}

interface TeamKPI {
  metric: string;
  current: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

const SalesManagerDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    teamMembers: 0,
    teamLeads: 0,
    teamTasks: 0,
    teamDeals: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    leadsThisMonth: 0,
    dealsClosedThisMonth: 0,
    teamRevenue: 0
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamKPIs, setTeamKPIs] = useState<TeamKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'analytics'>('overview');

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardStats();
    fetchTeamData();
    fetchKPIData();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch team data - only records owned by team members
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

      // Filter to only show team members (Sales Executives under this manager)
      const teamMembers = users.filter((u: any) => 
        u.role === 'sales_executive' && u.manager_id === user?.id
      );
      const teamMemberIds = teamMembers.map((m: any) => m.id);
      
      // Filter leads and tasks to only show team data
      const teamLeads = leads.filter((l: any) => 
        teamMemberIds.includes(l.assigned_to) || l.created_by === user?.id
      );
      const teamTasks = tasks.filter((t: any) => 
        teamMemberIds.includes(t.assigned_to) || t.created_by === user?.id
      );

      const today = new Date();
      const thisMonth = today.getMonth();
      const thisYear = today.getFullYear();

      const overdueTasks = teamTasks.filter((t: any) => 
        t.due_date && new Date(t.due_date) < today && t.status !== 'completed'
      );
      
      const leadsThisMonth = teamLeads.filter((l: any) => {
        const createdDate = new Date(l.created_at);
        return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
      });

      const dealsClosedThisMonth = teamLeads.filter((l: any) => {
        const closedDate = l.closed_at ? new Date(l.closed_at) : null;
        return closedDate && 
               closedDate.getMonth() === thisMonth && 
               closedDate.getFullYear() === thisYear &&
               l.status === 'closed_won';
      });

      // Mock revenue calculation
      const teamRevenue = dealsClosedThisMonth.reduce((sum: number, deal: any) => 
        sum + (deal.value || 0), 0
      );

      setStats({
        teamMembers: teamMembers.length,
        teamLeads: teamLeads.length,
        teamTasks: teamTasks.length,
        teamDeals: teamLeads.filter((l: any) => l.status === 'qualified').length,
        completedTasks: teamTasks.filter((t: any) => t.status === 'completed').length,
        pendingTasks: teamTasks.filter((t: any) => t.status === 'pending').length,
        overdueTasks: overdueTasks.length,
        leadsThisMonth: leadsThisMonth.length,
        dealsClosedThisMonth: dealsClosedThisMonth.length,
        teamRevenue
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamData = async () => {
    // Mock team member data - in real app, this would fetch from API
    const mockTeamMembers: TeamMember[] = [
      {
        id: '1',
        name: 'John Smith',
        role: 'Sales Executive',
        leadsAssigned: 15,
        tasksCompleted: 8,
        performance: 85,
        status: 'active'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        role: 'Sales Executive',
        leadsAssigned: 12,
        tasksCompleted: 10,
        performance: 92,
        status: 'active'
      },
      {
        id: '3',
        name: 'Mike Davis',
        role: 'Sales Executive',
        leadsAssigned: 18,
        tasksCompleted: 6,
        performance: 78,
        status: 'active'
      }
    ];
    setTeamMembers(mockTeamMembers);
  };

  const fetchKPIData = async () => {
    // Mock KPI data
    const mockKPIs: TeamKPI[] = [
      {
        metric: 'Lead Conversion Rate',
        current: 23,
        target: 25,
        trend: 'up',
        percentage: 92
      },
      {
        metric: 'Average Deal Size',
        current: 15000,
        target: 18000,
        trend: 'stable',
        percentage: 83
      },
      {
        metric: 'Tasks Completion Rate',
        current: 87,
        target: 90,
        trend: 'up',
        percentage: 97
      },
      {
        metric: 'Team Productivity',
        current: 78,
        target: 80,
        trend: 'down',
        percentage: 98
      }
    ];
    setTeamKPIs(mockKPIs);
  };

  const quickActions = [
    {
      title: 'Assign Lead',
      description: 'Assign leads to team members',
      icon: '🎯',
      link: '/dashboard/leads',
      color: '#10b981'
    },
    {
      title: 'Create Task',
      description: 'Assign tasks to team',
      icon: '📋',
      link: '/dashboard/tasks',
      color: '#8b5cf6'
    },
    {
      title: 'Team Performance',
      description: 'View team analytics',
      icon: '📊',
      link: '#',
      color: '#3b82f6',
      onClick: () => setActiveTab('analytics')
    },
    {
      title: 'Team Management',
      description: 'Manage team members',
      icon: '👥',
      link: '#',
      color: '#f59e0b',
      onClick: () => setActiveTab('team')
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
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Sales Manager Dashboard</h1>
          <p>Welcome back, {user?.full_name || 'Sales Manager'}! Monitor your team's performance and guide them to success.</p>
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
              className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
              onClick={() => setActiveTab('team')}
            >
              Team
            </button>
            <button 
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
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
                <div className="stat-detail">Sales Executives</div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-number">{stats.teamLeads}</div>
                <div className="stat-label">Team Leads</div>
                <div className="stat-detail">{stats.leadsThisMonth} this month</div>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-number">{stats.teamTasks}</div>
                <div className="stat-label">Team Tasks</div>
                <div className="stat-detail">{stats.pendingTasks} pending</div>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">💼</div>
              <div className="stat-content">
                <div className="stat-number">{stats.teamDeals}</div>
                <div className="stat-label">Active Deals</div>
                <div className="stat-detail">{stats.dealsClosedThisMonth} closed</div>
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

            <div className="stat-card revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-number">${(stats.teamRevenue / 1000).toFixed(0)}K</div>
                <div className="stat-label">Team Revenue</div>
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

            <div className="team-summary">
              <h2>Team Summary</h2>
              <div className="summary-items">
                <div className="summary-item">
                  <div className="summary-label">Completion Rate</div>
                  <div className="summary-value">
                    <span className="value-number">{Math.round((stats.completedTasks / stats.teamTasks) * 100) || 0}%</span>
                  </div>
                </div>
                
                <div className="summary-item">
                  <div className="summary-label">Active Members</div>
                  <div className="summary-value">
                    <span className="value-number">{teamMembers.filter(m => m.status === 'active').length}</span>
                    <span className="value-total">/ {stats.teamMembers}</span>
                  </div>
                </div>
                
                <div className="summary-item">
                  <div className="summary-label">Avg Performance</div>
                  <div className="summary-value">
                    <span className="value-number">
                      {Math.round(teamMembers.reduce((sum, m) => sum + m.performance, 0) / teamMembers.length) || 0}%
                    </span>
                  </div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">Monthly Target</div>
                  <div className="summary-value">
                    <span className="status-indicator active">●</span>
                    <span>On Track</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="management-links">
            <h2>Team Management</h2>
            <div className="links-grid">
              <Link href="/dashboard/leads" className="management-link">
                <div className="link-icon">🎯</div>
                <div className="link-content">
                  <h3>Lead Assignment</h3>
                  <p>Assign leads to Sales Executives in your team and track progress</p>
                </div>
              </Link>
              
              <Link href="/dashboard/tasks" className="management-link">
                <div className="link-icon">📋</div>
                <div className="link-content">
                  <h3>Task Management</h3>
                  <p>Create and assign tasks to team members, monitor completion</p>
                </div>
              </Link>
              
              <div className="management-link" onClick={() => setActiveTab('analytics')}>
                <div className="link-icon">📊</div>
                <div className="link-content">
                  <h3>Team Analytics</h3>
                  <p>View detailed team performance metrics and KPI tracking</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'team' && (
        <div className="team-section">
          <div className="team-header">
            <h2>Team Performance</h2>
            <p>Monitor individual team member performance and workload</p>
          </div>
          
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-card">
                <div className="team-card-header">
                  <div className="member-info">
                    <h3>{member.name}</h3>
                    <p>{member.role}</p>
                  </div>
                  <div className="member-status">
                    <span className={`status-badge ${member.status}`}>
                      {member.status}
                    </span>
                  </div>
                </div>
                
                <div className="member-stats">
                  <div className="stat-item">
                    <span className="stat-label">Leads Assigned</span>
                    <span className="stat-value">{member.leadsAssigned}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Tasks Completed</span>
                    <span className="stat-value">{member.tasksCompleted}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Performance</span>
                    <span className="stat-value">{member.performance}%</span>
                  </div>
                </div>
                
                <div className="performance-bar">
                  <div 
                    className="performance-fill" 
                    style={{ width: `${member.performance}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <div className="analytics-header">
            <h2>Team Analytics & KPIs</h2>
            <p>Track team-wide performance metrics and key performance indicators</p>
          </div>
          
          <div className="kpi-grid">
            {teamKPIs.map((kpi, index) => (
              <div key={index} className="kpi-card">
                <div className="kpi-header">
                  <h3>{kpi.metric}</h3>
                  <div className={`trend-indicator ${kpi.trend}`}>
                    {kpi.trend === 'up' ? '↗️' : kpi.trend === 'down' ? '↘️' : '➡️'}
                  </div>
                </div>
                
                <div className="kpi-values">
                  <div className="current-value">
                    <span className="value-number">
                      {kpi.metric.includes('Rate') || kpi.metric.includes('Productivity') 
                        ? `${kpi.current}%` 
                        : kpi.metric.includes('Size') 
                        ? `$${(kpi.current / 1000).toFixed(0)}K`
                        : kpi.current
                      }
                    </span>
                    <span className="value-label">Current</span>
                  </div>
                  <div className="target-value">
                    <span className="value-number">
                      {kpi.metric.includes('Rate') || kpi.metric.includes('Productivity') 
                        ? `${kpi.target}%` 
                        : kpi.metric.includes('Size') 
                        ? `$${(kpi.target / 1000).toFixed(0)}K`
                        : kpi.target
                      }
                    </span>
                    <span className="value-label">Target</span>
                  </div>
                </div>
                
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${kpi.percentage}%` }}
                  ></div>
                </div>
                
                <div className="progress-text">
                  {kpi.percentage}% of target achieved
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

  .quick-actions, .team-summary {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .quick-actions h2, .team-summary h2 {
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

  .summary-items {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .summary-item:last-child {
    border-bottom: none;
  }

  .summary-label {
    font-size: 14px;
    color: #6b7280;
  }

  .summary-value {
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

  .team-section, .analytics-section {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .team-header, .analytics-header {
    margin-bottom: 24px;
  }

  .team-header h2, .analytics-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .team-header p, .analytics-header p {
    color: #6b7280;
    margin: 0;
  }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .team-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.2s ease;
  }

  .team-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .team-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .member-info h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .member-info p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
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

  .member-stats {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-label {
    font-size: 14px;
    color: #6b7280;
  }

  .stat-value {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
  }

  .performance-bar {
    width: 100%;
    height: 8px;
    background: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
  }

  .performance-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #3b82f6);
    transition: width 0.3s ease;
  }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .kpi-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.2s ease;
  }

  .kpi-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .kpi-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .kpi-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .trend-indicator {
    font-size: 18px;
  }

  .trend-indicator.up {
    color: #10b981;
  }

  .trend-indicator.down {
    color: #ef4444;
  }

  .trend-indicator.stable {
    color: #6b7280;
  }

  .kpi-values {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .current-value, .target-value {
    text-align: center;
  }

  .current-value .value-number {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    display: block;
  }

  .target-value .value-number {
    font-size: 18px;
    font-weight: 600;
    color: #6b7280;
    display: block;
  }

  .value-label {
    font-size: 12px;
    color: #9ca3af;
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

  .progress-text {
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

    .team-grid {
      grid-template-columns: 1fr;
    }

    .kpi-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default SalesManagerDashboard;