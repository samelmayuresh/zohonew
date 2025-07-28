'use client'

import { useEffect } from 'react'
import styled from 'styled-components'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <StyledWrapper>
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h1>Something went wrong!</h1>
        <p>We encountered an unexpected error. Please try again.</p>
        <div className="error-actions">
          <button onClick={reset} className="retry-btn">
            Try again
          </button>
          <button onClick={() => window.location.href = '/dashboard'} className="home-btn">
            Go to Dashboard
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="error-details">
            <summary>Error Details (Development)</summary>
            <pre>{error.message}</pre>
            {error.stack && <pre>{error.stack}</pre>}
          </details>
        )}
      </div>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;

  .error-container {
    background: white;
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    width: 100%;
  }

  .error-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 12px 0;
  }

  p {
    font-size: 16px;
    color: #6b7280;
    margin: 0 0 32px 0;
    line-height: 1.5;
  }

  .error-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 32px;
  }

  .retry-btn, .home-btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .retry-btn {
    background: #3b82f6;
    color: white;
    border: 1px solid #3b82f6;
  }

  .retry-btn:hover {
    background: #2563eb;
  }

  .home-btn {
    background: white;
    color: #3b82f6;
    border: 1px solid #3b82f6;
  }

  .home-btn:hover {
    background: #f8fafc;
  }

  .error-details {
    text-align: left;
    margin-top: 20px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .error-details summary {
    cursor: pointer;
    font-weight: 500;
    color: #374151;
    margin-bottom: 12px;
  }

  .error-details pre {
    font-size: 12px;
    color: #6b7280;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 8px 0;
  }

  @media (max-width: 768px) {
    .error-actions {
      flex-direction: column;
    }

    .retry-btn, .home-btn {
      width: 100%;
    }
  }
`