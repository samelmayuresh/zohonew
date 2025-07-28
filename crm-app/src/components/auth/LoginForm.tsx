'use client'

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter, useSearchParams } from 'next/navigation';

interface LoginFormProps {
  onLogin?: (token: string, user: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        console.log('Login successful:', data.user);
        
        if (onLogin) {
          onLogin(data.access_token, data.user);
        }

        // Redirect to intended page or dashboard
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        console.log('Redirecting to:', redirectTo);
        
        // Force a page reload to ensure the authentication state is updated
        window.location.href = redirectTo;
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="container">
        <div className="form_area">
          <p className="title">CRM LOGIN</p>
          {error && <div className="error_message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form_group">
              <label className="sub_title" htmlFor="username">Username</label>
              <input
                placeholder="Enter your username"
                id="username"
                name="username"
                className="form_style"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form_group">
              <label className="sub_title" htmlFor="password">Password</label>
              <input
                placeholder="Enter your password"
                id="password"
                name="password"
                className="form_style"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'LOGGING IN...' : 'LOGIN'}
              </button>
              <p className="demo_credentials">
                Demo: superadmin / admin123
              </p>
            </div>
          </form>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .form_area {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: #EDDCD9;
    height: auto;
    width: auto;
    border: 2px solid #264143;
    border-radius: 20px;
    box-shadow: 3px 4px 0px 1px #E99F4C;
    padding: 20px;
  }

  .title {
    color: #264143;
    font-weight: 900;
    font-size: 1.8em;
    margin-top: 10px;
    margin-bottom: 20px;
  }

  .error_message {
    background-color: #ffebee;
    color: #c62828;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 15px;
    border: 1px solid #ef5350;
    width: 290px;
    text-align: center;
    font-size: 14px;
  }

  .sub_title {
    font-weight: 600;
    margin: 5px 0;
    color: #264143;
  }

  .form_group {
    display: flex;
    flex-direction: column;
    align-items: baseline;
    margin: 10px;
  }

  .form_style {
    outline: none;
    border: 2px solid #264143;
    box-shadow: 3px 4px 0px 1px #E99F4C;
    width: 290px;
    padding: 12px 10px;
    border-radius: 4px;
    font-size: 15px;
    transition: all 0.2s ease;
  }

  .form_style:focus {
    transform: translateY(2px);
    box-shadow: 1px 2px 0px 0px #E99F4C;
  }

  .btn {
    padding: 15px;
    margin: 25px 0px 10px 0px;
    width: 290px;
    font-size: 15px;
    background: #DE5499;
    border: 2px solid #264143;
    border-radius: 10px;
    font-weight: 800;
    box-shadow: 3px 3px 0px 0px #E99F4C;
    cursor: pointer;
    transition: all 0.2s ease;
    color: white;
  }

  .btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(1px);
    box-shadow: 2px 2px 0px 0px #E99F4C;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .demo_credentials {
    font-size: 12px;
    color: #666;
    margin: 5px 0;
    font-style: italic;
  }
`;

export default LoginForm;