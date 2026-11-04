import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Login } from './pages/Login';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { CompaniesMaster } from './pages/CompaniesMaster';
import { CompanyDetail } from './pages/CompanyDetail';
import { SubscriptionPlans } from './pages/SubscriptionPlans';
import { PlanCompaniesDetail } from './pages/PlanCompaniesDetail';
import { SuperAdminCompanySubscriptions } from './pages/SuperAdminCompanySubscriptions';
import { SuperAdminRenewals } from './pages/SuperAdminRenewals';
import { SuperAdminLimits } from './pages/SuperAdminLimits';
import { SuperAdminModules } from './pages/SuperAdminModules';
import { SuperAdminCallingProviders } from './pages/SuperAdminCallingProviders';
import { SuperAdminMessagingIntegrations } from './pages/SuperAdminMessagingIntegrations';
import { SuperAdminTransactions } from './pages/SuperAdminTransactions';
import { SuperAdminSupport } from './pages/SuperAdminSupport';
import { SuperAdminReports } from './pages/SuperAdminReports';
import { SuperAdminSettings } from './pages/SuperAdminSettings';
import { SuperAdminProfile } from './pages/SuperAdminProfile';
import { SuperAdminEnquiries } from './pages/SuperAdminEnquiries';

import { CompanyAdminDashboard } from './pages/company_admin/CompanyAdminDashboard';
import { CompanyAdminProfile } from './pages/company_admin/CompanyAdminProfile';
import { CompanyAdminBranches } from './pages/company_admin/CompanyAdminBranches';
import { CompanyAdminBranchDetail } from './pages/company_admin/CompanyAdminBranchDetail';
import { CompanyAdminLeads } from './pages/company_admin/CompanyAdminLeads';
import { CompanyAdminCalling } from './pages/company_admin/CompanyAdminCalling';
import { CompanyAdminProjects } from './pages/company_admin/CompanyAdminProjects';
import { CompanyAdminPlots } from './pages/company_admin/CompanyAdminPlots';
import { CompanyAdminSiteVisits } from './pages/company_admin/CompanyAdminSiteVisits';
import { CompanyAdminBookings } from './pages/company_admin/CompanyAdminBookings';
import { CompanyAdminCustomers } from './pages/company_admin/CompanyAdminCustomers';
import { CompanyAdminAgents } from './pages/company_admin/CompanyAdminAgents';
import { CompanyAdminAgentDetail } from './pages/company_admin/CompanyAdminAgentDetail';
import { CompanyAdminFinance } from './pages/company_admin/CompanyAdminFinance';
import { CompanyAdminTeam } from './pages/company_admin/CompanyAdminTeam';
import { CompanyAdminTeamDetail } from './pages/company_admin/CompanyAdminTeamDetail';
import { CompanyAdminReports } from './pages/company_admin/CompanyAdminReports';
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { ManagerLeads } from './pages/manager/ManagerLeads';
import { ManagerCalls } from './pages/manager/ManagerCalls';
import { ManagerSiteVisits } from './pages/manager/ManagerSiteVisits';
import { ManagerBookings } from './pages/manager/ManagerBookings';
import { ManagerPerformance } from './pages/manager/ManagerPerformance';
import { SalesUserDashboard } from './pages/SalesUserDashboard';
import { SalesUserLeads } from './pages/sales_user/SalesUserLeads';
import { SalesUserCalls } from './pages/sales_user/SalesUserCalls';
import { SalesUserFollowups } from './pages/sales_user/SalesUserFollowups';
import { SalesUserSiteVisits } from './pages/sales_user/SalesUserSiteVisits';
import { SalesUserBookings } from './pages/sales_user/SalesUserBookings';
import { SalesUserCustomers } from './pages/sales_user/SalesUserCustomers';

