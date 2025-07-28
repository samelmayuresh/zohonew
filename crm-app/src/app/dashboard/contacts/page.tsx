import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ComingSoonPage from '@/components/common/ComingSoonPage'

export default function ContactsPage() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'sales_manager', 'sales_executive']}>
      <DashboardLayout>
        <ComingSoonPage
          title="Contact Management"
          description="Comprehensive contact management system to organize and track all your customer relationships in one place."
          icon="👥"
          features={[
            "Centralized contact database with detailed profiles",
            "Contact segmentation and tagging system",
            "Communication history tracking",
            "Contact import/export functionality",
            "Advanced search and filtering options",
            "Contact relationship mapping",
            "Integration with email and phone systems"
          ]}
          expectedDate="Q2 2024"
          contactInfo="support@crm.com"
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}