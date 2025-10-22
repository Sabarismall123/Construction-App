import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NAVIGATION_ITEMS } from '@/constants';
import { cn } from '@/utils';

interface MobileNavigationProps {
  currentPath: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ currentPath }) => {
  const { hasPermission } = useAuth();

  const isItemActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(path);
  };

  // Get the most important navigation items for mobile
  const mobileNavItems = NAVIGATION_ITEMS.filter(item => 
    hasPermission(item.key) && 
    ['dashboard', 'projects', 'tasks', 'issues', 'attendance'].includes(item.key)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
      <div className="flex justify-around py-2">
        {mobileNavItems.map((item) => {
          const isActive = isItemActive(item.path);

          return (
            <Link
              key={item.key}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
