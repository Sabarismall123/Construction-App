import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { getInitials } from '@/utils';

interface MobileHeaderProps {
  user: any;
  onMenuClick?: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ user, onMenuClick }) => {
  const { logout } = useAuth();
  const { notifications, markNotificationAsRead } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Filter notifications by current user - normalize IDs for comparison
  const userNotifications = user ? notifications.filter(n => {
    if (!n.userId) return true; // Show notifications without userId (global)
    // Normalize both IDs to strings for comparison
    const notificationUserId = n.userId?.toString() || n.userId;
    const currentUserId = user.id?.toString() || user.id;
    return notificationUserId === currentUserId;
  }) : notifications;
  const unreadNotifications = userNotifications.filter(n => !n.read);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showUserMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when dropdowns are open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [showUserMenu, showNotifications]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4 min-w-0 w-full">
        <div className="flex items-center flex-1 min-w-0 gap-2">
          {/* Hamburger Menu */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Logo */}
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">CM</span>
          </div>
          
          {/* App Title */}
          <span className="text-lg font-semibold text-gray-900 truncate min-w-0">
            Construction
          </span>
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
          {/* Search */}
          <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 relative"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="fixed right-4 top-16 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-lg shadow-xl border border-gray-200 z-[100] max-h-[calc(100vh-5rem)] flex flex-col">
                <div className="p-3 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1">
                  {userNotifications.length === 0 ? (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      No notifications
                    </div>
                  ) : (
                    userNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          markNotificationAsRead(notification.id);
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex items-start">
                          <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${
                            notification.type === 'error' ? 'bg-red-500' :
                            notification.type === 'warning' ? 'bg-yellow-500' :
                            notification.type === 'success' ? 'bg-green-500' :
                            'bg-blue-500'
                          }`} />
                          <div className="ml-2 flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <span className="text-white font-medium text-xs">
                {getInitials(user?.name || 'User')}
              </span>
            </button>

            {showUserMenu && (
              <>
                {/* Backdrop overlay */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-20 z-[90]"
                  onClick={() => setShowUserMenu(false)}
                />
                {/* Dropdown menu */}
                <div className="fixed right-4 top-16 w-[calc(100vw-2rem)] max-w-xs bg-white rounded-lg shadow-xl border border-gray-200 z-[100]">
                  <div className="py-1">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">{user?.role?.replace('_', ' ') || 'Employee'}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
