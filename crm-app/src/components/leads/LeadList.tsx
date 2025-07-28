'use client'

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import LeadCard from './LeadCard';
import CreateLeadForm from './CreateLeadForm';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status: string;
  assigned_to?: string;
  created_at: string;
}

const LeadList: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/leads/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      } else {
        setError('Failed to fetch leads');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLeadCreated = (newLead: any) => {
    setShowCreateForm(false);
    fetchLeads(); // Refresh the lead list
  };

  const handleAssignLead = (leadId: string) => {
    // This would open an assignment modal
    console.log(`Assign lead ${leadId}`);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  if (loading) {
    return (
      <StyledWrapper>
        <div className="loading">Loading leads...</div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <div className="header">
        <div className="title-section">
          <h1>Lead Management</h1>
          <p>Track and manage potential customers</p>
        </div>
        <button className="create-button" onClick={() => setShowCreateForm(true)}>
          <svg viewBox="0 0 24 24" className="create-icon">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Create Lead
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <svg viewBox="0 0 24 24" className="search-icon">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="closed_won">Closed Won</option>
          <option value="closed_lost">Closed Lost</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Sources</option>
          <option value="website">Website</option>
          <option value="social_media">Social Media</option>
          <option value="referral">Referral</option>
          <option value="cold_call">Cold Call</option>
          <option value="email_campaign">Email Campaign</option>
          <option value="trade_show">Trade Show</option>
          <option value="other">Other</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{leads.length}</span>
          <span className="stat-label">Total Leads</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{leads.filter(l => l.status === 'new').length}</span>
          <span className="stat-label">New</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{leads.filter(l => l.status === 'qualified').length}</span>
          <span className="stat-label">Qualified</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{leads.filter(l => l.status === 'closed_won').length}</span>
          <span className="stat-label">Won</span>
        </div>
      </div>

      <div className="leads-grid">
        {filteredLeads.map(lead => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onAssign={handleAssignLead}
          />
        ))}
      </div>

      {filteredLeads.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>No leads found</h3>
          <p>
            {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first lead to get started'
            }
          </p>
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay">
          <CreateLeadForm
            onLeadCreated={handleLeadCreated}
            onClose={() => setShowCreateForm(false)}
          />
        </div>
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  .loading {
    text-align: center;
    padding: 40px;
    font-size: 18px;
    color: #6b7280;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    gap: 16px;
  }

  .title-section h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .title-section p {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }

  .create-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #10b981;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    white-space: nowrap;
  }

  .create-button:hover {
    background-color: #059669;
  }

  .create-icon {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  .filters {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .search-box {
    position: relative;
    flex: 1;
    min-width: 250px;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    fill: #9ca3af;
  }

  .search-box input {
    width: 100%;
    padding: 10px 12px 10px 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }

  .search-box input:focus {
    border-color: #10b981;
  }

  .filter-select {
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    background-color: white;
    cursor: pointer;
    outline: none;
    min-width: 130px;
  }

  .filter-select:focus {
    border-color: #10b981;
  }

  .error-message {
    background-color: #fef2f2;
    color: #dc2626;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    border: 1px solid #fecaca;
  }

  .stats-bar {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
    padding: 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .stat-number {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
  }

  .stat-label {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .leads-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #6b7280;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .empty-state h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #374151;
  }

  .empty-state p {
    font-size: 14px;
    margin: 0;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
  }

  @media (max-width: 768px) {
    padding: 16px;

    .header {
      flex-direction: column;
      align-items: stretch;
    }

    .filters {
      flex-direction: column;
    }

    .search-box {
      min-width: auto;
    }

    .stats-bar {
      flex-wrap: wrap;
      justify-content: center;
    }

    .leads-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default LeadList;