// apps/vite-react-app/src/components/Auth/AuthGuard.tsx
import React, { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireRoles?: string[];
  requireMfa?: boolean;
  redirectTo?: string;
  allowUnauthenticated?: boolean;
}

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  </div>
);

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback = null, 
  requireRoles = [],
  redirectTo = '/login',
  allowUnauthenticated = false
}) => {
  const { 
    isAuthenticated, 
    user, 
    loading, 
    checkAuth,
    isTokenValid 
  } = useAuth();
  const location = useLocation();

  // Check auth on mount and when location changes
  useEffect(() => {
    if (isAuthenticated && !isTokenValid()) {
      checkAuth();
    }
  }, [isAuthenticated, location.pathname]);

  // Show loading spinner while authentication is being checked
  if (loading) {
    return <LoadingSpinner message="Verifying authentication..." />;
  }

  // If unauthenticated access is allowed, render children
  if (allowUnauthenticated) {
    return <>{children}</>;
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check if user account is active
  if (!user.is_active) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Account Inactive</h2>
          <p className="text-muted-foreground">
            Your account has been deactivated. Please contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  // Note: Password change requirement should be handled by backend

  // Note: MFA requirements should be handled by backend

  // Check role requirements
  if (requireRoles.length > 0) {
    const hasRequiredRole = requireRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have the required permissions to access this page.
            </p>
            <p className="text-sm text-muted-foreground">
              Required roles: {requireRoles.join(', ')}
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

// Higher-order component for protecting routes
export const withAuthGuard = (
  Component: React.ComponentType<any>,
  options: Omit<AuthGuardProps, 'children'> = {}
) => {
  return (props: any) => (
    <AuthGuard {...options}>
      <Component {...props} />
    </AuthGuard>
  );
};

// Role-specific guards
export const AdminGuard: React.FC<Omit<AuthGuardProps, 'requireRoles'>> = (props) => (
  <AuthGuard {...props} requireRoles={['ADMIN']} />
);

export const InspektoratGuard: React.FC<Omit<AuthGuardProps, 'requireRoles'>> = (props) => (
  <AuthGuard {...props} requireRoles={['INSPEKTORAT']} />
);

export const PerwadagGuard: React.FC<Omit<AuthGuardProps, 'requireRoles'>> = (props) => (
  <AuthGuard {...props} requireRoles={['PERWADAG']} />
);

export const AdminOrInspektoratGuard: React.FC<Omit<AuthGuardProps, 'requireRoles'>> = (props) => (
  <AuthGuard {...props} requireRoles={['ADMIN', 'INSPEKTORAT']} />
);

export const MfaGuard: React.FC<Omit<AuthGuardProps, 'requireMfa'>> = (props) => (
  <AuthGuard {...props} requireMfa={true} />
);

// Public route guard (for login/register pages)
export const PublicRoute: React.FC<{ children: ReactNode; redirectTo?: string }> = ({ 
  children, 
  redirectTo = '/' 
}) => {
  const { isAuthenticated, loading, user, isTokenValid, checkAuth } = useAuth();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // If already authenticated with valid token and user data, redirect to dashboard
  if (isAuthenticated && user && isTokenValid()) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};