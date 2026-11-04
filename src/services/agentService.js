import { apiClient } from './apiClient';

export const agentService = {
  // 1. Dashboard
  getDashboard: async () => {
    return await apiClient('/agent/dashboard');
  },

  // 2. Projects & Plots
  getProjects: async () => {
    return await apiClient('/agent/projects');
  },
  getPlots: async (projectId) => {
    return await apiClient(`/agent/plots${projectId ? `?projectId=${projectId}` : ''}`);
  },

  // 3. Leads
  getMyLeads: async () => {
    return await apiClient('/agent/leads');
  },
  createLead: async (data) => {
    return await apiClient('/agent/leads', {
      method: 'POST',
      body: data
    });
  },

  // 4. Site Visits
  getMySiteVisits: async () => {
    return await apiClient('/agent/site-visits');
  },
  requestSiteVisit: async (data) => {
    return await apiClient('/agent/site-visits', {
      method: 'POST',
      body: data
    });
  },

  // 5. Bookings
  getMyBookings: async () => {
    return await apiClient('/agent/bookings');
  },

  // 6. Commissions
  getMyCommissions: async () => {
    return await apiClient('/agent/commissions');
  },

  // 7. Customers
  getMyCustomers: async () => {
    return await apiClient('/agent/customers');
  }
};

