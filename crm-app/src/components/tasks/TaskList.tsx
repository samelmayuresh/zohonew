'use client'

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import TaskCard from './TaskCard';
import CreateTaskForm from './CreateTaskForm';

interface Task {
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
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/tasks/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

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

  const handleTaskCreated = (newTask: any) => {
    setShowCreateForm(false);
    fetchTasks(); // Refresh the task list
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchTasks(); // Refresh the task list
      } else {
        setError('Failed to update task status');
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.full_name : 'Unknown User';
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getTaskStats = () => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => 
      t.due_date && 
      new Date(t.due_date) < new Date() && 
      t.status !== 'completed'
    ).length;

    return { total, pending, inProgress, completed, overdue };
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <StyledWrapper>
        <div className="loading">Loading tasks...</div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <div className="header">
        <div className="title-section">
          <h1>Task Management</h1>
          <p>Track and manage team assignments</p>
        </div>
        <button className="create-button" onClick={() => setShowCreateForm(true)}>
          <svg viewBox="0 0 24 24" className="create-icon">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Create Task
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.inProgress}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        {stats.overdue > 0 && (
          <div className="stat-item overdue">
            <span className="stat-number">{stats.overdue}</span>
            <span className="stat-label">Overdue</span>
          </div>
        )}
      </div>

      <div className="filters">
        <div className="search-box">
          <svg viewBox="0 0 24 24" className="search-icon">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
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
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tasks-grid">
        {filteredTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            assigneeName={getUserName(task.assigned_to)}
            onStatusUpdate={handleStatusUpdate}
          />
        ))}
      </div>

      {filteredTasks.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No tasks found</h3>
          <p>
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first task to get started'
            }
          </p>
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay">
          <CreateTaskForm
            onTaskCreated={handleTaskCreated}
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
    background-color: #8b5cf6;
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
    background-color: #7c3aed;
  }

  .create-icon {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  .stats-bar {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
    padding: 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .stat-item.overdue {
    color: #ef4444;
  }

  .stat-number {
    font-size: 24px;
    font-weight: 700;
    color: inherit;
  }

  .stat-label {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-item.overdue .stat-label {
    color: #ef4444;
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
    border-color: #8b5cf6;
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
    border-color: #8b5cf6;
  }

  .error-message {
    background-color: #fef2f2;
    color: #dc2626;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    border: 1px solid #fecaca;
  }

  .tasks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
      justify-content: center;
    }

    .tasks-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default TaskList;