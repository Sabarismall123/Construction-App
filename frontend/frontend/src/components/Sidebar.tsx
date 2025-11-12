import React from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NAVIGATION_ITEMS } from '@/constants';
import { cn } from '@/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPath }) => {
  const { hasPermission } = useAuth();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, left: 0 });

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Close if clicking outside both sidebar and dropdown
      if (!target.closest('.sidebar') && !target.closest('[data-dropdown]')) {
        setExpandedItems([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleExpanded = (key: string, event?: React.MouseEvent) => {
    if (event) {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.top,
        left: buttonRect.right + 8
      });
    }
    
    setExpandedItems(prev => 
      prev.includes(key) 
        ? prev.filter(item => item !== key)
        : [...prev, key]
    );
  };

  const isItemActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(path);
  };


  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'sidebar',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CM</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">
              Construction
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-5 px-2 space-y-1 relative">
          {NAVIGATION_ITEMS.map((item) => {
            if (!hasPermission(item.key)) return null;

            const hasSubmodules = item.submodules && item.submodules.length > 0;
            const isExpanded = expandedItems.includes(item.key);
            const isActive = isItemActive(item.path);
            

            return (
              <div key={item.key}>
                <div className="w-full relative sidebar-dropdown">
                  {hasSubmodules ? (
                    <>
                       <button
                         onClick={(e) => toggleExpanded(item.key, e)}
                         className={cn(
                           'sidebar-item w-full justify-between',
                           (isActive || isExpanded) && 'sidebar-item-active'
                         )}
                       >
                        <div className="flex items-center">
                          <span className="mr-3">{item.icon}</span>
                          {item.label}
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={cn(
                        'sidebar-item',
                        isActive && 'sidebar-item-active'
                      )}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">U</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">User</p>
              <p className="text-xs text-gray-500">Construction Manager</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown rendered outside sidebar */}
      {expandedItems.length > 0 && (
        <div 
          data-dropdown
          className="fixed w-64 bg-white shadow-xl rounded-lg border border-gray-200 z-[70]"
          style={{ 
            position: 'fixed', 
            left: `${dropdownPosition.left}px`, 
            top: `${dropdownPosition.top}px`, 
            width: '256px', 
            backgroundColor: 'white', 
            zIndex: 70 
          }}
        >
          <div className="py-2">
            {NAVIGATION_ITEMS.find(item => expandedItems.includes(item.key))?.submodules?.map((submodule) => {
              const item = NAVIGATION_ITEMS.find(item => expandedItems.includes(item.key));
              if (!item) return null;
              const subPath = `${item.path}/${submodule.key}`;
              const isSubActive = currentPath === subPath;
              
              return (
                <Link
                  key={submodule.key}
                  to={subPath}
                  onClick={() => {
                    setExpandedItems([]);
                    // Only close sidebar on mobile
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={cn(
                    'flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors',
                    isSubActive && 'bg-primary-50 text-primary-700'
                  )}
                >
                  <span className="mr-3">{submodule.icon}</span>
                  {submodule.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
