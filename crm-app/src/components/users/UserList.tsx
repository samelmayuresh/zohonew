'use client'

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import UserCard from './UserCard';
import CreateUserForm from './CreateUserForm';
import UserCredentialsPopup from './UserCredentialsPopup';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserCredentials, setNewUserCredentials] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

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
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = (credentials: any) => {
    setNewUserCredentials(credentials);
    setShowCreateForm(false);
    fetchUsers(); // Refresh the user list
  };

  const handleToggleStatus = async (userId: string, newStatus: boolean) => {
    // This would be implemented when we have the update user endpoint
    console.log(`Toggle user ${userId} status to ${newStatus}`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <StyledWrapper>
        <div className="loading">Loading users...</div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <div className="header">
        <div className="title-section">
          <h1>User Management</h1>
          <p>Manage team members and their access levels</p>
        </div>
        <button className="create-button" onClick={() => setShowCreateForm(true)}>
          <svg viewBox="0 0 24 24" className="create-icon">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Create User
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <svg viewBox="0 0 24 24" className="search-icon">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="role-filter"
        >
          <option value="all">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="sales_manager">Sales Manager</option>
          <option value="sales_executive">Sales Executive</option>
          <option value="support_agent">Support Agent</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-grid">
        {filteredUsers.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onToggleStatus={handleToggleStatus}
          />
        ))}
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No users found</h3>
          <p>
            {searchTerm || roleFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first user to get started'
            }
          </p>
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay">
          <CreateUserForm
            onUserCreated={handleUserCreated}
            onClose={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {newUserCredentials && (
        <UserCredentialsPopup
          credentials={newUserCredentials}
          onClose={() => setNewUserCredentials(null)}
        />
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
    background-color: #3b82f6;
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
    background-color: #2563eb;
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
    border-color: #3b82f6;
  }

  .role-filter {
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    background-color: white;
    cursor: pointer;
    outline: none;
    min-width: 150px;
  }

  .role-filter:focus {
    border-color: #3b82f6;
  }

  .error-message {
    background-color: #fef2f2;
    color: #dc2626;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    border: 1px solid #fecaca;
  }

  .users-grid {
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

    .users-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default UserList;