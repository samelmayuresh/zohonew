'use client'

import React from 'react';
import styled from 'styled-components';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    assigned_to: string;
    assigned_by: string;
    status: string;
    priority: string;
    due_date?: string;
    completed_at?: string;
    created_at: string;
  };
  assigneeName?: string;
  onStatusUpdate?: (taskId: string, newStatus: string) => void;
  onEdit?: (task: any) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, assigneeName, onStatusUpdate, onEdit }) => {
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#dc2626'
    };
    return colors[priority as keyof typeof colors] || '#6b7280';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: '#6b7280',
      in_progress: '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'high':
        return '🟠';
      case 'urgent':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'in_progress':
        return '🔄';
      case 'completed':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📋';
    }
  };

  const isOverdue = () => {
    if (!task.due_date || task.status === 'completed') return false;
    return new Date(task.due_date) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <StyledWrapper>
      <div className={`card ${isOverdue() ? 'overdue' : ''}`}>
        <div className="card-header">
          <div className="task-info">
            <h3 className="task-title">{task.title}</h3>
            {task.description && (
              <p className="task-description">{task.description}</p>
            )}
          </div>
          <div className="badges">
            <div className="priority-badge" style={{ backgroundColor: getPriorityColor(task.priority) }}>
              <span className="priority-icon">{getPriorityIcon(task.priority)}</span>
              <span className="priority-text">{task.priority.toUpperCase()}</span>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          <div className="task-details">
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <div className="status-info">
                <span className="status-icon">{getStatusIcon(task.status)}</span>
                <span className="detail-value" style={{ color: getStatusColor(task.status) }}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Assigned to:</span>
              <span className="detail-value">{assigneeName || 'Unknown'}</span>
            </div>
            
            {task.due_date && (
              <div className="detail-row">
                <span className="detail-label">Due:</span>
                <span className={`detail-value ${isOverdue() ? 'overdue-text' : ''}`}>
                  {formatDateTime(task.due_date)}
                  {isOverdue() && <span className="overdue-indicator"> (OVERDUE)</span>}
                </span>
              </div>
            )}
            
            <div className="detail-row">
              <span className="detail-label">Created:</span>
              <span className="detail-value">{formatDate(task.created_at)}</span>
            </div>
            
            {task.completed_at && (
              <div className="detail-row">
                <span className="detail-label">Completed:</span>
                <span className="detail-value">{formatDateTime(task.completed_at)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="card-actions">
          {onStatusUpdate && task.status !== 'completed' && (
            <div className="status-actions">
              {task.status === 'pending' && (
                <button 
                  className="action-button start"
                  onClick={() => onStatusUpdate(task.id, 'in_progress')}
                >
                  <svg viewBox="0 0 24 24" className="action-icon">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Start
                </button>
              )}
              {task.status === 'in_progress' && (
                <button 
                  className="action-button complete"
                  onClick={() => onStatusUpdate(task.id, 'completed')}
                >
                  <svg viewBox="0 0 24 24" className="action-icon">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Complete
                </button>
              )}
            </div>
          )}
          
          {onEdit && (
            <button className="action-button edit" onClick={() => onEdit(task)}>
              <svg viewBox="0 0 24 24" className="action-icon">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              Edit
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

  .card.overdue {
    border-left: 4px solid #ef4444;
    box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2), 0 2px 4px -1px rgba(239, 68, 68, 0.1);
  }

  .card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }

  .card-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    border-bottom: 1px solid #f3f4f6;
  }

  .task-info {
    flex: 1;
    min-width: 0;
  }

  .task-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
    line-height: 1.4;
  }

  .task-description {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .badges {
    flex-shrink: 0;
  }

  .priority-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 12px;
    color: white;
    font-size: 11px;
    font-weight: 600;
  }

  .priority-icon {
    font-size: 12px;
  }

  .priority-text {
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .card-body {
    padding: 16px;
  }

  .task-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .detail-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
    flex-shrink: 0;
  }

  .detail-value {
    font-size: 12px;
    color: #1f2937;
    font-weight: 600;
    text-align: right;
    word-break: break-word;
  }

  .status-info {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .status-icon {
    font-size: 12px;
  }

  .overdue-text {
    color: #ef4444 !important;
  }

  .overdue-indicator {
    font-size: 10px;
    font-weight: 700;
  }

  .card-actions {
    padding: 12px 16px;
    background-color: #f9fafb;
    display: flex;
    gap: 8px;
    justify-content: space-between;
    align-items: center;
  }

  .status-actions {
    display: flex;
    gap: 8px;
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

  .action-button.start {
    background-color: #3b82f6;
    color: white;
  }

  .action-button.start:hover {
    background-color: #2563eb;
  }

  .action-button.complete {
    background-color: #10b981;
    color: white;
  }

  .action-button.complete:hover {
    background-color: #059669;
  }

  .action-button.edit {
    background-color: #6b7280;
    color: white;
  }

  .action-button.edit:hover {
    background-color: #4b5563;
  }
`;

export default TaskCard;