import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

// Persistent error diagnoser across page reloads
const AuthErrorDiagnoser = () => {
  useEffect(() => {
    const error = sessionStorage.getItem('auth_failure_reason');
    if (error) {
      if (error === 'Session expired, please log in again') {
        toast.error(error, { duration: 6000 });
      } else {
        toast.error(`Authorization Alert: ${error}`, { duration: 10000 });
      }
      sessionStorage.removeItem('auth_failure_reason');
    }
  }, []);
  return null;
};

// Handles dynamic injecting of admin Command Center theme variables and search indexing rules
const RouteHandler = () => {
  const location = useLocation();

  useEffect(() => {
    const isSpecialAdminRoute = location.pathname.startsWith('/admin');
    if (isSpecialAdminRoute) {
      document.documentElement.classList.add('admin-theme');
      
      let meta = document.querySelector('meta[name="robots"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'robots';
        document.head.appendChild(meta);
      }
      meta.content = 'noindex, nofollow';
    } else {
      document.documentElement.classList.remove('admin-theme');
      const meta = document.querySelector('meta[name="robots"]');
      if (meta) {
        meta.remove();
      }
    }
  }, [location]);

  return null;
};

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import UserBills from './pages/user/UserBills';
import UserOverdueBills from './pages/user/UserOverdueBills';
import UserPayments from './pages/user/UserPayments';
import UserProfile from './pages/user/UserProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAdmins from './pages/admin/AdminAdmins';
import AdminTimeline from './pages/admin/AdminTimeline';

// Dashboard Layout component
const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-c-bg flex">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Pane */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Header/Navbar */}
        <Navbar setMobileOpen={setMobileOpen} />

        {/* Active Page View */}
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouteHandler />
        {/* Global Toast Alert Engine */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#1C3B2E',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              borderRadius: '12px',
              border: '1px solid #E7E2D4',
            },
          }}
        />
        <AuthErrorDiagnoser />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* User Protected Workspace */}
          <Route
            path="/app"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="bills" element={<UserBills />} />
            <Route path="bills/overdue" element={<UserOverdueBills />} />
            <Route path="payments" element={<UserPayments />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* Admin Protected Workspace */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route
              path="admins"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <AdminAdmins />
                </ProtectedRoute>
              }
            />
            <Route
              path="timeline"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <AdminTimeline />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
