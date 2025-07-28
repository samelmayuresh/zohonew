'use client'

import React from 'react';
import styled from 'styled-components';

interface LeadCardProps {
  lead: {
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
  };
  onEdit?: (lead: any) => void;
  onAssign?: (leadId: string) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onEdit, onAssign }) => {
  const getStatusColor = (status: string) => {
    const colors = {
      new: '#6b7280',
      contacted: '#3b82f6',
      qualified: '#8b5cf6',
      proposal: '#f59e0b',
      negotiation: '#ef4444',
      closed_won: '#10b981',
      closed_lost: '#dc2626'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return '🆕';
      case 'contacted':
        return '📞';
      case 'qualified':
        return '✅';
      case 'proposal':
        return '📄';
      case 'negotiation':
        return '🤝';
      case 'closed_won':
        return '🎉';
      case 'closed_lost':
        return '❌';
      default:
        return '📋';
    }
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'website':
        return '🌐';
      case 'social_media':
        return '📱';
      case 'referral':
        return '👥';
      case 'cold_call':
        return '☎️';
      case 'email_campaign':
        return '📧';
      case 'trade_show':
        return '🏢';
      default:
        return '📋';
    }
  };

  return (
    <StyledWrapper>
      <div className="card">
        <div className="card-header">
          <div className="lead-avatar">
            {lead.first_name.charAt(0).toUpperCase()}{lead.last_name.charAt(0).toUpperCase()}
          </div>
          <div className="lead-info">
            <h3 className="lead-name">{lead.first_name} {lead.last_name}</h3>
            {lead.company && <p className="lead-company">{lead.company}</p>}
          </div>
          <div className="status-badge" style={{ backgroundColor: getStatusColor(lead.status) }}>
            <span className="status-icon">{getStatusIcon(lead.status)}</span>
            <span className="status-text">{lead.status.replace('_', ' ').toUpperCase()}</span>
          </div>
        </div>
        
        <div className="card-body">
          <div className="contact-info">
            {lead.email && (
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span className="contact-text">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span className="contact-text">{lead.phone}</span>
              </div>
            )}
          </div>
          
          <div className="lead-details">
            {lead.source && (
              <div className="detail-item">
                <span className="detail-label">Source:</span>
                <div className="source-info">
                  <span className="source-icon">{getSourceIcon(lead.source)}</span>
                  <span className="detail-value">{lead.source.replace('_', ' ')}</span>
                </div>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Created:</span>
              <span className="detail-value">
                {new Date(lead.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Assigned:</span>
              <span className="detail-value">
                {lead.assigned_to ? 'Yes' : 'Unassigned'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="card-actions">
          {onEdit && (
            <button className="action-button edit" onClick={() => onEdit(lead)}>
              <svg viewBox="0 0 24 24" className="action-icon">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              Edit
            </button>
          )}
          {onAssign && !lead.assigned_to && (
            <button className="action-button assign" onClick={() => onAssign(lead.id)}>
              <svg viewBox="0 0 24 24" className="action-icon">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Assign
            </button>
          )}
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;
    overflow: hidden;
    transition: all 0.2s ease;
    height: 100%;
  }

  .card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }

  .card-header {
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #f3f4f6;
  }

  .lead-avatar {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 16px;
    flex-shrink: 0;
  }

  .lead-info {
    flex: 1;
    min-width: 0;
  }

  .lead-name {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .lead-company {
    font-size: 14px;
    color: #6b7280;
    margin: 2px 0 0 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 12px;
    color: white;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .status-icon {
    font-size: 12px;
  }

  .status-text {
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .card-body {
    padding: 16px;
  }

  .contact-info {
    margin-bottom: 16px;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .contact-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
  }

  .contact-text {
    color: #374151;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .lead-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .detail-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
  }

  .detail-value {
    font-size: 12px;
    color: #1f2937;
    font-weight: 600;
  }

  .source-info {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .source-icon {
    font-size: 12px;
  }

  .card-actions {
    padding: 12px 16px;
    background-color: #f9fafb;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .action-button {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-icon {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }

  .action-button.edit {
    background-color: #3b82f6;
    color: white;
  }

  .action-button.edit:hover {
    background-color: #2563eb;
  }

  .action-button.assign {
    background-color: #10b981;
    color: white;
  }

  .action-button.assign:hover {
    background-color: #059669;
  }
`;

export default LeadCard;