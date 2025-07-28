'use client'

import React from 'react';
import styled from 'styled-components';

interface UserCardProps {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
  };
  onEdit?: (user: any) => void;
  onToggleStatus?: (userId: string, isActive: boolean) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onToggleStatus }) => {
  const getRoleColor = (role: string) => {
    const colors = {
      super_admin: '#dc2626',
      admin: '#ea580c',
      sales_manager: '#2563eb',
      sales_executive: '#059669',
      support_agent: '#7c3aed',
      customer: '#6b7280'
    };
    return colors[role as keyof typeof colors] || '#6b7280';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return '👑';
      case 'admin':
        return '⚙️';
      case 'sales_manager':
        return '📊';
      case 'sales_executive':
        return '💼';
      case 'support_agent':
        return '🎧';
      case 'customer':
        return '👤';
      default:
        return '👤';
    }
  };

  return (
    <StyledWrapper>
      <div className="card">
        <div className="card-header">
          <div className="user-avatar">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h3 className="user-name">{user.full_name}</h3>
            <p className="user-email">{user.email}</p>
          </div>
          <div className="status-indicator">
            <span className={`status-dot ${user.is_active ? 'active' : 'inactive'}`}></span>
          </div>
        </div>
        
        <div className="card-body">
          <div className="role-section">
            <div className="role-badge" style={{ backgroundColor: getRoleColor(user.role) }}>
              <span className="role-icon">{getRoleIcon(user.role)}</span>
              <span className="role-text">{user.role.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>
          
          <div className="user-details">
            <div className="detail-item">
              <span className="detail-label">Created:</span>
              <span className="detail-value">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className={`detail-value ${user.is_active ? 'active' : 'inactive'}`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="card-actions">
          {onEdit && (
            <button className="action-button edit" onClick={() => onEdit(user)}>
              <svg viewBox="0 0 24 24" className="action-icon">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              Edit
            </button>
          )}
          {onToggleStatus && (
            <button 
              className={`action-button ${user.is_active ? 'deactivate' : 'activate'}`}
              onClick={() => onToggleStatus(user.id, !user.is_active)}
            >
              <svg viewBox="0 0 24 24" className="action-icon">
                {user.is_active ? (
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                ) : (
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
                )}
              </svg>
              {user.is_active ? 'Deactivate' : 'Activate'}
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

  .user-avatar {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 18px;
    flex-shrink: 0;
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-email {
    font-size: 14px;
    color: #6b7280;
    margin: 2px 0 0 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status-indicator {
    flex-shrink: 0;
  }

  .status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
  }

  .status-dot.active {
    background-color: #10b981;
  }

  .status-dot.inactive {
    background-color: #ef4444;
  }

  .card-body {
    padding: 16px;
  }

  .role-section {
    margin-bottom: 16px;
  }

  .role-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    color: white;
    font-size: 12px;
    font-weight: 600;
  }

  .role-icon {
    font-size: 14px;
  }

  .role-text {
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .user-details {
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

  .detail-value.active {
    color: #10b981;
  }

  .detail-value.inactive {
    color: #ef4444;
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

  .action-button.activate {
    background-color: #10b981;
    color: white;
  }

  .action-button.activate:hover {
    background-color: #059669;
  }

  .action-button.deactivate {
    background-color: #ef4444;
    color: white;
  }

  .action-button.deactivate:hover {
    background-color: #dc2626;
  }
`;

export default UserCard;