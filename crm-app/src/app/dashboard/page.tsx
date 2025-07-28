'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard'
import AdminDashboard from '@/components/dashboard/AdminDashboard'
import SalesManagerDashboard from '@/components/dashboard/SalesManagerDashboard'
import SalesExecutiveDashboard from '@/components/dashboard/SalesExecutiveDashboard'
import SupportAgentDashboard from '@/components/dashboard/SupportAgentDashboard'
import CustomerPortal from '@/components/dashboard/CustomerPortal'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user_data')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const renderDashboard = () => {
    if (loading) {
      return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
    }

    if (!user) {
      return <div style={{ padding: '20px', textAlign: 'center' }}>Please log in to access the dashboard.</div>
    }

    switch (user.role) {
      case 'super_admin':
        return <SuperAdminDashboard />
      case 'admin':
        return <AdminDashboard />
      case 'sales_manager':
        return <SalesManagerDashboard />
      case 'sales_executive':
        return <SalesExecutiveDashboard />
      case 'support_agent':
        return <SupportAgentDashboard />
      case 'customer':
        return <CustomerPortal />
      default:
        return (
          <div style={{ padding: '20px' }}>
            <h1>Unknown Role</h1>
            <p>Your role ({user.role}) is not recognized. Please contact an administrator.</p>
          </div>
        )
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {renderDashboard()}
      </DashboardLayout>
    </ProtectedRoute>
  )
}