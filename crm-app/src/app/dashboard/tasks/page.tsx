'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TaskList from '@/components/tasks/TaskList'

export default function TasksPage() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'sales_manager', 'sales_executive', 'support_agent']}>
      <DashboardLayout>
        <TaskList />
      </DashboardLayout>
    </ProtectedRoute>
  )
}