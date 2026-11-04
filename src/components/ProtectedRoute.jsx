import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute: checks if user is logged in and if they have permission to access the route.
 * Prevents unauthorized URL typing bypass.
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to login preserving destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles required and user role is not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If superadmin tries to enter company routes, or vice versa, redirect them to their respective dashboard
    if (user.role === 'superadmin') {
      return <Navigate to="/superadmin/dashboard" replace />;
    } else {
      return <Navigate to={`/${user.role}/dashboard`} replace />;
    }
  }

  return children;
};

