import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import SkeletonLoader from './components/ui/Skeleton';

// Layouts
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));

// Pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Organizations = lazy(() => import('./pages/Organizations'));
const OrganizationDetails = lazy(() => import('./pages/OrganizationDetails'));
const Chatbots = lazy(() => import('./pages/Chatbots'));
const ChatbotDetails = lazy(() => import('./pages/ChatbotDetails'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ActivityLogs = lazy(() => import('./pages/ActivityLogs'));
const Users = lazy(() => import('./pages/Users'));
const Coupons = lazy(() => import('./pages/Coupons'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="w-full max-w-md p-8">
      <SkeletonLoader height={40} className="mb-6" />
      <SkeletonLoader count={3} height={20} className="mb-4" />
      <SkeletonLoader height={100} className="mb-6" />
      <SkeletonLoader count={2} height={30} className="mb-4" />
    </div>
  </div>
);

// Route guard for protected routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// SuperAdmin only route guard
const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user?.is_superuser) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="organizations" element={<Organizations />} />
          <Route path="organizations/:id" element={<OrganizationDetails />} />
          <Route path="chatbots" element={<Chatbots />} />
          <Route path="chatbots/:id" element={<ChatbotDetails />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="coupons" element={<Coupons />} />
          
          {/* SuperAdmin only routes */}
          <Route path="activity" element={
            <SuperAdminRoute>
              <ActivityLogs />
            </SuperAdminRoute>
          } />
          <Route path="users" element={
            <SuperAdminRoute>
              <Users />
            </SuperAdminRoute>
          } />
        </Route>
        
        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;