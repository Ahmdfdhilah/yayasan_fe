import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { DashboardPage } from '@/pages/DashboardPage';

export function RoleBasedHome() {
  const { user } = useAuth();

  // For PKG system, we'll show dashboard for all authenticated users
  // The dashboard will display different content based on roles
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Show dashboard for all users - it will display role-appropriate content
  return <DashboardPage />;
}