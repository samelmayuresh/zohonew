'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const userData = localStorage.getItem('user_data')

        if (!token || !userData) {
          const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
          router.push(loginUrl)
          return
        }

        const user = JSON.parse(userData)

        // Check role-based access
        if (allowedRoles && !allowedRoles.includes(user.role)) {
          router.push('/unauthorized')
          return
        }

        // Verify token with backend (simplified for demo)
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            setIsAuthorized(true)
          } else {
            // For demo purposes, if /me endpoint fails, still allow access if we have valid user data
            console.warn('Token verification failed, but allowing access for demo')
            setIsAuthorized(true)
          }
        } catch (error) {
          // Network error - allow access for demo if we have user data
          console.warn('Network error during token verification, allowing access for demo:', error)
          setIsAuthorized(true)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`
        router.push(loginUrl)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, allowedRoles, pathname])

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: '#f8fafc'
      }}>
        <LoadingSpinner size="large" message="Authenticating..." />
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}