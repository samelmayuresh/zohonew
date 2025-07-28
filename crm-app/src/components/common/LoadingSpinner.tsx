'use client'

import React from 'react';
import styled from 'styled-components';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Loading...' 
}) => {
  return (
    <StyledWrapper className={size}>
      <div className="loading-container">
        <div className="spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        {message && <div className="loading-message">{message}</div>}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 40px;
  }

  .spinner {
    position: relative;
    width: 40px;
    height: 40px;
  }

  .spinner-ring {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }

  .spinner-ring:nth-child(1) {
    animation-delay: -0.45s;
  }

  .spinner-ring:nth-child(2) {
    animation-delay: -0.3s;
  }

  .spinner-ring:nth-child(3) {
    animation-delay: -0.15s;
  }

  .loading-message {
    color: #6b7280;
    font-size: 14px;
    font-weight: 500;
  }

  &.small .spinner {
    width: 24px;
    height: 24px;
  }

  &.small .spinner-ring {
    border-width: 2px;
    border-top-width: 2px;
  }

  &.small .loading-message {
    font-size: 12px;
  }

  &.large .spinner {
    width: 60px;
    height: 60px;
  }

  &.large .spinner-ring {
    border-width: 4px;
    border-top-width: 4px;
  }

  &.large .loading-message {
    font-size: 16px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default LoadingSpinner;