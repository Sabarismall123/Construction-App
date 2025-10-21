import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Package, Users, Wrench } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, searchItems, filterItems } from '@/utils';
import { RESOURCE_TYPES, RESOURCE_STATUSES } from '@/constants';

const Resources: React.FC = () => {
  const { resources, projects, deleteResource } = useData();
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage labor, materials, and equipment resources
          </p>
        </div>
        {hasRole(['admin', 'manager', 'site_supervisor']) && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary mt-4 sm:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="relative">
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
            </div>
            <div>
              <select
                className="input"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {RESOURCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                {RESOURCE_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="card hover:shadow-md transition-shadow">
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg">{getTypeIcon(resource.type)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{resource.name}</h3>
                    <p className="text-sm text-gray-500">{RESOURCE_TYPES.find(t => t.value === resource.type)?.label}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {hasRole(['admin', 'manager', 'site_supervisor']) && (
                    <>
                      <button
                        onClick={() => setEditingResource(resource)}
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`status-badge ${getStatusColor(resource.status)}`}>
                    {RESOURCE_STATUSES.find(s => s.value === resource.status)?.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Quantity</span>
                  <span className="text-sm font-medium">{resource.quantity} {resource.unit}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Allocated</span>
                  <span className="text-sm font-medium">{resource.allocatedQuantity} {resource.unit}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Cost</span>
                  <span className="text-sm font-medium">{formatCurrency(resource.cost)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Project</span>
                  <span className="text-sm font-medium">{getProjectName(resource.projectId)}</span>
                </div>
              </div>

              <div className="mt-4">
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
    </div>
  );
};

export default Resources;
