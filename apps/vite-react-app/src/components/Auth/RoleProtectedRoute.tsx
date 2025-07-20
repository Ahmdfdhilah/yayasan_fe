import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { USER_ROLES, type UserRole } from '@/lib/constants';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  fallback?: ReactNode;
  requireRoles?: boolean; 
}

export function RoleProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/',
  fallback,
  requireRoles = false
}: RoleProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Get user roles (PKG system uses roles array)
  const userRoles = user?.roles || [];
  const hasRole = userRoles.length > 0;

  // If route requires roles but user has none, redirect to home
  if (requireRoles && !hasRole) {
    return <Navigate to="/" replace />;
  }

  // If no specific roles required, allow access to authenticated users
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has any of the required roles
  const hasAccess = allowedRoles.some(role => userRoles.includes(role));

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

// Guard for routes that require user to have ANY role assigned
export function RequireRoles({ 
  children, 
  redirectTo = '/',
  fallback 
}: { 
  children: ReactNode; 
  redirectTo?: string;
  fallback?: ReactNode;
}) {
  return (
    <RoleProtectedRoute 
      requireRoles={true} 
      redirectTo={redirectTo}
      fallback={fallback}
    >
      {children}
    </RoleProtectedRoute>
  );
}

// Guard for routes that are ONLY for users without roles
export function NoRolesOnly({ 
  children, 
  redirectTo = '/',
  fallback 
}: { 
  children: ReactNode; 
  redirectTo?: string;
  fallback?: ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRole = user?.roles && user.roles.length > 0;

  // If user has roles, redirect them away from this route
  if (hasRole) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

// Guard for home page accessible to users with or without roles
export function HomePageGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Hook to check role access in components
export function useRoleAccess() {
  const { user } = useAuth();
  
  const userRoles = user?.roles || [];
  const primaryRole = userRoles[0] || null;
  const hasRole = userRoles.length > 0;

  const checkRole = (role: UserRole | UserRole[]) => {
    if (userRoles.length === 0) return false;
    const rolesToCheck = Array.isArray(role) ? role : [role];
    return rolesToCheck.some(r => userRoles.includes(r));
  };

  const hasAnyRole = (roles: UserRole[]) => {
    if (userRoles.length === 0) return false;
    return roles.some(role => userRoles.includes(role));
  };

  const hasAllRoles = (roles: UserRole[]) => {
    if (userRoles.length === 0) return false;
    return roles.every(role => userRoles.includes(role));
  };

  const isAdmin = userRoles.includes(USER_ROLES.ADMIN);
  const isGuru = userRoles.includes(USER_ROLES.GURU);
  const isKepalaSekolah = userRoles.includes(USER_ROLES.KEPALA_SEKOLAH);

  return {
    userRoles,
    primaryRole,
    hasRole,
    checkRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isGuru,
    isKepalaSekolah,
  };
}