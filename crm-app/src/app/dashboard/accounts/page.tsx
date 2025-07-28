import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ComingSoonPage from '@/components/common/ComingSoonPage'

export default function AccountsPage() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'sales_manager', 'sales_executive']}>
      <DashboardLayout>
        <ComingSoonPage
          title="Account Management"
          description="Powerful account management tools to track companies, manage relationships, and drive business growth."
          icon="🏢"
          features={[
            "Company profile management with detailed information",
            "Account hierarchy and relationship tracking",
            "Revenue and opportunity tracking per account",
            "Account health scoring and alerts",
            "Territory and account assignment management",
            "Account-based marketing integration",
            "Custom fields and account categorization"
          ]}
          expectedDate="Q2 2024"
          contactInfo="support@crm.com"
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}