'use client'

import React from 'react';
import styled from 'styled-components';
import RoleBasedNavigation from '../navigation/RoleBasedNavigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <StyledWrapper>
      <div className="layout-container">
        <aside className="sidebar">
          <RoleBasedNavigation />
        </aside>
        <main className="main-content">
          {children}
        </main>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .layout-container {
    display: flex;
    min-height: 100vh;
    background: #f8fafc;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 100;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .sidebar::-webkit-scrollbar {
    display: none;
  }

  .main-content {
    flex: 1;
    margin-left: 280px;
    min-height: 100vh;
    overflow-x: auto;
  }

  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      left: -280px;
      transition: left 0.3s ease;
      width: 280px;
    }

    .sidebar.open {
      left: 0;
    }

    .main-content {
      margin-left: 0;
      width: 100%;
    }
  }
`;

export default DashboardLayout;