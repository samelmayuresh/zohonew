'use client'

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';

interface DashboardStats {
  openTickets: number;
  closedTickets: number;
  pendingTickets: number;
  myTickets: number;
  ticketsToday: number;
  avgResponseTime: number;
  customerSatisfaction: number;
  escalatedTickets: number;
}

interface Ticket {
  id: string;
  title: string;
  customer: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created: string;
  lastUpdate: string;
  assignedTo: string;
}

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  ticketCount: number;
  lastContact: string;
  status: 'active' | 'inactive';
}

const SupportAgentDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    openTickets: 0,
    closedTickets: 0,
    pendingTickets: 0,
    myTickets: 0,
    ticketsToday: 0,
    avgResponseTime: 0,
    customerSatisfaction: 0,
    escalatedTickets: 0
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'customers'>('overview');

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardStats();
    fetchTickets();
    fetchCustomers();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Mock support ticket data - in real app, this would fetch from API
      const mockStats: DashboardStats = {
        openTickets: 23,
        closedTickets: 156,
        pendingTickets: 8,
        myTickets: 12,
        ticketsToday: 5,
        avgResponseTime: 2.5,
        customerSatisfaction: 4.2,
        escalatedTickets: 3
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    // Mock ticket data
    const mockTickets: Ticket[] = [
      {
        id: 'TK-001',
        title: 'Login issues with mobile app',
        customer: 'John Smith',
        status: 'open',
        priority: 'high',
        created: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        lastUpdate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        assignedTo: user?.id || 'current-user'
      },
      {
        id: 'TK-002',
        title: 'Payment processing error',
        customer: 'Sarah Johnson',
        status: 'pending',
        priority: 'urgent',
        created: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        lastUpdate: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        assignedTo: user?.id || 'current-user'
      },
      {
        id: 'TK-003',
        title: 'Feature request - export functionality',
        customer: 'Mike Davis',
        status: 'open',
        priority: 'medium',
        created: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        assignedTo: user?.id || 'current-user'
      },
      {
        id: 'TK-004',
        title: 'Account setup assistance needed',
        customer: 'Lisa Wilson',
        status: 'resolved',
        priority: 'low',
        created: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        assignedTo: user?.id || 'current-user'
      },
      {
        id: 'TK-005',
        title: 'Data synchronization problem',
        customer: 'Robert Brown',
        status: 'open',
        priority: 'high',
        created: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        assignedTo: user?.id || 'current-user'
      }
    ];
    setTickets(mockTickets);
  };

  const fetchCustomers = async () => {
    // Mock customer data
    const mockCustomers: CustomerProfile[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@company.com',
        phone: '+1 (555) 123-4567',
        company: 'Tech Solutions Inc',
        ticketCount: 3,
        lastContact: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        status: 'active'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.j@business.com',
        phone: '+1 (555) 987-6543',
        company: 'Business Corp',
        ticketCount: 1,
        lastContact: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        status: 'active'
      },
      {
        id: '3',
        name: 'Mike Davis',
        email: 'mike.davis@startup.io',
        phone: '+1 (555) 456-7890',
        company: 'Startup Innovations',
        ticketCount: 2,
        lastContact: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        status: 'active'
      },
      {
        id: '4',
        name: 'Lisa Wilson',
        email: 'lisa.wilson@enterprise.com',
        phone: '+1 (555) 321-0987',
        company: 'Enterprise Solutions',
        ticketCount: 1,
        lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        status: 'inactive'
      }
    ];
    setCustomers(mockCustomers);
  };

  const quickActions = [
    {
      title: 'Create Ticket',
      description: 'Create new support ticket',
      icon: '🎫',
      link: '#',
      color: '#10b981'
    },
    {
      title: 'My Queue',
      description: 'View assigned tickets',
      icon: '📋',
      link: '#',
      color: '#3b82f6',
      onClick: () => setActiveTab('tickets')
    },
    {
      title: 'Customer Profiles',
      description: 'View customer information',
      icon: '👥',
      link: '#',
      color: '#8b5cf6',
      onClick: () => setActiveTab('customers')
    },
    {
      title: 'Knowledge Base',
      description: 'Access support resources',
      icon: '📚',
      link: '#',
      color: '#f59e0b'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
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
          <h1>Support Agent Dashboard</h1>
          <p>Welcome back, {user?.full_name || 'Support Agent'}! Help customers and resolve their issues efficiently.</p>
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
              className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              Ticket Queue
            </button>
            <button 
              className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              Customers
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">🎫</div>
              <div className="stat-content">
                <div className="stat-number">{stats.openTickets}</div>
                <div className="stat-label">Open Tickets</div>
                <div className="stat-detail">System-wide</div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-number">{stats.myTickets}</div>
                <div className="stat-label">My Tickets</div>
                <div className="stat-detail">Assigned to me</div>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <div className="stat-number">{stats.pendingTickets}</div>
                <div className="stat-label">Pending</div>
                <div className="stat-detail">Awaiting response</div>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-number">{stats.closedTickets}</div>
                <div className="stat-label">Resolved</div>
                <div className="stat-detail">This month</div>
              </div>
            </div>

            <div className="stat-card danger">
              <div className="stat-icon">🚨</div>
              <div className="stat-content">
                <div className="stat-number">{stats.escalatedTickets}</div>
                <div className="stat-label">Escalated</div>
                <div className="stat-detail">Need attention</div>
              </div>
            </div>

            <div className="stat-card performance">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <div className="stat-number">{stats.customerSatisfaction}</div>
                <div className="stat-label">Satisfaction</div>
                <div className="stat-detail">Average rating</div>
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
              <h2>Performance Metrics</h2>
              <div className="metrics-list">
                <div className="metric-item">
                  <div className="metric-label">Avg Response Time</div>
                  <div className="metric-value">
                    <span className="value-number">{stats.avgResponseTime}h</span>
                  </div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">Tickets Today</div>
                  <div className="metric-value">
                    <span className="value-number">{stats.ticketsToday}</span>
                  </div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">Resolution Rate</div>
                  <div className="metric-value">
                    <span className="value-number">
                      {Math.round((stats.closedTickets / (stats.closedTickets + stats.openTickets)) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-label">Customer Rating</div>
                  <div className="metric-value">
                    <span className="status-indicator active">⭐</span>
                    <span>{stats.customerSatisfaction}/5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="management-links">
            <h2>Support Tools</h2>
            <div className="links-grid">
              <div className="management-link" onClick={() => setActiveTab('tickets')}>
                <div className="link-icon">🎫</div>
                <div className="link-content">
                  <h3>Ticket Management</h3>
                  <p>View, update, and manage support tickets with status tracking and notes</p>
                </div>
              </div>
              
              <div className="management-link" onClick={() => setActiveTab('customers')}>
                <div className="link-icon">👥</div>
                <div className="link-content">
                  <h3>Customer Profiles</h3>
                  <p>Access customer information, interaction history, and support-related data</p>
                </div>
              </div>
              
              <div className="management-link">
                <div className="link-icon">💬</div>
                <div className="link-content">
                  <h3>Sales Coordination</h3>
                  <p>Communicate with sales team and share customer notes and insights</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'tickets' && (
        <div className="tickets-section">
          <div className="tickets-header">
            <h2>Support Ticket Queue</h2>
            <p>Manage customer support tickets with status updates, notes, and follow-ups</p>
          </div>
          
          <div className="tickets-list">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <div className="ticket-info">
                    <h3>{ticket.title}</h3>
                    <p className="ticket-id">#{ticket.id}</p>
                  </div>
                  <div className="ticket-badges">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                    >
                      {ticket.priority}
                    </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(ticket.status) }}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </div>
                
                <div className="ticket-details">
                  <div className="detail-item">
                    <span className="detail-label">Customer:</span>
                    <span className="detail-value">{ticket.customer}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">
                      {new Date(ticket.created).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Update:</span>
                    <span className="detail-value">
                      {new Date(ticket.lastUpdate).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="ticket-actions">
                  <button className="action-btn primary">View Details</button>
                  <button className="action-btn secondary">Update Status</button>
                  <button className="action-btn tertiary">Add Note</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="customers-section">
          <div className="customers-header">
            <h2>Customer Profiles</h2>
            <p>View customer information and interaction history for support purposes</p>
          </div>
          
          <div className="customers-grid">
            {customers.map((customer) => (
              <div key={customer.id} className="customer-card">
                <div className="customer-header">
                  <div className="customer-info">
                    <h3>{customer.name}</h3>
                    <p className="customer-company">{customer.company}</p>
                  </div>
                  <div className="customer-status">
                    <span className={`status-badge ${customer.status}`}>
                      {customer.status}
                    </span>
                  </div>
                </div>
                
                <div className="customer-contact">
                  <div className="contact-item">
                    <span className="contact-icon">📧</span>
                    <span className="contact-value">{customer.email}</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <span className="contact-value">{customer.phone}</span>
                  </div>
                </div>
                
                <div className="customer-stats">
                  <div className="stat-item">
                    <span className="stat-label">Tickets</span>
                    <span className="stat-value">{customer.ticketCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Last Contact</span>
                    <span className="stat-value">
                      {new Date(customer.lastContact).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="customer-actions">
                  <button className="action-btn primary">View History</button>
                  <button className="action-btn secondary">Create Ticket</button>
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

  .stat-card.performance .stat-icon {
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

  .metrics-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .metric-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .metric-item:last-child {
    border-bottom: none;
  }

  .metric-label {
    font-size: 14px;
    color: #6b7280;
  }

  .metric-value {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .value-number {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
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

  .tickets-section, .customers-section {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .tickets-header, .customers-header {
    margin-bottom: 24px;
  }

  .tickets-header h2, .customers-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .tickets-header p, .customers-header p {
    color: #6b7280;
    margin: 0;
  }

  .tickets-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ticket-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.2s ease;
  }

  .ticket-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .ticket-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .ticket-info h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .ticket-id {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  .ticket-badges {
    display: flex;
    gap: 8px;
  }

  .priority-badge, .status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    color: white;
    text-transform: capitalize;
  }

  .ticket-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .detail-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
  }

  .detail-value {
    font-size: 14px;
    color: #1f2937;
  }

  .ticket-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .action-btn {
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn.primary {
    background: #3b82f6;
    color: white;
    border: 1px solid #3b82f6;
  }

  .action-btn.primary:hover {
    background: #2563eb;
  }

  .action-btn.secondary {
    background: white;
    color: #3b82f6;
    border: 1px solid #3b82f6;
  }

  .action-btn.secondary:hover {
    background: #f8fafc;
  }

  .action-btn.tertiary {
    background: white;
    color: #6b7280;
    border: 1px solid #d1d5db;
  }

  .action-btn.tertiary:hover {
    background: #f9fafb;
  }

  .customers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
  }

  .customer-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.2s ease;
  }

  .customer-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .customer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .customer-info h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .customer-company {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  .status-badge.active {
    background: #d1fae5;
    color: #065f46;
  }

  .status-badge.inactive {
    background: #fee2e2;
    color: #991b1b;
  }

  .customer-contact {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .contact-icon {
    font-size: 14px;
    width: 20px;
  }

  .contact-value {
    font-size: 14px;
    color: #374151;
  }

  .customer-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 12px 0;
    border-top: 1px solid #f3f4f6;
    border-bottom: 1px solid #f3f4f6;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .stat-label {
    font-size: 12px;
    color: #6b7280;
  }

  .stat-value {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
  }

  .customer-actions {
    display: flex;
    gap: 8px;
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

    .customers-grid {
      grid-template-columns: 1fr;
    }

    .ticket-details {
      grid-template-columns: 1fr;
    }
  }
`;

export default SupportAgentDashboard;