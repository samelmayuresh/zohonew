'use client'

import React, { useState } from 'react';
import styled from 'styled-components';

interface CreateUserFormProps {
  onUserCreated?: (credentials: any) => void;
  onClose?: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onUserCreated, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'sales_executive'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (onUserCreated) {
          onUserCreated(data);
        }
        // Reset form
        setFormData({
          email: '',
          full_name: '',
          role: 'sales_executive'
        });
      } else {
        setError(data.detail || 'Failed to create user');
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
            <h2 className="form-title">Create New User</h2>
            <p className="form-subtitle">Add a new team member to the CRM system</p>
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
              <label htmlFor="full_name">Full Name</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                placeholder="Enter full name"
                className="form-input"
                value={formData.full_name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter email address"
                className="form-input"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">User Role</label>
              <select
                id="role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="sales_executive">Sales Executive</option>
                <option value="sales_manager">Sales Manager</option>
                <option value="support_agent">Support Agent</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            <div className="info-text">
              <p>
                A unique username and secure password will be automatically generated.
                The credentials will be displayed after creation and sent via email.
              </p>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Creating User...' : 'Create User'}
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
    max-width: 432px;
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

  .form-input, .form-select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 16px;
    background-color: #f9fafb;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .form-input:focus, .form-select:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background-color: white;
  }

  .form-input::placeholder {
    color: #9ca3af;
  }

  .info-text {
    background-color: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 20px;
  }

  .info-text p {
    font-size: 12px;
    color: #1e40af;
    margin: 0;
    line-height: 1.4;
  }

  .form-actions {
    text-align: center;
  }

  .submit-button {
    background-color: #10b981;
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
    background-color: #059669;
  }

  .submit-button:active:not(:disabled) {
    transform: translateY(1px);
  }

  .submit-button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

export default CreateUserForm;