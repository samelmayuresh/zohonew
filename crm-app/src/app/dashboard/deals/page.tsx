import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ComingSoonPage from '@/components/common/ComingSoonPage'

export default function DealsPage() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'sales_manager', 'sales_executive']}>
      <DashboardLayout>
        <ComingSoonPage
          title="Deal & Opportunity Management"
          description="Advanced deal tracking system to manage your sales pipeline and close more opportunities."
          icon="💼"
          features={[
            "Visual sales pipeline with drag-and-drop stages",
            "Deal probability and weighted forecasting",
            "Automated deal progression workflows",
            "Revenue tracking and deal analytics",
            "Competitor tracking and win/loss analysis",
            "Deal collaboration and team notifications",
            "Integration with proposal and contract systems"
          ]}
          expectedDate="Q3 2024"
          contactInfo="support@crm.com"
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}