import { AgentDashboard } from './pages/AgentDashboard';
import { AgentProjects } from './pages/agent/AgentProjects';
import { AgentLeads } from './pages/agent/AgentLeads';
import { AgentSiteVisits } from './pages/agent/AgentSiteVisits';
import { AgentBookings } from './pages/agent/AgentBookings';
import { AgentCommissions } from './pages/agent/AgentCommissions';
import { UniversalUserProfile } from './pages/UniversalUserProfile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Root Redirect based on Role */}
        <Route
          path="/"
          element={
            user ? (
              user.role === 'superadmin' ? (
                <Navigate to="/superadmin/dashboard" replace />
              ) : (
                <Navigate to={`/${user.role}/dashboard`} replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* =========================================================================
            PLATFORM SUPER ADMIN EXACT SPECIFICATION ROUTES
            1.  Dashboard
            2. All Registered Companies (with Activation / Deactivation)
            3. Subscription Plans
            4. Company Subscriptions
            5. Plan Expiry / Renewal
            6. Company User Limits & Project Limits
            7. Available Modules
            8. Calling Integration Providers
            9. WhatsApp & SMS Integrations
            10.  Transactions
            11. Support Requests
            12. Platform Reports
            13. System Settings
            14. Profile & Security
           ========================================================================= */}
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/companies"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <CompaniesMaster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/companies/:id"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <CompanyDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/plans"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SubscriptionPlans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/plans/:id/companies"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <PlanCompaniesDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/subscriptions"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminCompanySubscriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/renewals"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminRenewals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/limits"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminLimits />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/modules"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminModules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/calling-providers"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminCallingProviders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/messaging-integrations"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminMessagingIntegrations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/transactions"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminTransactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/support"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminSupport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/reports"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/settings"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/enquiries"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminEnquiries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/profile"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminProfile />
            </ProtectedRoute>
          }
        />

        {/* 2. COMPANY ADMIN SPECIFICATION ROUTES */}
        <Route
          path="/company_admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company_admin/profile"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company_admin/branches"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminBranches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company_admin/branches/:id"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminBranchDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company_admin/leads"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminLeads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company_admin/calling"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminCalling />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company_admin/projects"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company_admin/plots"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminPlots />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company_admin/site-visits"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminSiteVisits />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company_admin/bookings"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company_admin/customers"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminCustomers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company_admin/agents"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminAgents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company_admin/agents/:id"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminAgentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company_admin/finance"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminFinance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company_admin/team"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminTeam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company_admin/team/:id"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminTeamDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company_admin/reports"
          element={
            <ProtectedRoute allowedRoles={['company_admin']}>
              <CompanyAdminReports />
            </ProtectedRoute>
          }
        />

        {/* 3. MANAGER ROUTES */}
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/leads"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerLeads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/calls"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerCalls />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/site-visits"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerSiteVisits />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/plots"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <CompanyAdminPlots />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/bookings"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/customers"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <CompanyAdminCustomers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/agents"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <CompanyAdminAgents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/agents/:id"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <CompanyAdminAgentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/performance"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerPerformance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/team"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <CompanyAdminTeam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/team/:id"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <CompanyAdminTeamDetail />
            </ProtectedRoute>
          }
        />

        {/* 4. SALES USER EXACT ROUTES */}
        <Route
          path="/sales_user/dashboard"
          element={
            <ProtectedRoute allowedRoles={['sales_user']}>
              <SalesUserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales_user/leads"
          element={
            <ProtectedRoute allowedRoles={['sales_user']}>
              <SalesUserLeads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales_user/calls"
          element={
            <ProtectedRoute allowedRoles={['sales_user']}>
              <SalesUserCalls />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales_user/follow-ups"
          element={
            <ProtectedRoute allowedRoles={['sales_user']}>
              <SalesUserFollowups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales_user/site-visits"
          element={
            <ProtectedRoute allowedRoles={['sales_user']}>
              <SalesUserSiteVisits />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales_user/plots"
          element={
            <ProtectedRoute allowedRoles={['sales_user']}>
              <CompanyAdminPlots />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales_user/bookings"
          element={
            <ProtectedRoute allowedRoles={['sales_user']}>
              <SalesUserBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales_user/customers"
          element={
            <ProtectedRoute allowedRoles={['sales_user']}>
              <SalesUserCustomers />
            </ProtectedRoute>
          }
        />

        {/* 5. AGENT / BROKER EXACT ROUTES */}
        <Route
          path="/agent/dashboard"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/projects"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <AgentProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/plots"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <CompanyAdminPlots />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/leads"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <AgentLeads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/site-visits"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <AgentSiteVisits />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/bookings"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <AgentBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/commissions"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <AgentCommissions />
            </ProtectedRoute>
          }
        />

        {/* Universal Profile & Password Change (Available to Manager, Sales User, Agent, Company Admin) */}
        <Route
          path="/manager/profile"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <UniversalUserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales_user/profile"
          element={
            <ProtectedRoute allowedRoles={['sales_user']}>
              <UniversalUserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent/profile"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <UniversalUserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UniversalUserProfile />
            </ProtectedRoute>
          }
        />

        {/* Generic Dashboard Fallback */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {user ? (
                user.role === 'superadmin' ? (
                  <Navigate to="/superadmin/dashboard" replace />
                ) : (
                  <Navigate to={`/${user.role}/dashboard`} replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )}
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
