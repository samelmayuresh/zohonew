'use client'

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Breadcrumb from '../navigation/Breadcrumb';

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: string;
  features?: string[];
  expectedDate?: string;
  contactInfo?: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  title,
  description,
  icon,
  features = [],
  expectedDate,
  contactInfo
}) => {
  return (
    <StyledWrapper>
      <Breadcrumb />
      <div className="coming-soon-container">
        <div className="icon-section">
          <div className="main-icon">{icon}</div>
        </div>
        
        <div className="content-section">
          <h1>{title}</h1>
          <p className="description">{description}</p>
          
          {features.length > 0 && (
            <div className="features-section">
              <h3>Planned Features:</h3>
              <ul className="features-list">
                {features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <span className="feature-icon">✨</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {expectedDate && (
            <div className="timeline-section">
              <div className="timeline-card">
                <div className="timeline-icon">📅</div>
                <div className="timeline-content">
                  <h4>Expected Release</h4>
                  <p>{expectedDate}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="action-section">
            <Link href="/dashboard" className="back-btn">
              <span className="btn-icon">←</span>
              Back to Dashboard
            </Link>
            
            {contactInfo && (
              <div className="contact-info">
                <p>Questions? Contact us at <strong>{contactInfo}</strong></p>
              </div>
            )}
          </div>
        </div>
        
        <div className="decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;

  .coming-soon-container {
    background: white;
    border-radius: 20px;
    padding: 60px 40px;
    max-width: 600px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 10;
  }

  .icon-section {
    margin-bottom: 30px;
  }

  .main-icon {
    font-size: 80px;
    margin-bottom: 20px;
    display: inline-block;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .content-section h1 {
    font-size: 36px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 16px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .description {
    font-size: 18px;
    color: #6b7280;
    line-height: 1.6;
    margin: 0 0 40px 0;
  }

  .features-section {
    margin-bottom: 40px;
    text-align: left;
  }

  .features-section h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 20px 0;
    text-align: center;
  }

  .features-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    font-size: 16px;
    color: #374151;
    border-bottom: 1px solid #f3f4f6;
  }

  .feature-item:last-child {
    border-bottom: none;
  }

  .feature-icon {
    font-size: 16px;
    color: #667eea;
  }

  .timeline-section {
    margin-bottom: 40px;
  }

  .timeline-card {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    background: #f8fafc;
    border-radius: 12px;
    padding: 20px;
    border: 2px solid #e5e7eb;
  }

  .timeline-icon {
    font-size: 24px;
  }

  .timeline-content h4 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 4px 0;
  }

  .timeline-content p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  .action-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 14px 28px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }

  .back-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
  }

  .btn-icon {
    font-size: 18px;
    transition: transform 0.3s ease;
  }

  .back-btn:hover .btn-icon {
    transform: translateX(-3px);
  }

  .contact-info {
    background: #f8fafc;
    border-radius: 8px;
    padding: 16px;
    border-left: 4px solid #667eea;
  }

  .contact-info p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  .decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 1;
  }

  .decoration-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 6s ease-in-out infinite;
  }

  .circle-1 {
    width: 100px;
    height: 100px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  .circle-2 {
    width: 150px;
    height: 150px;
    top: 60%;
    right: 10%;
    animation-delay: 2s;
  }

  .circle-3 {
    width: 80px;
    height: 80px;
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
  }

  @media (max-width: 768px) {
    padding: 16px;

    .coming-soon-container {
      padding: 40px 24px;
    }

    .content-section h1 {
      font-size: 28px;
    }

    .description {
      font-size: 16px;
    }

    .main-icon {
      font-size: 60px;
    }

    .timeline-card {
      flex-direction: column;
      text-align: center;
    }

    .features-section {
      text-align: center;
    }

    .feature-item {
      justify-content: center;
    }
  }
`;

export default ComingSoonPage;