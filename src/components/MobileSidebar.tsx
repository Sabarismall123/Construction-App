import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NAVIGATION_ITEMS } from '@/constants';
import { cn, getInitials } from '@/utils';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();

  const isItemActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div
      className={cn(
        'fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
      style={{
        maxWidth: '85vw',
        width: '320px'
      }}
    >
      {/* Header with X close button */}
       <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
   {/* Left side: logo and title */}
   <div className="flex items-center flex-1 min-w-0">
     <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
       <span className="text-white font-bold text-sm">CM</span>
     </div>
     <span className="ml-2 text-lg font-semibold text-gray-900 truncate">
       Construction
     </span>
   </div>
 
   {/* Right side: close button */}
   <button
     onClick={onClose}
     className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0 ml-2"
     aria-label="Close menu"
   >
     <X className="h-5 w-5" />
   </button>
 </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {getInitials(user?.name || 'User')}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            if (!hasPermission(item.key)) return null;

            const isActive = isItemActive(item.path);
            const hasSubmodules = item.submodules && item.submodules.length > 0;

            return (
              <div key={item.key}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    'flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {hasSubmodules && (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </Link>

                {/* Submodules */}
                {hasSubmodules && isActive && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submodules?.map((submodule) => (
                      <Link
                        key={submodule.key}
                        to={`${item.path}/${submodule.key}`}
                        onClick={onClose}
                        className="flex items-center px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      >
                        <span className="mr-2">{submodule.icon}</span>
                        <span>{submodule.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer - Fixed at bottom */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <span className="mr-2">🚪</span>
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default MobileSidebar;
