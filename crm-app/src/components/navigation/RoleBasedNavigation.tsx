'use client'

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  roles: string[];
  children?: NavigationItem[];
}

const RoleBasedNavigation: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    router.push('/login');
  };

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
      href: '/dashboard',
      roles: ['super_admin', 'admin', 'sales_manager', 'sales_executive', 'support_agent', 'customer']
    },
    {
      id: 'users',
      label: 'User Management',
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      href: '/dashboard/users',
      roles: ['super_admin', 'admin']
    },
    {
      id: 'leads',
      label: 'Lead Management',
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6"/>
          <path d="m21 12-6-6-6 6-6-6"/>
        </svg>
      ),
      href: '/dashboard/leads',
      roles: ['super_admin', 'admin', 'sales_manager', 'sales_executive']
    },
    {
      id: 'tasks',
      label: 'Task Management',
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,10 8,9"/>
        </svg>
      ),
      href: '/dashboard/tasks',
      roles: ['super_admin', 'admin', 'sales_manager', 'sales_executive']
    },
    {
      id: 'support',
      label: 'Support Tickets',
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      href: '/dashboard/support',
      roles: ['super_admin', 'admin', 'support_agent', 'customer']
    },
    {
      id: 'contacts',
      label: 'Contact Management',
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      href: '/dashboard/contacts',
      roles: ['super_admin', 'admin', 'sales_manager', 'sales_executive']
    },
    {
      id: 'accounts',
      label: 'Account Management',
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 21h18"/>
          <path d="M5 21V7l8-4v18"/>
          <path d="M19 21V11l-6-4"/>
        </svg>
      ),
      href: '/dashboard/accounts',
      roles: ['super_admin', 'admin', 'sales_manager', 'sales_executive']
    },
    {
      id: 'deals',
      label: 'Deal Management',
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      href: '/dashboard/deals',
      roles: ['super_admin', 'admin', 'sales_manager', 'sales_executive']
    },
    {
      id: 'email',
      label: 'Email Integration',
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      href: '/dashboard/email-integration',
      roles: ['super_admin', 'admin', 'sales_manager', 'sales_executive']
    },
    {
      id: 'automation',
      label: 'Workflow Automation',
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6"/>
          <path d="m21 12-6-6-6 6-6-6"/>
        </svg>
      ),
      href: '/dashboard/automation',
      roles: ['super_admin', 'admin', 'sales_manager']
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      ),
      href: '/dashboard/reports',
      roles: ['super_admin', 'admin', 'sales_manager']
    },
    {
      id: 'projects',
      label: 'My Projects',
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      href: '/dashboard/projects',
      roles: ['customer']
    },
    {
      id: 'billing',
      label: 'Billing & Payments',
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      href: '/dashboard/billing',
      roles: ['super_admin', 'customer']
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6"/>
          <path d="m21 12-6-6-6 6-6-6"/>
        </svg>
      ),
      href: '/dashboard/settings',
      roles: ['super_admin']
    }
  ];

  const getVisibleItems = () => {
    if (!user) return [];
    return navigationItems.filter(item => item.roles.includes(user.role));
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'sales_manager': 'Sales Manager',
      'sales_executive': 'Sales Executive',
      'support_agent': 'Support Agent',
      'customer': 'Customer'
    };
    return roleNames[role] || role;
  };

  if (!user) {
    return null;
  }

  return (
    <StyledWrapper>
      <div className="navigation-card">
        {/* User Profile Section */}
        <div className="user-profile">
          <div className="user-avatar">
            <span>{user.full_name?.charAt(0) || 'U'}</span>
          </div>
          <div className="user-info">
            <div className="user-name">{user.full_name || 'User'}</div>
            <div className="user-role">{getRoleDisplayName(user.role)}</div>
          </div>
          <button 
            className="profile-toggle"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>
        </div>

        {/* Profile Dropdown */}
        {isProfileOpen && (
          <div className="profile-dropdown">
            <div className="dropdown-item">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Profile Settings</span>
            </div>
            <div className="dropdown-item">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6"/>
                <path d="m21 12-6-6-6 6-6-6"/>
              </svg>
              <span>Preferences</span>
            </div>
            <div className="separator" />
            <div className="dropdown-item logout" onClick={handleLogout}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Logout</span>
            </div>
          </div>
        )}

        <div className="separator" />

        {/* Navigation Items */}
        <ul className="nav-list">
          {getVisibleItems().map((item) => (
            <li key={item.id} className="nav-element">
              {item.href ? (
                <Link href={item.href} className="nav-link">
                  {item.icon}
                  <span className="nav-label">{item.label}</span>
                </Link>
              ) : (
                <button className="nav-button" onClick={item.onClick}>
                  {item.icon}
                  <span className="nav-label">{item.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>

        <div className="separator" />

        {/* Quick Actions */}
        <ul className="nav-list">
          {user.role === 'super_admin' && (
            <li className="nav-element">
              <Link href="/dashboard/users" className="nav-link">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                </svg>
                <span className="nav-label">Add User</span>
              </Link>
            </li>
          )}
          
          {(['super_admin', 'admin', 'sales_manager'].includes(user.role)) && (
            <li className="nav-element">
              <Link href="/dashboard/leads" className="nav-link">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6"/>
                  <path d="m21 12-6-6-6 6-6-6"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                </svg>
                <span className="nav-label">Add Lead</span>
              </Link>
            </li>
          )}

          {user.role === 'customer' && (
            <li className="nav-element">
              <button className="nav-button">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                </svg>
                <span className="nav-label">New Request</span>
              </button>
            </li>
          )}
        </ul>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .navigation-card {
    width: 280px;
    background-color: rgba(36, 40, 50, 1);
    background-image: linear-gradient(
      139deg,
      rgba(36, 40, 50, 1) 0%,
      rgba(36, 40, 50, 1) 0%,
      rgba(37, 28, 40, 1) 100%
    );
    border-radius: 12px;
    padding: 20px 0px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0px 20px;
    margin-bottom: 8px;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 16px;
  }

  .user-info {
    flex: 1;
  }

  .user-name {
    color: #ffffff;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 2px;
  }

  .user-role {
    color: #7e8590;
    font-size: 12px;
  }

  .profile-toggle {
    background: none;
    border: none;
    color: #7e8590;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .profile-toggle:hover {
    color: #ffffff;
    background-color: rgba(255, 255, 255, 0.1);
  }

  .profile-dropdown {
    position: absolute;
    top: 80px;
    left: 20px;
    right: 20px;
    background-color: rgba(45, 50, 62, 1);
    border-radius: 8px;
    padding: 8px 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    z-index: 1000;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    color: #7e8590;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
  }

  .dropdown-item:hover {
    background-color: rgba(83, 83, 255, 0.8);
    color: #ffffff;
  }

  .dropdown-item.logout:hover {
    background-color: rgba(239, 68, 68, 0.8);
    color: #ffffff;
  }

  .separator {
    border-top: 1.5px solid #42434a;
    margin: 0 20px;
  }

  .nav-list {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0px 20px;
    margin: 0;
  }

  .nav-element {
    display: flex;
  }

  .nav-link, .nav-button {
    display: flex;
    align-items: center;
    color: #7e8590;
    gap: 12px;
    transition: all 0.3s ease-out;
    padding: 12px 16px;
    border-radius: 8px;
    cursor: pointer;
    text-decoration: none;
    width: 100%;
    border: none;
    background: none;
    font-size: 14px;
    font-family: inherit;
  }

  .nav-link svg, .nav-button svg {
    width: 20px;
    height: 20px;
    transition: all 0.3s ease-out;
    flex-shrink: 0;
  }

  .nav-label {
    font-weight: 500;
    flex: 1;
    text-align: left;
  }

  .nav-link:hover, .nav-button:hover {
    background-color: #5353ff;
    color: #ffffff;
    transform: translateX(2px);
  }

  .nav-link:active, .nav-button:active {
    transform: scale(0.98);
  }

  .nav-link:hover svg, .nav-button:hover svg {
    stroke: #ffffff;
  }

  /* Special styling for quick actions */
  .nav-list:last-child .nav-link,
  .nav-list:last-child .nav-button {
    color: #bd89ff;
  }

  .nav-list:last-child .nav-link svg,
  .nav-list:last-child .nav-button svg {
    stroke: #bd89ff;
  }

  .nav-list:last-child .nav-link:hover,
  .nav-list:last-child .nav-button:hover {
    background-color: rgba(56, 45, 71, 0.836);
    color: #bd89ff;
  }

  .nav-list:last-child .nav-link:hover svg,
  .nav-list:last-child .nav-button:hover svg {
    stroke: #bd89ff;
  }

  @media (max-width: 768px) {
    .navigation-card {
      width: 100%;
      border-radius: 0;
    }

    .user-profile {
      padding: 0px 16px;
    }

    .separator {
      margin: 0 16px;
    }

    .nav-list {
      padding: 0px 16px;
    }

    .profile-dropdown {
      left: 16px;
      right: 16px;
    }
  }
`;

export default RoleBasedNavigation;