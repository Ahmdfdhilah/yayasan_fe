// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { TooltipProvider } from '@workspace/ui/components/tooltip';
// Import your layouts/components
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import { Toaster } from "@workspace/ui/components/sonner";
import { AuthProvider } from './components/Auth/AuthProvider';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { DefaultLayout } from './components/layouts';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { EmailSentSuccessPage } from './pages/auth/EmailSentSuccessPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import ProfilePage from './pages/profile/ProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import UsersPage from './pages/users/UsersPage';
import OrganizationsPage from './pages/organizations/OrganizationsPage';
import { PublicRoute, AuthGuard } from './components/Auth/AuthGuard';
import { RoleBasedHome } from './components/Auth/RoleBasedHome';
import { RoleProtectedRoute } from './components/Auth/RoleProtectedRoute';

function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <TooltipProvider>
          <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
              <AuthProvider>
                <Toaster />
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<DefaultLayout />}>
                    <Route path='login' element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    } />
                    <Route path='forgot-password' element={
                      <PublicRoute>
                        <ForgotPasswordPage />
                      </PublicRoute>
                    } />
                    <Route path='callback' element={
                      <PublicRoute>
                        <EmailSentSuccessPage />
                      </PublicRoute>
                    } />
                    <Route path='reset-password' element={
                      <PublicRoute>
                        <ResetPasswordPage />
                      </PublicRoute>
                    } />
                  </Route>
                  
                  {/* Protected routes */}
                  <Route path="/" element={
                    <AuthGuard>
                      <DashboardLayout />
                    </AuthGuard>
                  }>
                    {/* Home route - redirects based on role */}
                    <Route index element={<RoleBasedHome />} />
                    
                    {/* Dashboard - All authenticated users */}
                    <Route path="dashboard" element={<DashboardPage />} />
                  
                    {/* Profile - All authenticated users */}
                    <Route path="profile" element={<ProfilePage />} />
                    
                    {/* Admin only routes */}
                    <Route path="users" element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <UsersPage />
                      </RoleProtectedRoute>
                    } />
                    
                    <Route path="organizations" element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <OrganizationsPage />
                      </RoleProtectedRoute>
                    } />
                  </Route>
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </PersistGate>
        </TooltipProvider>
      </Provider>
    </HelmetProvider>
  );
}

export default App;