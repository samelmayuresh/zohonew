import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function Loading() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: '#f8fafc'
    }}>
      <LoadingSpinner size="large" message="Loading application..." />
    </div>
  )
}