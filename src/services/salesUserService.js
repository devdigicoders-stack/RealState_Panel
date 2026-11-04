import { apiClient } from './apiClient';

export const salesUserService = {
  // Dashboard
  getDashboard: async () => {
    return await apiClient('/sales-user/dashboard');
  },

  // Leads
  getMyLeads: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/sales-user/leads${query ? `?${query}` : ''}`);
  },
  logCallDisposition: async (leadId, data) => {
    return await apiClient(`/sales-user/leads/${leadId}/call-disposition`, {
      method: 'PUT',
      body: data
    });
  },

  // Calls
  getMyCalls: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/sales-user/calls${query ? `?${query}` : ''}`);
  },

  // Follow-ups
  getMyFollowups: async () => {
    return await apiClient('/sales-user/follow-ups');
  },

  // Site Visits
  getMySiteVisits: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/sales-user/site-visits${query ? `?${query}` : ''}`);
  },
  scheduleSiteVisit: async (data) => {
    return await apiClient('/sales-user/site-visits', {
      method: 'POST',
      body: data
    });
  },
  updateSiteVisitFeedback: async (visitId, data) => {
    return await apiClient(`/sales-user/site-visits/${visitId}/feedback`, {
      method: 'PUT',
      body: data
    });
  },

  // Plot Hold
  requestPlotHold: async (plotId, data) => {
    return await apiClient(`/sales-user/plots/${plotId}/hold-request`, {
      method: 'PUT',
      body: data
    });
  },

  // Bookings
  getMyBookings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/sales-user/bookings${query ? `?${query}` : ''}`);
  },
  createBookingRequest: async (data) => {
    return await apiClient('/sales-user/bookings', {
      method: 'POST',
      body: data
    });
  },

  // Customers
  getMyCustomers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiClient(`/sales-user/customers${query ? `?${query}` : ''}`);
  }
};

