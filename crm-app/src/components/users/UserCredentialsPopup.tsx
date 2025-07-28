'use client'

import React, { useState } from 'react';
import styled from 'styled-components';

interface UserCredentialsPopupProps {
  credentials: {
    username: string;
    password: string;
    email: string;
    full_name: string;
    role: string;
    email_status?: string;
    email_error?: string;
  };
  onClose: () => void;
}

const UserCredentialsPopup: React.FC<UserCredentialsPopupProps> = ({ credentials, onClose }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const copyAllCredentials = async () => {
    const credentialsText = `
CRM Account Credentials
======================
Name: ${credentials.full_name}
Email: ${credentials.email}
Username: ${credentials.username}
Password: ${credentials.password}
Role: ${credentials.role.replace('_', ' ').toUpperCase()}

Login URL: http://localhost:3000/login

Please keep these credentials secure and change your password after first login.
    `.trim();

    await copyToClipboard(credentialsText, 'all');
  };

  return (
    <StyledWrapper>
      <div className="overlay" onClick={onClose}>
        <div className="popup" onClick={(e) => e.stopPropagation()}>
          <div className="header">
            <div className="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
              </svg>
            </div>
            <div className="title-container">
              <h2 className="title">User Created Successfully!</h2>
              <p className="subtitle">Credentials generated for {credentials.full_name}</p>
            </div>
            <button className="close-button" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" fill="currentColor">
                <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" />
              </svg>
            </button>
          </div>

          <div className="content">
            <div className="credentials-grid">
              <div className="credential-item">
                <label>Full Name</label>
                <div className="credential-value">
                  <span>{credentials.full_name}</span>
                </div>
              </div>

              <div className="credential-item">
                <label>Email</label>
                <div className="credential-value">
                  <span>{credentials.email}</span>
                  <button 
                    className="copy-button"
                    onClick={() => copyToClipboard(credentials.email, 'email')}
                  >
                    {copied === 'email' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="credential-item">
                <label>Username</label>
                <div className="credential-value">
                  <span className="credential-text">{credentials.username}</span>
                  <button 
                    className="copy-button"
                    onClick={() => copyToClipboard(credentials.username, 'username')}
                  >
                    {copied === 'username' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="credential-item">
                <label>Password</label>
                <div className="credential-value">
                  <span className="credential-text password">{credentials.password}</span>
                  <button 
                    className="copy-button"
                    onClick={() => copyToClipboard(credentials.password, 'password')}
                  >
                    {copied === 'password' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="credential-item">
                <label>Role</label>
                <div className="credential-value">
                  <span className="role-badge">{credentials.role.replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Email Status Box */}
            <div className={`email-status-box ${credentials.email_status || 'not_sent'}`}>
              <div className="status-icon">
                {credentials.email_status === 'sent' ? '✅' : 
                 credentials.email_status === 'failed' ? '❌' : 
                 credentials.email_status === 'queued' ? '⏳' : '📧'}
              </div>
              <div className="status-text">
                <strong>Email Status:</strong> {
                  credentials.email_status === 'sent' ? 'Credentials sent successfully to ' + credentials.email :
                  credentials.email_status === 'failed' ? 'Failed to send email - ' + (credentials.email_error || 'Unknown error') :
                  credentials.email_status === 'queued' ? 'Email queued for sending' :
                  'Email not configured - please share credentials manually'
                }
                {credentials.email_status === 'failed' && (
                  <div className="email-help">
                    <a href="http://localhost:8000/email-setup-help" target="_blank" rel="noopener noreferrer">
                      📖 View email setup instructions
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="warning-box">
              <div className="warning-icon">⚠️</div>
              <div className="warning-text">
                <strong>Important:</strong> These credentials have been automatically generated. 
                Please save them securely and ask the user to change their password after first login.
              </div>
            </div>

            <div className="actions">
              <button className="copy-all-button" onClick={copyAllCredentials}>
                {copied === 'all' ? '✓ Copied!' : '📋 Copy All Credentials'}
              </button>
              <button className="close-action-button" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .overlay {
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
  }

  .popup {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .header {
    display: flex;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
    gap: 15px;
  }

  .icon-container {
    width: 40px;
    height: 40px;
    background-color: #10b981;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .icon {
    width: 20px;
    height: 20px;
    color: white;
  }

  .title-container {
    flex: 1;
  }

  .title {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }

  .subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 4px 0 0 0;
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    color: #6b7280;
    transition: color 0.2s;
  }

  .close-button:hover {
    color: #374151;
  }

  .close-button svg {
    width: 16px;
    height: 16px;
  }

  .content {
    padding: 20px;
  }

  .credentials-grid {
    display: grid;
    gap: 16px;
    margin-bottom: 20px;
  }

  .credential-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .credential-item label {
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .credential-value {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 10px 12px;
    gap: 8px;
  }

  .credential-value span {
    flex: 1;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    color: #1f2937;
  }

  .credential-text {
    font-weight: 600;
  }

  .password {
    background: linear-gradient(45deg, #ef4444, #f97316);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
  }

  .role-badge {
    background-color: #3b82f6;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
  }

  .copy-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .copy-button:hover {
    background-color: #e5e7eb;
  }

  .email-status-box {
    display: flex;
    gap: 12px;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 16px;
  }

  .email-status-box.sent {
    background-color: #d1fae5;
    border: 1px solid #10b981;
  }

  .email-status-box.failed {
    background-color: #fee2e2;
    border: 1px solid #ef4444;
  }

  .email-status-box.queued {
    background-color: #dbeafe;
    border: 1px solid #3b82f6;
  }

  .email-status-box.not_sent {
    background-color: #f3f4f6;
    border: 1px solid #6b7280;
  }

  .status-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .status-text {
    font-size: 13px;
    line-height: 1.4;
  }

  .email-status-box.sent .status-text {
    color: #065f46;
  }

  .email-status-box.failed .status-text {
    color: #991b1b;
  }

  .email-status-box.queued .status-text {
    color: #1e40af;
  }

  .email-status-box.not_sent .status-text {
    color: #374151;
  }

  .email-help {
    margin-top: 8px;
  }

  .email-help a {
    color: #3b82f6;
    text-decoration: none;
    font-size: 12px;
  }

  .email-help a:hover {
    text-decoration: underline;
  }

  .warning-box {
    display: flex;
    gap: 12px;
    background-color: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 20px;
  }

  .warning-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .warning-text {
    font-size: 13px;
    color: #92400e;
    line-height: 1.4;
  }

  .actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .copy-all-button {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .copy-all-button:hover {
    background-color: #2563eb;
  }

  .close-action-button {
    background-color: #6b7280;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .close-action-button:hover {
    background-color: #4b5563;
  }
`;

export default UserCredentialsPopup;