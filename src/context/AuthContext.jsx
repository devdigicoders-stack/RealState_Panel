import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { superAdminService } from '../services/superAdminService';

const AuthContext = createContext();

export const DEMO_CREDENTIALS = [
  {
    role: 'superadmin',
    name: 'Super Administrator',
    email: 'superadmin@crm.com',
    password: 'password123',
    badge: 'Platform Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    description: 'Manages all companies, subscriptions, plans & platform settings'
  },
  {
    role: 'company_admin',
    name: 'Vikram Singhania (Owner)',
    email: 'admin@abcdevelopers.com',
    password: 'password123',
    badge: 'Company Admin / Owner',
    companyName: 'ABC Developers Pvt. Ltd.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    description: 'Full control of projects, plots, staff, leads & accounts'
  },
  {
    role: 'manager',
    name: 'Rajesh Sharma (Sales Head)',
    email: 'manager@abcdevelopers.com',
    password: 'password123',
    badge: 'Sales Manager',
    companyName: 'ABC Developers Pvt. Ltd.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    description: 'Manages team leads, calling pipeline, site visits & approvals'
  },
  {
    role: 'sales_user',
    name: 'Amit Kumar (Sales Exec)',
    email: 'sales@abcdevelopers.com',
    password: 'password123',
    badge: 'Sales Executive / Telecaller',
    companyName: 'ABC Developers Pvt. Ltd.',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    description: 'Handles client calls, follow-ups, visits & booking requests'
  },
  {
    role: 'agent',
    name: 'Sharma Properties (CP)',
    email: 'agent@sharmaproperties.com',
    password: 'password123',
    badge: 'Channel Partner / Broker',
    companyName: 'Sharma Properties Channel',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    description: 'Registers client leads, books plots, and tracks earned commissions'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('realestate_auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem('realestate_companies');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem('realestate_plans');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Verify stored session directly against MongoDB on app startup / page refresh
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('realestate_auth_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getProfile();
        if (res && res.success && res.user) {
          // Keep existing user metadata while updating profile info from database
          setUser(prev => ({
            ...(prev || {}),
            ...res.user,
            id: res.user._id || res.user.id,
            token
          }));
        } else {
          // User deleted from DB or invalid
          setUser(null);
          localStorage.removeItem('realestate_auth_user');
          localStorage.removeItem('realestate_auth_token');
        }
      } catch (err) {
        console.warn('[Session Verification Failed - User or DB unavailable]:', err.message);
        setUser(null);
        localStorage.removeItem('realestate_auth_user');
        localStorage.removeItem('realestate_auth_token');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('realestate_auth_user', JSON.stringify(user));
      if (user.token) {
        localStorage.setItem('realestate_auth_token', user.token);
      }
    } else {
      localStorage.removeItem('realestate_auth_user');
      localStorage.removeItem('realestate_auth_token');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('realestate_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('realestate_plans', JSON.stringify(plans));
  }, [plans]);

  const login = async (identifier, password) => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 100% Dynamic Authentication directly via Backend API & Database
    try {
      const backendRes = await authService.login(cleanId, cleanPass);
      if (backendRes && backendRes.success) {
        const authData = {
          ...backendRes.user,
          token: backendRes.token,
          loginTime: new Date().toISOString()
        };
        setUser(authData);
        return { success: true, user: authData };
      }
      return { 
        success: false, 
        message: backendRes?.message || 'Invalid email or password' 
      };
    } catch (apiErr) {
      console.error('[Backend Auth Error]:', apiErr.message);
      const errData = apiErr.response?.data || apiErr.data || {};
      return { 
        success: false, 
        isInactive: !!errData.isInactive,
        isPending: !!errData.isPending,
        isRejected: !!errData.isRejected,
        message: errData.message || apiErr.message || 'Authentication failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (roleKey) => {
    const matched = DEMO_CREDENTIALS.find(c => c.role === roleKey);
    if (matched) {
      const authData = {
        ...matched,
        token: 'token-' + Math.random().toString(36).substr(2),
        loginTime: new Date().toISOString()
      };
      setUser(authData);
    }
  };

  const updateUser = (updatedFields) => {
    setUser(prev => {
      if (!prev) return updatedFields;
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('realestate_auth_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
        updateUser,
        companies,
        setCompanies,
        plans,
        setPlans
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

