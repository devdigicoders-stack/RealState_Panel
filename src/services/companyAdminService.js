import { apiClient } from './apiClient';

export const companyAdminService = {
  // 1. Profile & Settings
  getProfile: async () => {
    return await apiClient('/company-admin/profile');
  },
  updateProfile: async (profileData) => {
    return await apiClient('/company-admin/profile', {
      method: 'PUT',
      body: profileData
    });
  },

  // 2. Dashboard
  getDashboardStats: async () => {
    return await apiClient('/company-admin/dashboard');
  },
  quickAddLead: async (leadData) => {
    return await apiClient('/company-admin/dashboard/quick-lead', {
      method: 'POST',
      body: leadData
    });
  },
  approveBooking: async (bookingId) => {
    return await apiClient(`/company-admin/dashboard/bookings/${bookingId}/approve`, {
      method: 'PUT'
    });
  },

  // 3. Branches
  getBranches: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/company-admin/branches${query ? `?${query}` : ''}`);
  },
  getBranchDetail: async (id) => {
    return await apiClient(`/company-admin/branches/${id}`);
  },
  createBranch: async (branchData) => {
    return await apiClient('/company-admin/branches', {
      method: 'POST',
      body: branchData
    });
  },
  updateBranch: async (id, branchData) => {
    return await apiClient(`/company-admin/branches/${id}`, {
      method: 'PUT',
      body: branchData
    });
  },
  deleteBranch: async (id) => {
    return await apiClient(`/company-admin/branches/${id}`, {
      method: 'DELETE'
    });
  },

  // 4. Leads
  getLeads: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/company-admin/leads${query ? `?${query}` : ''}`);
  },
  createLead: async (leadData) => {
    return await apiClient('/company-admin/leads', {
      method: 'POST',
      body: leadData
    });
  },
  updateLead: async (id, leadData) => {
    return await apiClient(`/company-admin/leads/${id}`, {
      method: 'PUT',
      body: leadData
    });
  },
  deleteLead: async (id) => {
    return await apiClient(`/company-admin/leads/${id}`, {
      method: 'DELETE'
    });
  },

  // 5. Projects
  getProjects: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/company-admin/projects${query ? `?${query}` : ''}`);
  },
  createProject: async (projectData) => {
    return await apiClient('/company-admin/projects', {
      method: 'POST',
      body: projectData
    });
  },
  updateProject: async (id, projectData) => {
    return await apiClient(`/company-admin/projects/${id}`, {
      method: 'PUT',
      body: projectData
    });
  },
  deleteProject: async (id) => {
    return await apiClient(`/company-admin/projects/${id}`, {
      method: 'DELETE'
    });
  },

  // 6. Plots
  getPlots: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/company-admin/plots${query ? `?${query}` : ''}`);
  },
  createPlot: async (plotData) => {
    return await apiClient('/company-admin/plots', {
      method: 'POST',
      body: plotData
    });
  },
  updatePlot: async (id, plotData) => {
    return await apiClient(`/company-admin/plots/${id}`, {
      method: 'PUT',
      body: plotData
    });
  },
  deletePlot: async (id) => {
    return await apiClient(`/company-admin/plots/${id}`, {
      method: 'DELETE'
    });
  },

  // 7. Calling
  getCallLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/company-admin/calling${query ? `?${query}` : ''}`);
  },
  createCallLog: async (callData) => {
    return await apiClient('/company-admin/calling', {
      method: 'POST',
      body: callData
    });
  },

  // 8. Bookings
  getBookings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/company-admin/bookings${query ? `?${query}` : ''}`);
  },
  createBooking: async (bookingData) => {
    return await apiClient('/company-admin/bookings', {
      method: 'POST',
      body: bookingData
    });
  },
  updateBooking: async (id, bookingData) => {
    return await apiClient(`/company-admin/bookings/${id}`, {
      method: 'PUT',
      body: bookingData
    });
  },
  deleteBooking: async (id) => {
    return await apiClient(`/company-admin/bookings/${id}`, {
      method: 'DELETE'
    });
  },

  // 9. Site Visits
  getSiteVisits: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/company-admin/site-visits${query ? `?${query}` : ''}`);
  },
  createSiteVisit: async (visitData) => {
    return await apiClient('/company-admin/site-visits', {
      method: 'POST',
      body: visitData
    });
  },
  updateSiteVisit: async (id, visitData) => {
    return await apiClient(`/company-admin/site-visits/${id}`, {
      method: 'PUT',
      body: visitData
    });
  },
  deleteSiteVisit: async (id) => {
    return await apiClient(`/company-admin/site-visits/${id}`, {
      method: 'DELETE'
    });
  },

  // 10. Team / Staff
  getTeamMembers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/company-admin/team${query ? `?${query}` : ''}`);
  },
  getTeamMemberDetail: async (id) => {
    return await apiClient(`/company-admin/team/${id}`);
  },
  createTeamMember: async (memberData) => {
    return await apiClient('/company-admin/team', {
      method: 'POST',
      body: memberData
    });
  },
  updateTeamMember: async (id, memberData) => {
    return await apiClient(`/company-admin/team/${id}`, {
      method: 'PUT',
      body: memberData
    });
  },
  updateTeamMemberApproval: async (id, actionData) => {
    return await apiClient(`/company-admin/team/${id}/approval`, {
      method: 'PUT',
      body: actionData
    });
  },
  deleteTeamMember: async (id) => {
    return await apiClient(`/company-admin/team/${id}`, {
      method: 'DELETE'
    });
  },

  // 11. Customers
  getCustomers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/company-admin/customers${query ? `?${query}` : ''}`);
  },

  // 12. Agents / Channel Partners
  getAgents: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/company-admin/agents${query ? `?${query}` : ''}`);
  },
  getAgentDetail: async (id) => {
    return await apiClient(`/company-admin/agents/${id}`);
  },
  createAgent: async (agentData) => {
    return await apiClient('/company-admin/agents', {
      method: 'POST',
      body: agentData
    });
  },
  updateAgent: async (id, agentData) => {
    return await apiClient(`/company-admin/agents/${id}`, {
      method: 'PUT',
      body: agentData
    });
  },
  updateAgentApproval: async (id, actionData) => {
    return await apiClient(`/company-admin/agents/${id}/approval`, {
      method: 'PUT',
      body: actionData
    });
  },
  deleteAgent: async (id) => {
    return await apiClient(`/company-admin/agents/${id}`, {
      method: 'DELETE'
    });
  },

  // 13. Finance Ledger
  getFinanceTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/company-admin/finance${query ? `?${query}` : ''}`);
  },

  // 14. Reports
  getReports: async () => {
    return await apiClient('/company-admin/reports');
  }
};

