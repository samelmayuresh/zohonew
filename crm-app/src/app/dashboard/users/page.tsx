'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import UserList from '@/components/users/UserList'

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
      <DashboardLayout>
        <UserList />
      </DashboardLayout>
    </ProtectedRoute>
  )
}