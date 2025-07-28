import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ComingSoonPage from '@/components/common/ComingSoonPage'

export default function AutomationPage() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'sales_manager']}>
      <DashboardLayout>
        <ComingSoonPage
          title="Workflow Automation"
          description="Powerful automation engine to streamline your business processes and eliminate repetitive tasks."
          icon="⚙️"
          features={[
            "Visual workflow builder with drag-and-drop interface",
            "Trigger-based automation for leads, deals, and tasks",
            "Conditional logic and branching workflows",
            "Automated email sequences and notifications",
            "Data validation and field update automation",
            "Integration with external systems and APIs",
            "Workflow analytics and performance monitoring"
          ]}
          expectedDate="Q4 2024"
          contactInfo="support@crm.com"
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}