import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download, User as UserIcon, Shield, Mail, Calendar, X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, searchItems, filterItems } from '@/utils';
import { ROLES } from '@/constants';
import UserForm from '@/components/UserForm';
import MobileDropdown from '@/components/MobileDropdown';

const Users: React.FC = () => {
  const { users, deleteUser } = useData();
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

  const filteredUsers = filterItems(
    searchItems(users, searchTerm, ['name', 'email']),
    { role: roleFilter }
  );

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleView = (user: any) => {
    setSelectedUser(user);
    setShowDetail(true);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedUser(null);
  };

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      site_supervisor: 'bg-green-100 text-green-800',
      employee: 'bg-gray-100 text-gray-800'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  const handleExportExcel = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Role', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        `"${user.name}"`,
        `"${user.email}"`,
        `"${ROLES[user.role as keyof typeof ROLES]}"`,
        `"${formatDate(new Date())}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare dropdown options
  const roleOptions = [
    { value: '', label: 'All Roles' },
    ...Object.entries(ROLES).map(([key, label]) => ({
      value: key,
      label: label
    }))
  ];

  const clearAllFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
  };

  const hasActiveFilters = searchTerm || roleFilter;

  return (
    <div className="mobile-content w-full px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-3">
          <button
            onClick={handleExportExcel}
            className="w-full lg:w-auto btn-secondary flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
          {hasRole(['manager']) && (
            <button
              onClick={() => {
                setEditingUser(null);
                setShowForm(true);
              }}
              className="w-full lg:w-auto btn-primary flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body p-4">
          <div className="flex flex-col space-y-4">
            {/* Search */}
            <div className="relative">
              <div className="search-icon">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:space-x-3">
              <div className="flex-1">
                <MobileDropdown
                  options={roleOptions}
                  value={roleFilter}
                  onChange={setRoleFilter}
                  placeholder="All Roles"
                  className="w-full"
                />
              </div>
            </div>

            {/* Debug Info and Clear Filters */}
            <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="w-full lg:w-auto btn-secondary flex items-center justify-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <UserIcon className="h-12 w-12" />
          </div>
          <h3 className="empty-state-title">No users found</h3>
          <p className="empty-state-description">
            {searchTerm || roleFilter
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first user.'}
          </p>
        </div>
      ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="card hover:shadow-md transition-shadow">
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <UserIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user.name}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1 flex-shrink-0">
                        <button
                          onClick={() => handleView(user)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {hasRole(['manager']) && (
                          <>
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 mr-2">Role:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {ROLES[user.role as keyof typeof ROLES]}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 mr-2">Email:</span>
                        <span className="text-xs text-gray-900 truncate flex-1 text-right">
                          {user.email}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 mr-2">Status:</span>
                        <span className="text-xs text-gray-500">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

      {/* User Form Modal */}
      {showForm && (
        <UserForm
          user={editingUser}
          onClose={handleCloseForm}
        />
      )}

      {/* User Detail Modal */}
      {showDetail && selectedUser && (
        <UserDetail
          user={selectedUser}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

// User Detail Component
const UserDetail: React.FC<{ user: any; onClose: () => void }> = ({ user, onClose }) => {
  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      site_supervisor: 'bg-green-100 text-green-800',
      employee: 'bg-gray-100 text-gray-800'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                <UserIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  User Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {ROLES[user.role as keyof typeof ROLES]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
