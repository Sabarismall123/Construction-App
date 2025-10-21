import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MobileHeader from '@/components/MobileHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useAuth } from '@/contexts/AuthContext';

const MobileLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <MobileHeader user={user} />

      {/* Page content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pb-16">
        <div className="px-4 py-4">
          {children || <Outlet />}
        </div>
      </main>

      {/* Bottom Navigation */}
      <MobileNavigation currentPath={location.pathname} />
    </div>
  );
};

export default MobileLayout;
