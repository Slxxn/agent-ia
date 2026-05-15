import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './AuthStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export default function AuthGuard({ children, requireAdmin = false, redirectTo = '/login' }: AuthGuardProps) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
