import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MobileHeader from '@/components/MobileHeader';
import MobileNavigation from '@/components/MobileNavigation';
import MobileSidebar from '@/components/MobileSidebar';
import { useAuth } from '@/contexts/AuthContext';

const MobileLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="mobile-layout min-h-screen h-screen flex flex-col">
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
      <main className="flex-1 overflow-x-hidden overflow-y-auto pb-20 w-full max-w-full">
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
