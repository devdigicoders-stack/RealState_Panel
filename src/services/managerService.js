import { apiClient } from './apiClient';

export const managerService = {
  // 1. Dashboard Live Metrics & Action Feeds
  getDashboardStats: async () => {
    return await apiClient('/manager/dashboard');
  },

  // 2. Assign Fresh Lead to Sales Executive
  assignLead: async (leadId, executiveId) => {
    return await apiClient('/manager/assign-lead', {
      method: 'POST',
      body: { leadId, executiveId }
    });
  },

  // 3. Leads Management
  getLeads: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/manager/leads${query ? `?${query}` : ''}`);
  },

  // 4. Calls Management
  getCalls: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/manager/calls${query ? `?${query}` : ''}`);
  },

  // 5. Site Visits Management
  getSiteVisits: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/manager/site-visits${query ? `?${query}` : ''}`);
  },
  updateSiteVisit: async (id, data) => {
    return await apiClient(`/manager/site-visits/${id}`, {
      method: 'PUT',
      body: data
    });
  },

  // 6. Bookings Management & Review
  getBookings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/manager/bookings${query ? `?${query}` : ''}`);
  },
  reviewBooking: async (id, action, remarks = '') => {
    return await apiClient(`/manager/bookings/${id}/review`, {
      method: 'PUT',
      body: { action, remarks }
    });
  },

  // 7. Team Performance Leaderboard
  getPerformance: async () => {
    return await apiClient('/manager/performance');
  }
};
