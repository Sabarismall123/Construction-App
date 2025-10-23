import React, { useState } from 'react';
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

  const unreadNotifications = notifications.filter(n => !n.read);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4 min-w-0">
        <div className="flex items-center flex-1 min-w-0">
          {/* Hamburger Menu */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-2 flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Logo */}
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">CM</span>
          </div>
          
          {/* App Title */}
          <span className="ml-2 text-lg font-semibold text-gray-900 truncate">
            Construction
          </span>
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
          {/* Search */}
          <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
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
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-200">
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
                <div className="max-h-48 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
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
                          <div className={`h-2 w-2 rounded-full mt-1.5 ${
                            notification.type === 'error' ? 'bg-red-500' :
                            notification.type === 'warning' ? 'bg-yellow-500' :
                            notification.type === 'success' ? 'bg-green-500' :
                            'bg-blue-500'
                          }`} />
                          <div className="ml-2 flex-1">
                            <p className="text-xs font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
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
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center"
            >
              <span className="text-white font-medium text-xs">
                {getInitials(user?.name || 'User')}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
