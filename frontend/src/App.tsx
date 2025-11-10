import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import LoginPage from '@/pages/LoginPage';
import WebLayout from '@/layouts/WebLayout';
import MobileLayout from '@/layouts/MobileLayout';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import ProjectStatus from '@/pages/ProjectStatus';
import Tasks from '@/pages/Tasks';
import Issues from '@/pages/Issues';
import Resources from '@/pages/Resources';
import Attendance from '@/pages/Attendance';
import PettyCash from '@/pages/PettyCash';
import Commercial from '@/pages/Commercial';
import Users from '@/pages/Users';
import Settings from '@/pages/Settings';
import Reports from '@/pages/Reports';
import { useIsMobile } from '@/hooks/useIsMobile';

// Protected Route Component
function ProtectedRoute({ children, module, allowRoles }: { children: React.ReactElement; module: string; allowRoles?: string[] }) {
  const { user, hasPermission, hasRole } = useAuth();
  
  // Admins and managers ALWAYS have access to all pages - check user directly
  if (user && (user.role === 'admin' || user.role === 'manager')) {
    return children;
  }
  
  // If allowRoles is specified, check role instead of module permission
  if (allowRoles && hasRole(allowRoles as any)) {
    return children;
  }
  
  // Otherwise, check module permission
  if (!hasPermission(module)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }
  
  return children;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const Layout = isMobile ? MobileLayout : WebLayout;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute module="dashboard"><Dashboard /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute module="projects"><Projects /></ProtectedRoute>} />
        <Route path="/projects/:projectId" element={<ProtectedRoute module="projects"><ProjectStatus /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute module="tasks"><Tasks /></ProtectedRoute>} />
        <Route path="/issues" element={<ProtectedRoute module="issues"><Issues /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute module="resources"><Resources /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute module="attendance"><Attendance /></ProtectedRoute>} />
        <Route path="/petty-cash" element={<ProtectedRoute module="petty_cash"><PettyCash /></ProtectedRoute>} />
        <Route path="/commercial/*" element={<ProtectedRoute module="commercial"><Commercial /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute module="users"><Users /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute module="settings"><Settings /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute module="reports"><Reports /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <div className="App">
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
