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

  return (
    <nav className="mobile-nav">
      <div className="flex justify-around">
        {NAVIGATION_ITEMS.slice(0, 5).map((item) => {
          if (!hasPermission(item.key)) return null;

          const isActive = isItemActive(item.path);

          return (
            <Link
              key={item.key}
              to={item.path}
              className={cn(
                'mobile-nav-item',
                isActive && 'mobile-nav-item-active'
              )}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
