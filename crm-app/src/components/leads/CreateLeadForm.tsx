'use client'

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface CreateLeadFormProps {
  onLeadCreated?: (lead: any) => void;
  onClose?: () => void;
}

const CreateLeadForm: React.FC<CreateLeadFormProps> = ({ onLeadCreated, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    status: 'new',
    assigned_to: ''
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
        // Filter to show only sales executives and managers for assignment
        const salesUsers = data.filter((user: any) => 
          ['sales_executive', 'sales_manager'].includes(user.role)
        );
        setUsers(salesUsers);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

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
      const userData = localStorage.getItem('user_data');
      const currentUser = userData ? JSON.parse(userData) : null;

      const leadData = {
        ...formData,
        created_by: currentUser?.id || 'unknown',
        assigned_to: formData.assigned_to || null
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/leads/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(leadData),
      });

      const data = await response.json();

      if (response.ok) {
        if (onLeadCreated) {
          onLeadCreated(data);
        }
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          company: '',
          source: '',
          status: 'new',
          assigned_to: ''
        });
      } else {
        setError(data.detail || 'Failed to create lead');
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
            <h2 className="form-title">Create New Lead</h2>
            <p className="form-subtitle">Add a potential customer to the CRM system</p>
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
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  placeholder="Enter first name"
                  className="form-input"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  placeholder="Enter last name"
                  className="form-input"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
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
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  placeholder="Enter company name"
                  className="form-input"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="source">Lead Source</label>
                <select
                  id="source"
                  name="source"
                  className="form-select"
                  value={formData.source}
                  onChange={handleInputChange}
                >
                  <option value="">Select source</option>
                  <option value="website">Website</option>
                  <option value="social_media">Social Media</option>
                  <option value="referral">Referral</option>
                  <option value="cold_call">Cold Call</option>
                  <option value="email_campaign">Email Campaign</option>
                  <option value="trade_show">Trade Show</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed_won">Closed Won</option>
                  <option value="closed_lost">Closed Lost</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="assigned_to">Assign To</label>
              <select
                id="assigned_to"
                name="assigned_to"
                className="form-select"
                value={formData.assigned_to}
                onChange={handleInputChange}
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Creating Lead...' : 'Create Lead'}
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

  .form-actions {
    text-align: center;
    margin-top: 24px;
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

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
`;

export default CreateLeadForm;