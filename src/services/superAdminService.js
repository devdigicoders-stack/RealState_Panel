import { apiClient } from './apiClient';

export const superAdminService = {
  // 1. Auth & Profile
  login: async (email, password) => {
    return await apiClient('/superadmin/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  },
  getProfile: async () => {
    return await apiClient('/superadmin/auth/me');
  },
  updateProfile: async (profileData) => {
    return await apiClient('/superadmin/auth/profile', {
      method: 'PUT',
      body: profileData
    });
  },
  changePassword: async (passwordData) => {
    return await apiClient('/superadmin/auth/change-password', {
      method: 'PUT',
      body: passwordData
    });
  },

  // 2. Dashboard KPIs & Metrics
  getDashboardStats: async () => {
    return await apiClient('/superadmin/dashboard/stats');
  },

  // 3. Companies Master
  getCompanies: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/superadmin/companies?${query}`);
  },
  getCompanyById: async (id) => {
    return await apiClient(`/superadmin/companies/${id}`);
  },
  createCompany: async (companyData) => {
    return await apiClient('/superadmin/companies', {
      method: 'POST',
      body: companyData
    });
  },
  updateCompany: async (id, companyData) => {
    return await apiClient(`/superadmin/companies/${id}`, {
      method: 'PUT',
      body: companyData
    });
  },
  toggleCompanyStatus: async (id, status) => {
    return await apiClient(`/superadmin/companies/${id}/status`, {
      method: 'PUT',
      body: { status }
    });
  },
  deleteCompany: async (id) => {
    return await apiClient(`/superadmin/companies/${id}`, {
      method: 'DELETE'
    });
  },

  // 4. Plans Master
  getPlans: async () => {
    return await apiClient('/superadmin/plans');
  },
  getPlanCompanies: async (id) => {
    return await apiClient(`/superadmin/plans/${id}/companies`);
  },
  createPlan: async (planData) => {
    return await apiClient('/superadmin/plans', {
      method: 'POST',
      body: planData
    });
  },
  updatePlan: async (id, planData) => {
    return await apiClient(`/superadmin/plans/${id}`, {
      method: 'PUT',
      body: planData
    });
  },
  deletePlan: async (id) => {
    return await apiClient(`/superadmin/plans/${id}`, {
      method: 'DELETE'
    });
  },

  // 5. Operations: Renewals & Limits
  getRenewals: async () => {
    return await apiClient('/superadmin/renewals');
  },
  renewCompanyLicense: async (companyId) => {
    return await apiClient(`/superadmin/renewals/${companyId}`, {
      method: 'POST'
    });
  },
  getCompanyLimits: async () => {
    return await apiClient('/superadmin/limits');
  },
  adjustLimits: async (companyId, limits) => {
    return await apiClient(`/superadmin/limits/${companyId}`, {
      method: 'PUT',
      body: limits
    });
  },

  // 6. Modules Master
  getModules: async () => {
    return await apiClient('/superadmin/modules');
  },
  createModule: async (moduleData) => {
    return await apiClient('/superadmin/modules', {
      method: 'POST',
      body: moduleData
    });
  },
  toggleModuleStatus: async (id, active) => {
    return await apiClient(`/superadmin/modules/${id}/toggle`, {
      method: 'PUT',
      body: { active }
    });
  },
  updateModulePlans: async (id, plans) => {
    return await apiClient(`/superadmin/modules/${id}/plans`, {
      method: 'PUT',
      body: { plans }
    });
  },

  // 7. Calling Providers
  getCallingProviders: async () => {
    return await apiClient('/superadmin/calling-providers');
  },
  updateCallingProvider: async (id, providerData) => {
    return await apiClient(`/superadmin/calling-providers/${id}`, {
      method: 'PUT',
      body: providerData
    });
  },

  // 8. Messaging & WhatsApp Gateways
  getMessagingGateways: async () => {
    return await apiClient('/superadmin/messaging-gateways');
  },
  updateMessagingGateway: async (id, gatewayData) => {
    return await apiClient(`/superadmin/messaging-gateways/${id}`, {
      method: 'PUT',
      body: gatewayData
    });
  },

  // 9. Transactions & Billing
  getTransactions: async () => {
    return await apiClient('/superadmin/transactions');
  },

  // 10. Support Tickets
  getSupportTickets: async () => {
    return await apiClient('/superadmin/support');
  },
  updateSupportTicketStatus: async (id, status) => {
    return await apiClient(`/superadmin/support/${id}/status`, {
      method: 'PUT',
      body: { status }
    });
  },

  // 11. Platform Reports & BI
  getPlatformReports: async () => {
    return await apiClient('/superadmin/reports');
  },

  // 12. Global Settings
  getPlatformSettings: async () => {
    return await apiClient('/superadmin/settings');
  },
  updatePlatformSettings: async (settingsData) => {
    return await apiClient('/superadmin/settings', {
      method: 'PUT',
      body: settingsData
    });
  },

  // 13. Website Contact & Leads Enquiries
  getEnquiries: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/superadmin/enquiries?${query}`);
  },
  updateEnquiry: async (id, data) => {
    return await apiClient(`/superadmin/enquiries/${id}`, {
      method: 'PUT',
      body: data
    });
  },
  deleteEnquiry: async (id) => {
    return await apiClient(`/superadmin/enquiries/${id}`, {
      method: 'DELETE'
    });
  }
};
