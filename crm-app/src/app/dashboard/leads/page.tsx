'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LeadList from '@/components/leads/LeadList'

export default function LeadsPage() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'sales_manager', 'sales_executive']}>
      <DashboardLayout>
        <LeadList />
      </DashboardLayout>
    </ProtectedRoute>
  )
}