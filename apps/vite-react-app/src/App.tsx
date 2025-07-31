// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { TooltipProvider } from '@workspace/ui/components/tooltip';
// Import your layouts/components
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import { Toaster } from "@workspace/ui/components/sonner";
import { AuthProvider, useAuth } from './components/Auth/AuthProvider';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { DefaultLayout } from './components/layouts';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { EmailSentSuccessPage } from './pages/auth/EmailSentSuccessPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import ProfilePage from './pages/profile/ProfilePage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import UsersPage from './pages/users/UsersPage';
import OrganizationsPage from './pages/organizations/OrganizationsPage';
import { PublicRoute, AuthGuard } from './components/Auth/AuthGuard';
import { RoleProtectedRoute } from './components/Auth/RoleProtectedRoute';
import PeriodsPage from './pages/periods/PeriodsPage';
import { EvaluationAspectsPage } from './pages/evaluation-aspects/EvaluationAspectsPage';
import TeacherEvaluationsPage from './pages/teacher-evaluations/TeacherEvaluationsPage';
import TeacherEvaluationDetailPage from './pages/teacher-evaluations/TeacherEvaluationDetailPage';
import EvaluationReportsPage from './pages/evaluation-reports/EvaluationReportsPage';
import { MyRPPSubmissionsPage, RPPSubmissionsPage, RPPSubmissionDetailPage } from './pages/rpp-submissions';
import { MediaFilesPage } from './pages/media-files';
import BoardMembersPage from './pages/board-members/BoardMembersPage';
import ArticlesPage from './pages/articles/ArticlesPage';
import GalleriesPage from './pages/galleries/GalleriesPage';
import MessagesPage from './pages/messages/MessagesPage';
import HomePage from './pages/public/home/HomePage';
import ArticlesListPage from './pages/public/articles/ArticlesListPage';
import ArticleDetailPage from './pages/public/articles/ArticleDetailPage';
import OrganizationsListPage from './pages/public/organizations/OrganizationsListPage';
import OrganizationDetailPage from './pages/public/organizations/OrganizationDetailPage';

// Simple redirect component for My Evaluations
const MyEvaluationsRedirect = () => {
  const { user } = useAuth();
  return user?.id ? <Navigate to={`/teacher-evaluations/${user.id}`} replace /> : null;
};

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
                    <Route index element={<HomePage />} />
                    <Route path='home' element={<HomePage />} />
                    
                    {/* Public Articles Routes */}
                    <Route path='articles' element={<ArticlesListPage />} />
                    <Route path='articles/:slug' element={<ArticleDetailPage />} />
                    
                    {/* Public Organizations Routes - using /schools to avoid conflict with CMS */}
                    <Route path='schools' element={<OrganizationsListPage />} />
                    <Route path='schools/:id' element={<OrganizationDetailPage />} />
                    
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
                    {/* Dashboard - All authenticated users */}
                    <Route index element={<DashboardPage />} />

                    <Route path="dashboard" element={<DashboardPage />} />

                    {/* Profile - All authenticated users */}
                    <Route path="profile" element={<ProfilePage />} />

                    {/* Admin only routes */}
                    <Route path="users" element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <UsersPage />
                      </RoleProtectedRoute>
                    } />

                    <Route path="cms/organizations" element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <OrganizationsPage />
                      </RoleProtectedRoute>
                    } />
                    <Route path="periods" element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <PeriodsPage />
                      </RoleProtectedRoute>
                    } />

                    <Route path="evaluation-aspects" element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <EvaluationAspectsPage />
                      </RoleProtectedRoute>
                    } />

                    {/* Evaluation Reports - Admin only */}
                    <Route path="evaluations/reports" element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <EvaluationReportsPage />
                      </RoleProtectedRoute>
                    } />

                    {/* Teacher Evaluations - Admin and Kepala Sekolah */}
                    <Route path="teacher-evaluations" element={
                      <RoleProtectedRoute allowedRoles={['admin', 'kepala_sekolah']}>
                        <TeacherEvaluationsPage />
                      </RoleProtectedRoute>
                    } />

                    {/* Teacher Evaluation Detail - Admin, Kepala Sekolah, and Guru */}
                    <Route path="teacher-evaluations/:teacherId" element={
                      <RoleProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'guru']}>
                        <TeacherEvaluationDetailPage />
                      </RoleProtectedRoute>
                    } />

                    {/* My Evaluations - Guru only - Redirect to detail page */}
                    <Route path="my-evaluations" element={
                      <RoleProtectedRoute allowedRoles={['guru', 'kepala_sekolah']}>
                        <MyEvaluationsRedirect />
                      </RoleProtectedRoute>
                    } />

                    {/* RPP Submissions Routes */}
                    {/* My RPP Submissions - Guru only */}
                    <Route path="my-rpp-submissions" element={
                      <RoleProtectedRoute allowedRoles={['guru', 'kepala_sekolah']}>
                        <MyRPPSubmissionsPage />
                      </RoleProtectedRoute>
                    } />

                    {/* RPP Submissions List - Admin and Kepala Sekolah */}
                    <Route path="rpp-submissions" element={
                      <RoleProtectedRoute allowedRoles={['admin', 'kepala_sekolah']}>
                        <RPPSubmissionsPage />
                      </RoleProtectedRoute>
                    } />

                    {/* RPP Submission Detail - Admin/Kepala Sekolah viewing teacher's submission */}
                    <Route path="rpp-submissions/teacher/:teacherId" element={
                      <RoleProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'guru']}>
                        <RPPSubmissionDetailPage />
                      </RoleProtectedRoute>
                    } />

                    {/* Media Files Routes */}
                    {/* My Media Files - All authenticated users can view their own files */}
                    <Route path="media-files" element={
                      <RoleProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'guru']}>
                        <MediaFilesPage />
                      </RoleProtectedRoute>
                    } />
                    
                    {/* Specific User Media Files - Admin and Kepala Sekolah can view others' files */}
                    <Route path="media-files/:uploaderId" element={
                      <RoleProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'guru']}>
                        <MediaFilesPage />
                      </RoleProtectedRoute>
                    } />

                    {/* Content Management Routes - Admin only */}
                    <Route path="board-members" element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <BoardMembersPage />
                      </RoleProtectedRoute>
                    } />

                    <Route path="cms/articles" element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <ArticlesPage/>
                      </RoleProtectedRoute>
                    } />

                    <Route path="galleries" element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <GalleriesPage />
                      </RoleProtectedRoute>
                    } />

                    <Route path="messages" element={
                      <RoleProtectedRoute allowedRoles={['admin']}>
                        <MessagesPage />
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