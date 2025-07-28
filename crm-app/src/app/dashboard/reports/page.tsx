import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ComingSoonPage from '@/components/common/ComingSoonPage'

export default function ReportsPage() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'sales_manager']}>
      <DashboardLayout>
        <ComingSoonPage
          title="Advanced Reports & Dashboards"
          description="Comprehensive reporting and analytics platform to gain deep insights into your business performance."
          icon="📊"
          features={[
            "Interactive dashboards with real-time data",
            "Customizable report builder with drag-and-drop",
            "Sales performance and pipeline analytics",
            "Team productivity and activity reports",
            "Revenue forecasting and trend analysis",
            "Automated report scheduling and distribution",
            "Data export in multiple formats (PDF, Excel, CSV)"
          ]}
          expectedDate="Q4 2024"
          contactInfo="support@crm.com"
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}