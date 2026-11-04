import { apiClient } from './apiClient';

export const authService = {
  // Universal Login (SuperAdmin, Company Admin, Manager, Sales User, Agent)
  login: async (email, password) => {
    return await apiClient('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  },

  // Get current user profile from token
  getProfile: async () => {
    return await apiClient('/auth/me');
  },

  // Update profile for any logged in user
  updateProfile: async (data) => {
    return await apiClient('/auth/update-profile', {
      method: 'PUT',
      body: data
    });
  },

  // Change password for any logged in user
  changePassword: async (currentPassword, newPassword) => {
    return await apiClient('/auth/change-password', {
      method: 'PUT',
      body: { currentPassword, newPassword }
    });
  }
};

