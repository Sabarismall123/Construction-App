import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, searchItems, filterItems } from '@/utils';
import { RESOURCE_TYPES, RESOURCE_STATUSES } from '@/constants';
import MobileDropdown from '@/components/MobileDropdown';
import ResourceForm from '@/components/ResourceForm';
import { Resource } from '@/types';

const Resources: React.FC = () => {
  const { resources, projects, deleteResource } = useData();
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const filteredResources = filterItems(
    searchItems(resources, searchTerm, ['name']),
    { 
      type: typeFilter,
      status: statusFilter
    }
  );

  const getTypeIcon = (type: string) => {
    const typeConfig = RESOURCE_TYPES.find(t => t.value === type);
    return typeConfig?.icon || '📦';
  };

  const getStatusColor = (status: string) => {
    const statusConfig = RESOURCE_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'Unassigned';
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  return (
    <div className="mobile-content w-full px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Resources</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage labor, materials, and equipment resources
          </p>
        </div>
        {hasRole(['admin', 'manager', 'site_supervisor']) && (
          <button
            onClick={() => {
              setEditingResource(null);
              setShowForm(true);
            }}
            className="w-full lg:w-auto btn-primary flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body p-4">
          <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-3">
            <div className="relative flex-1 lg:max-w-md">
              <div className="search-icon">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search resources..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="lg:w-auto lg:min-w-[180px]">
              <MobileDropdown
                options={[
                  { value: '', label: 'All Types' },
                  ...RESOURCE_TYPES.map(type => ({
                    value: type.value,
                    label: type.label
                  }))
                ]}
                value={typeFilter}
                onChange={setTypeFilter}
                placeholder="All Types"
              />
            </div>
            <div className="lg:w-auto lg:min-w-[180px]">
              <MobileDropdown
                options={[
                  { value: '', label: 'All Statuses' },
                  ...RESOURCE_STATUSES.map(status => ({
                    value: status.value,
                    label: status.label
                  }))
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="All Statuses"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="card hover:shadow-md transition-shadow">
            <div className="card-body p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-lg">{getTypeIcon(resource.type)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">{resource.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{RESOURCE_TYPES.find(t => t.value === resource.type)?.label}</p>
                  </div>
                </div>
                <div className="flex space-x-1 flex-shrink-0">
                  {hasRole(['admin', 'manager', 'site_supervisor']) && (
                    <>
                      <button
                        onClick={() => {
                          setEditingResource(resource);
                          setShowForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteResource(resource.id)}
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
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`status-badge ${getStatusColor(resource.status)}`}>
                    {RESOURCE_STATUSES.find(s => s.value === resource.status)?.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Quantity</span>
                  <span className="text-sm font-medium truncate">{resource.quantity} {resource.unit}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Allocated</span>
                  <span className="text-sm font-medium truncate">{resource.allocatedQuantity} {resource.unit}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Cost</span>
                  <span className="text-sm font-medium truncate">{formatCurrency(resource.cost)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Project</span>
                  <span className="text-sm font-medium truncate">{getProjectName(resource.projectId)}</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Allocation</span>
                  <span className="font-medium">
                    {resource.quantity > 0 ? Math.round((resource.allocatedQuantity / resource.quantity) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${resource.quantity > 0 ? (resource.allocatedQuantity / resource.quantity) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Package className="h-12 w-12" />
          </div>
          <h3 className="empty-state-title">No resources found</h3>
          <p className="empty-state-description">
            {searchTerm || typeFilter || statusFilter
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first resource.'}
          </p>
        </div>
      )}

      {/* Resource Form Modal */}
      {showForm && (
        <ResourceForm
          resource={editingResource}
          onClose={() => {
            setShowForm(false);
            setEditingResource(null);
          }}
        />
      )}
    </div>
  );
};

export default Resources;
