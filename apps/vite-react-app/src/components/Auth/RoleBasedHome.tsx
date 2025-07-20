import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { hasRouteAccess } from '@/lib/menus';

export function RoleBasedHome() {
  const { user } = useAuth();

  // Define default routes for each role based on menu permissions
  const getDefaultRouteForRole = (role: string): string => {
    const userRoles = [role];
    
    switch (role) {
      case 'ADMIN':
        // ADMIN can access everything, default to risk assessment
        if (hasRouteAccess('/penilaian-resiko', userRoles)) {
          return '/penilaian-resiko';
        }
        return '/users'; // Fallback to user management
        
      case 'INSPEKTORAT':
        // INSPEKTORAT can access most features, default to risk assessment
        if (hasRouteAccess('/penilaian-resiko', userRoles)) {
          return '/penilaian-resiko';
        }
        // Fallback to surat tugas if risk assessment not available
        return '/surat-tugas';
        
      case 'PERWADAG':
        // PERWADAG cannot access risk assessment, default to surat tugas
        return '/surat-tugas';
        
      default:
        // If no role or unknown role, redirect to surat tugas as safe default
        return '/surat-tugas';
    }
  };

  if (!user?.role) {
    // If user has no role, redirect to surat tugas as the most accessible page
    return <Navigate to="/surat-tugas" replace />;
  }

  const defaultRoute = getDefaultRouteForRole(user.role);
  return <Navigate to={defaultRoute} replace />;
}