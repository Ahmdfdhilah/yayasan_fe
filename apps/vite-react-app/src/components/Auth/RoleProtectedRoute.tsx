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

  // Get user role (PKG system now uses single role field)
  const userRole = user?.role;
  const hasRole = !!userRole;

  // If route requires roles but user has none, redirect to home
  if (requireRoles && !hasRole) {
    return <Navigate to="/" replace />;
  }

  // If no specific roles required, allow access to authenticated users
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has the required role
  const hasAccess = allowedRoles.includes(userRole as UserRole);

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

  const hasRole = !!user?.role;

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
  
  const userRole = user?.role || null;
  const hasRole = !!userRole;

  const checkRole = (role: UserRole | UserRole[]) => {
    if (!userRole) return false;
    const rolesToCheck = Array.isArray(role) ? role : [role];
    return rolesToCheck.includes(userRole);
  };

  const hasAnyRole = (roles: UserRole[]) => {
    if (!userRole) return false;
    return roles.includes(userRole);
  };

  const hasAllRoles = (roles: UserRole[]) => {
    if (!userRole) return false;
    // With single role, user can only have all roles if there's only one role required
    return roles.length === 1 && roles.includes(userRole);
  };

  const isAdmin = userRole === USER_ROLES.ADMIN;
  const isGuru = userRole === USER_ROLES.GURU;
  const isKepalaSekolah = userRole === USER_ROLES.KEPALA_SEKOLAH;

  return {
    userRole,
    hasRole,
    checkRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isGuru,
    isKepalaSekolah,
  };
}