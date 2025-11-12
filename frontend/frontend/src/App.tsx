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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectStatus />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/issues" element={<Issues />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/petty-cash" element={<PettyCash />} />
        <Route path="/commercial/*" element={<Commercial />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reports" element={<Reports />} />
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
