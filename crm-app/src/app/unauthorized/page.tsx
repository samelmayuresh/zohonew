'use client'

import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      textAlign: 'center'
    }}>
      <h1>Access Denied</h1>
      <p>You don't have permission to access this page.</p>
      <button 
        onClick={() => router.push('/dashboard')}
        style={{
          padding: '10px 20px',
          marginTop: '20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Go to Dashboard
      </button>
    </div>
  )
}