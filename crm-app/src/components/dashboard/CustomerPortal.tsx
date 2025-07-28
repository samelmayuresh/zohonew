'use client'

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';

interface ProjectInfo {
  id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  startDate: string;
  expectedCompletion: string;
  description: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedDate?: string;
}

interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  invoiceNumber: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category: 'contract' | 'report' | 'invoice' | 'other';
}

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created: string;
  lastUpdate: string;
}

const CustomerPortal: React.FC = () => {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'payments' | 'documents' | 'support'>('overview');

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      // Mock customer data - in real app, this would fetch only customer's own data
      const mockProjects: ProjectInfo[] = [
        {
          id: 'PRJ-001',
          name: 'Website Development',
          status: 'in_progress',
          progress: 65,
          startDate: '2024-01-15',
          expectedCompletion: '2024-03-15',
          description: 'Complete website redesign and development with modern UI/UX'
        },
        {
          id: 'PRJ-002',
          name: 'Mobile App Development',
          status: 'planning',
          progress: 15,
          startDate: '2024-02-01',
          expectedCompletion: '2024-06-01',
          description: 'Native mobile application for iOS and Android platforms'
        }
      ];

      const mockMilestones: Milestone[] = [
        {
          id: 'MS-001',
          title: 'Project Kickoff',
          description: 'Initial project setup and requirements gathering',
          dueDate: '2024-01-20',
          status: 'completed',
          completedDate: '2024-01-18'
        },
        {
          id: 'MS-002',
          title: 'Design Phase',
          description: 'UI/UX design and wireframe creation',
          dueDate: '2024-02-10',
          status: 'completed',
          completedDate: '2024-02-08'
        },
        {
          id: 'MS-003',
          title: 'Development Phase 1',
          description: 'Frontend development and basic functionality',
          dueDate: '2024-02-28',
          status: 'in_progress'
        },
        {
          id: 'MS-004',
          title: 'Testing & QA',
          description: 'Quality assurance and bug fixes',
          dueDate: '2024-03-10',
          status: 'pending'
        }
      ];

      const mockPayments: PaymentRecord[] = [
        {
          id: 'PAY-001',
          amount: 5000,
          date: '2024-01-15',
          status: 'paid',
          description: 'Initial project payment (50%)',
          invoiceNumber: 'INV-2024-001'
        },
        {
          id: 'PAY-002',
          amount: 2500,
          date: '2024-02-15',
          status: 'paid',
          description: 'Milestone payment (25%)',
          invoiceNumber: 'INV-2024-002'
        },
        {
          id: 'PAY-003',
          amount: 2500,
          date: '2024-03-15',
          status: 'pending',
          description: 'Final payment (25%)',
          invoiceNumber: 'INV-2024-003'
        }
      ];

      const mockDocuments: Document[] = [
        {
          id: 'DOC-001',
          name: 'Project Contract.pdf',
          type: 'PDF',
          size: '2.3 MB',
          uploadDate: '2024-01-15',
          category: 'contract'
        },
        {
          id: 'DOC-002',
          name: 'Design Mockups.zip',
          type: 'ZIP',
          size: '15.7 MB',
          uploadDate: '2024-02-08',
          category: 'report'
        },
        {
          id: 'DOC-003',
          name: 'Invoice-001.pdf',
          type: 'PDF',
          size: '156 KB',
          uploadDate: '2024-01-15',
          category: 'invoice'
        },
        {
          id: 'DOC-004',
          name: 'Progress Report Q1.pdf',
          type: 'PDF',
          size: '1.2 MB',
          uploadDate: '2024-02-28',
          category: 'report'
        }
      ];

      const mockTickets: SupportTicket[] = [
        {
          id: 'TK-001',
          subject: 'Request for design changes',
          status: 'resolved',
          priority: 'medium',
          created: '2024-02-10',
          lastUpdate: '2024-02-12'
        },
        {
          id: 'TK-002',
          subject: 'Question about mobile app features',
          status: 'open',
          priority: 'low',
          created: '2024-02-20',
          lastUpdate: '2024-02-20'
        }
      ];

      setProjects(mockProjects);
      setMilestones(mockMilestones);
      setPayments(mockPayments);
      setDocuments(mockDocuments);
      setTickets(mockTickets);
    } catch (error) {
      console.error('Failed to fetch customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'paid': case 'resolved': case 'closed': return '#10b981';
      case 'in_progress': case 'open': return '#3b82f6';
      case 'planning': case 'pending': return '#f59e0b';
      case 'on_hold': case 'overdue': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contract': return '📄';
      case 'report': return '📊';
      case 'invoice': return '💰';
      case 'other': return '📁';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <StyledWrapper>
        <div className="loading">Loading portal...</div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <div className="portal-header">
        <div className="welcome-section">
          <h1>Customer Portal</h1>
          <p>Welcome, {user?.full_name || 'Customer'}! Track your projects and access your information.</p>
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
              className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              Projects
            </button>
            <button 
              className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              Payments
            </button>
            <button 
              className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              Documents
            </button>
            <button 
              className={`tab-btn ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => setActiveTab('support')}
            >
              Support
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-number">{projects.length}</div>
                <div className="stat-label">Active Projects</div>
                <div className="stat-detail">In progress</div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-number">{milestones.filter(m => m.status === 'completed').length}</div>
                <div className="stat-label">Completed</div>
                <div className="stat-detail">Milestones</div>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-number">{payments.filter(p => p.status === 'pending').length}</div>
                <div className="stat-label">Pending</div>
                <div className="stat-detail">Payments</div>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">📁</div>
              <div className="stat-content">
                <div className="stat-number">{documents.length}</div>
                <div className="stat-label">Documents</div>
                <div className="stat-detail">Available</div>
              </div>
            </div>
          </div>

          <div className="content-grid">
            <div className="project-overview">
              <h2>Project Status</h2>
              <div className="projects-list">
                {projects.map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="project-header">
                      <h3>{project.name}</h3>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(project.status) }}
                      >
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="project-description">{project.description}</p>
                    <div className="progress-section">
                      <div className="progress-header">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="project-dates">
                      <div className="date-item">
                        <span className="date-label">Started:</span>
                        <span>{new Date(project.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="date-item">
                        <span className="date-label">Expected:</span>
                        <span>{new Date(project.expectedCompletion).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="actions-list">
                <button 
                  className="action-item"
                  onClick={() => setActiveTab('support')}
                >
                  <div className="action-icon">🎫</div>
                  <div className="action-content">
                    <h4>Submit Request</h4>
                    <p>Create support ticket</p>
                  </div>
                </button>
                
                <button 
                  className="action-item"
                  onClick={() => setActiveTab('documents')}
                >
                  <div className="action-icon">📁</div>
                  <div className="action-content">
                    <h4>View Documents</h4>
                    <p>Access shared files</p>
                  </div>
                </button>
                
                <button 
                  className="action-item"
                  onClick={() => setActiveTab('payments')}
                >
                  <div className="action-icon">💰</div>
                  <div className="action-content">
                    <h4>Payment History</h4>
                    <p>View invoices</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'projects' && (
        <div className="projects-section">
          <div className="section-header">
            <h2>Project Details & Milestones</h2>
            <p>Track project progress and milestone completion</p>
          </div>
          
          {projects.map((project) => (
            <div key={project.id} className="detailed-project-card">
              <div className="project-info">
                <div className="project-title">
                  <h3>{project.name}</h3>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(project.status) }}
                  >
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
                <p>{project.description}</p>
                
                <div className="project-timeline">
                  <div className="timeline-item">
                    <span className="timeline-label">Start Date:</span>
                    <span>{new Date(project.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="timeline-item">
                    <span className="timeline-label">Expected Completion:</span>
                    <span>{new Date(project.expectedCompletion).toLocaleDateString()}</span>
                  </div>
                  <div className="timeline-item">
                    <span className="timeline-label">Progress:</span>
                    <span>{project.progress}%</span>
                  </div>
                </div>
              </div>
              
              <div className="milestones-section">
                <h4>Project Milestones</h4>
                <div className="milestones-list">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="milestone-item">
                      <div className="milestone-status">
                        <div 
                          className="status-dot"
                          style={{ backgroundColor: getStatusColor(milestone.status) }}
                        ></div>
                      </div>
                      <div className="milestone-content">
                        <h5>{milestone.title}</h5>
                        <p>{milestone.description}</p>
                        <div className="milestone-dates">
                          <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                          {milestone.completedDate && (
                            <span>Completed: {new Date(milestone.completedDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="payments-section">
          <div className="section-header">
            <h2>Payment History</h2>
            <p>View your payment records and invoice details</p>
          </div>
          
          <div className="payments-list">
            {payments.map((payment) => (
              <div key={payment.id} className="payment-card">
                <div className="payment-header">
                  <div className="payment-info">
                    <h3>{payment.description}</h3>
                    <p className="invoice-number">Invoice: {payment.invoiceNumber}</p>
                  </div>
                  <div className="payment-amount">
                    <span className="amount">${payment.amount.toLocaleString()}</span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(payment.status) }}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
                
                <div className="payment-date">
                  <span>Date: {new Date(payment.date).toLocaleDateString()}</span>
                </div>
                
                <div className="payment-actions">
                  <button className="action-btn primary">View Invoice</button>
                  <button className="action-btn secondary">Download PDF</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="documents-section">
          <div className="section-header">
            <h2>Shared Documents</h2>
            <p>Access and download your project documents</p>
          </div>
          
          <div className="documents-grid">
            {documents.map((document) => (
              <div key={document.id} className="document-card">
                <div className="document-icon">
                  {getCategoryIcon(document.category)}
                </div>
                
                <div className="document-info">
                  <h4>{document.name}</h4>
                  <div className="document-meta">
                    <span className="document-type">{document.type}</span>
                    <span className="document-size">{document.size}</span>
                  </div>
                  <div className="document-date">
                    Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="document-actions">
                  <button className="action-btn primary">Download</button>
                  <button className="action-btn secondary">Preview</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="support-section">
          <div className="section-header">
            <h2>Support & Requests</h2>
            <p>Submit new requests and track existing support tickets</p>
          </div>
          
          <div className="support-actions">
            <button className="create-ticket-btn">
              <div className="btn-icon">➕</div>
              <div className="btn-content">
                <h4>Create New Request</h4>
                <p>Submit a support ticket or request</p>
              </div>
            </button>
          </div>
          
          <div className="tickets-list">
            <h3>My Support Tickets</h3>
            {tickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <div className="ticket-info">
                    <h4>{ticket.subject}</h4>
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
                
                <div className="ticket-dates">
                  <span>Created: {new Date(ticket.created).toLocaleDateString()}</span>
                  <span>Last Update: {new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                </div>
                
                <div className="ticket-actions">
                  <button className="action-btn primary">View Details</button>
                  <button className="action-btn secondary">Add Comment</button>
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

  .portal-header {
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
    flex-wrap: wrap;
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

  .project-overview, .quick-actions {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .project-overview h2, .quick-actions h2 {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 20px 0;
  }

  .projects-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .project-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    transition: all 0.2s ease;
  }

  .project-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  }

  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .project-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    color: white;
    text-transform: capitalize;
  }

  .project-description {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 12px 0;
  }

  .progress-section {
    margin-bottom: 12px;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    font-size: 12px;
    color: #6b7280;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: #f3f4f6;
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #10b981);
    transition: width 0.3s ease;
  }

  .project-dates {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #6b7280;
  }

  .date-label {
    font-weight: 500;
  }

  .actions-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .action-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .action-item:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  }

  .action-icon {
    font-size: 20px;
    width: 40px;
    height: 40px;
    background: #f3f4f6;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .action-content h4 {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 2px 0;
  }

  .action-content p {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
  }

  .projects-section, .payments-section, .documents-section, .support-section {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .section-header {
    margin-bottom: 24px;
  }

  .section-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  .section-header p {
    color: #6b7280;
    margin: 0;
  }

  .detailed-project-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
  }

  .project-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .project-title h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .project-timeline {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin: 16px 0;
    padding: 16px 0;
    border-top: 1px solid #f3f4f6;
    border-bottom: 1px solid #f3f4f6;
  }

  .timeline-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .timeline-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
  }

  .milestones-section h4 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 16px 0;
  }

  .milestones-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .milestone-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
    border: 1px solid #f3f4f6;
    border-radius: 8px;
  }

  .milestone-status {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
  }

  .status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .milestone-content h5 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .milestone-content p {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 8px 0;
  }

  .milestone-dates {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #9ca3af;
  }

  .payments-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .payment-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.2s ease;
  }

  .payment-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  }

  .payment-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .payment-info h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .invoice-number {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
  }

  .payment-amount {
    text-align: right;
  }

  .amount {
    display: block;
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 4px;
  }

  .payment-date {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 12px;
  }

  .payment-actions {
    display: flex;
    gap: 8px;
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

  .documents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .document-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.2s ease;
  }

  .document-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .document-icon {
    font-size: 32px;
    text-align: center;
    margin-bottom: 12px;
  }

  .document-info h4 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
    text-align: center;
  }

  .document-meta {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .document-type, .document-size {
    font-size: 12px;
    color: #6b7280;
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 3px;
  }

  .document-date {
    font-size: 12px;
    color: #9ca3af;
    text-align: center;
    margin-bottom: 16px;
  }

  .document-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .support-actions {
    margin-bottom: 32px;
  }

  .create-ticket-btn {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 20px;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    background: #f9fafb;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .create-ticket-btn:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }

  .btn-icon {
    font-size: 24px;
    width: 48px;
    height: 48px;
    background: #3b82f6;
    color: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-content h4 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .btn-content p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  .tickets-list h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 16px 0;
  }

  .ticket-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
    transition: all 0.2s ease;
  }

  .ticket-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  }

  .ticket-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .ticket-info h4 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .ticket-id {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
  }

  .ticket-badges {
    display: flex;
    gap: 8px;
  }

  .priority-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    color: white;
    text-transform: capitalize;
  }

  .ticket-dates {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 12px;
  }

  .ticket-actions {
    display: flex;
    gap: 8px;
  }

  @media (max-width: 768px) {
    padding: 16px;

    .portal-header {
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

    .documents-grid {
      grid-template-columns: 1fr;
    }

    .project-timeline {
      grid-template-columns: 1fr;
    }

    .payment-header {
      flex-direction: column;
      gap: 12px;
    }

    .payment-amount {
      text-align: left;
    }

    .ticket-header {
      flex-direction: column;
      gap: 12px;
    }
  }
`;

export default CustomerPortal;