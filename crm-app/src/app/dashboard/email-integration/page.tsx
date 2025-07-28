import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ComingSoonPage from '@/components/common/ComingSoonPage'

export default function EmailIntegrationPage() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'sales_manager', 'sales_executive']}>
      <DashboardLayout>
        <ComingSoonPage
          title="Email Integration"
          description="Seamless email integration to manage all your customer communications directly within the CRM."
          icon="📧"
          features={[
            "Two-way email synchronization with Gmail, Outlook",
            "Email templates and automated sequences",
            "Email tracking and open/click analytics",
            "Bulk email campaigns with personalization",
            "Email scheduling and follow-up reminders",
            "Conversation threading and history",
            "Email-to-lead and email-to-case conversion"
          ]}
          expectedDate="Q3 2024"
          contactInfo="support@crm.com"
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}