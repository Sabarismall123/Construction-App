import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MobileHeader from '@/components/MobileHeader';
import MobileNavigation from '@/components/MobileNavigation';
import MobileSidebar from '@/components/MobileSidebar';
import { useAuth } from '@/contexts/AuthContext';

const MobileLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="mobile-layout min-h-screen h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <MobileHeader user={user} onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <MobileSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Page content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pb-16">
        <div className="mobile-content w-full max-w-full min-h-full">
          {children || <Outlet />}
        </div>
      </main>

      {/* Bottom Navigation */}
      <MobileNavigation currentPath={location.pathname} />
    </div>
  );
};

export default MobileLayout;
