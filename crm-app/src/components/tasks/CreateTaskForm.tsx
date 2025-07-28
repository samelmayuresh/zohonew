'use client'

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface CreateTaskFormProps {
  onTaskCreated?: (task: any) => void;
  onClose?: () => void;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onTaskCreated, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    due_date: ''
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');
      const currentUser = userData ? JSON.parse(userData) : null;

      const taskData = {
        ...formData,
        assigned_by: currentUser?.id || 'unknown',
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (response.ok) {
        if (onTaskCreated) {
          onTaskCreated(data);
        }
        // Reset form
        setFormData({
          title: '',
          description: '',
          assigned_to: '',
          priority: 'medium',
          due_date: ''
        });
      } else {
        setError(data.detail || 'Failed to create task');
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="form-container">
        <div className="form-header">
          <div>
            <h2 className="form-title">Create New Task</h2>
            <p className="form-subtitle">Assign a task to a team member</p>
          </div>
          {onClose && (
            <div className="close-button" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
        
        <hr className="divider" />
        
        <div className="form-body">
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Task Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Enter task title"
                className="form-input"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter task description"
                className="form-textarea"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="assigned_to">Assign To *</label>
                <select
                  id="assigned_to"
                  name="assigned_to"
                  className="form-select"
                  value={formData.assigned_to}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select assignee</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="due_date">Due Date</label>
              <input
                type="datetime-local"
                id="due_date"
                name="due_date"
                className="form-input"
                value={formData.due_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="info-text">
              <p>
                📧 An email notification will be automatically sent to the assignee with task details.
              </p>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Creating Task...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .form-container {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .form-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .form-title {
    font-size: 32px;
    font-weight: bold;
    margin: 0;
    color: #1f2937;
  }

  .form-subtitle {
    font-size: 15px;
    color: #6b7280;
    margin: 4px 0 0 0;
  }

  .close-button {
    cursor: pointer;
    color: #6b7280;
    padding: 4px;
    border-radius: 4px;
    transition: color 0.2s;
  }

  .close-button:hover {
    color: #374151;
  }

  .close-icon {
    height: 28px;
    width: 28px;
  }

  .divider {
    border: none;
    height: 1px;
    background-color: #d1d5db;
    margin: 0;
  }

  .form-body {
    padding: 16px;
    padding-top: 12px;
    padding-bottom: 24px;
  }

  .error-message {
    background-color: #fef2f2;
    color: #dc2626;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 16px;
    border: 1px solid #fecaca;
    font-size: 14px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
  }

  .form-input, .form-select, .form-textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 16px;
    background-color: #f9fafb;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: inherit;
  }

  .form-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    background-color: white;
  }

  .form-input::placeholder, .form-textarea::placeholder {
    color: #9ca3af;
  }

  .info-text {
    background-color: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 20px;
  }

  .info-text p {
    font-size: 12px;
    color: #0369a1;
    margin: 0;
    line-height: 1.4;
  }

  .form-actions {
    text-align: center;
  }

  .submit-button {
    background-color: #8b5cf6;
    color: white;
    font-weight: bold;
    padding: 12px 64px;
    border: none;
    border-radius: 6px;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
  }

  .submit-button:hover:not(:disabled) {
    background-color: #7c3aed;
  }

  .submit-button:active:not(:disabled) {
    transform: translateY(1px);
  }

  .submit-button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
`;

export default CreateTaskForm;