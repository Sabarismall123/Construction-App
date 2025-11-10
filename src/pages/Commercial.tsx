import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Package, Truck, Upload, Download, BarChart3, Plus, Edit, Trash2, Search, Filter, Calendar, User, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { COMMERCIAL_SUBMODULES } from '@/constants';
import { formatCurrency, formatDate, searchItems, filterItems } from '@/utils';
import InventoryForm from '@/components/InventoryForm';
import SiteTransferForm from '@/components/SiteTransferForm';
import MaterialIssueForm from '@/components/MaterialIssueForm';
import MaterialReturnForm from '@/components/MaterialReturnForm';
import MaterialConsumptionForm from '@/components/MaterialConsumptionForm';
import { InventoryItem, SiteTransfer, MaterialIssue, MaterialReturn, MaterialConsumption } from '@/types';

const Commercial: React.FC = () => {
  const { hasPermission } = useAuth();
  const location = useLocation();
  const [headerShowForm, setHeaderShowForm] = useState(false);

  if (!hasPermission('commercial')) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Package className="h-12 w-12" />
        </div>
        <h3 className="empty-state-title">Access Denied</h3>
        <p className="empty-state-description">
          You don't have permission to access the commercial module.
        </p>
      </div>
    );
  }

  return (
    <div className="mobile-content w-full px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Commercial</h1>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-400 font-medium">
            Manage inventory, material transfers, issues, returns, and consumptions
          </p>
        </div>
        <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-3">
          <button className="w-full lg:w-auto btn-secondary flex items-center justify-center text-xs px-3 py-1.5 lg:text-sm lg:px-3 lg:py-2">
            <Download className="h-3.5 w-3.5 mr-1.5 lg:h-4 lg:w-4 lg:mr-2" />
            Export
          </button>
          <button 
            onClick={() => setHeaderShowForm(true)}
            className="w-full lg:w-auto btn-primary flex items-center justify-center text-xs px-3 py-1.5 lg:text-sm lg:px-3 lg:py-2"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5 lg:h-4 lg:w-4 lg:mr-2" />
            Add Item
          </button>
        </div>
      </div>
      
      {/* Header Form Modal */}
      {headerShowForm && (
        <InventoryForm
          item={null}
          onClose={() => setHeaderShowForm(false)}
        />
      )}

      {/* Submodule Navigation */}
      <div className="card">
        <div className="card-body p-4">
          <nav className="flex flex-col space-y-2 lg:grid lg:grid-cols-5 lg:gap-3 lg:space-y-0">
            {COMMERCIAL_SUBMODULES.map((submodule) => {
              const isActive = location.pathname === `/commercial/${submodule.key}`;
              return (
                <Link
                  key={submodule.key}
                  to={`/commercial/${submodule.key}`}
                  className={`flex items-center px-2 py-2 lg:px-3 lg:py-3 text-xs lg:text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2 lg:mr-3 text-base lg:text-lg">{submodule.icon}</span>
                  {submodule.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Submodule Content */}
      <Routes>
        <Route path="/" element={<InventoryContent />} />
        <Route path="/inventory" element={<InventoryContent />} />
        <Route path="/site_transfers" element={<SiteTransfersContent />} />
        <Route path="/material_issue" element={<MaterialIssueContent />} />
        <Route path="/material_return" element={<MaterialReturnContent />} />
        <Route path="/consumptions" element={<ConsumptionsContent />} />
      </Routes>
    </div>
  );
};

// Placeholder components for each submodule
const InventoryContent: React.FC = () => {
  const { inventory, deleteInventoryItem } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filteredInventory = filterItems(
    searchItems(inventory, searchTerm, ['name', 'description', 'category', 'supplier']),
    { category: categoryFilter }
  );

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      deleteInventoryItem(itemId);
    }
  };

  const getStockStatus = (currentStock: number, minThreshold: number) => {
    if (currentStock <= minThreshold) {
      return { label: 'Low Stock', color: 'bg-red-100 text-red-800' };
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const categories = Array.from(new Set(inventory.map(item => item.category).filter(Boolean)));

  return (
    <>
      {/* Filters */}
      <div className="card">
        <div className="card-body p-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex-1 flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input bg-white/90 w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
              </div>
              {categories.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {(searchTerm || categoryFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                }}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Items Grid */}
      {filteredInventory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-20">
          {filteredInventory.map((item) => {
            const stockStatus = getStockStatus(item.currentStock, item.minThreshold);
            return (
              <div
                key={item.id}
                className="card cursor-pointer group hover:shadow-lg transition-shadow"
              >
                <div className="card-body p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {item.name}
                        </h3>
                        {item.category && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.category}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Stock:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.currentStock} {item.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Unit Cost:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(item.unitCost)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </div>

                    {item.supplier && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Supplier:</span>
                        <span className="text-sm text-gray-900 dark:text-white truncate ml-2">
                          {item.supplier}
                        </span>
                      </div>
                    )}

                    {item.location && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Location:</span>
                        <span className="text-sm text-gray-900 dark:text-white truncate ml-2">
                          {item.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Package className="h-12 w-12" />
          </div>
          <h3 className="empty-state-title">Inventory Management</h3>
          <p className="empty-state-description">
            {inventory.length === 0
              ? 'No inventory items yet. Click "Add Item" to create your first inventory item.'
              : 'No inventory items match your search criteria.'}
          </p>
        </div>
      )}

      {showForm && (
        <InventoryForm
          item={editingItem}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </>
  );
};

const SiteTransfersContent: React.FC = () => {
  const { siteTransfers, projects, inventory, deleteSiteTransfer } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<SiteTransfer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransfers = searchItems(siteTransfers, searchTerm, ['notes']);

  const handleEdit = (transfer: SiteTransfer) => {
    setEditingTransfer(transfer);
    setShowForm(true);
  };

  const handleDelete = (transferId: string) => {
    if (window.confirm('Are you sure you want to delete this site transfer?')) {
      deleteSiteTransfer(transferId);
    }
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'Unknown';
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown';
  };

  const getMaterialName = (materialId?: string) => {
    if (!materialId) return 'Unknown';
    const material = inventory.find(m => m.id === materialId);
    return material?.name || 'Unknown';
  };

  return (
    <>
      {/* Header */}
      <div className="card">
        <div className="card-body p-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Site Transfers</h2>
            </div>
            <button 
              onClick={() => {
                setEditingTransfer(null);
                setShowForm(true);
              }}
              className="w-full lg:w-auto btn-primary flex items-center justify-center text-xs px-3 py-1.5 lg:text-sm lg:px-3 lg:py-2"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5 lg:h-4 lg:w-4 lg:mr-2" />
              New Transfer
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body p-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex-1 flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transfers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input bg-white/90 w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
              </div>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Site Transfers Grid */}
      {filteredTransfers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-20">
          {filteredTransfers.map((transfer) => (
            <div
              key={transfer.id}
              className="card cursor-pointer group hover:shadow-lg transition-shadow"
            >
              <div className="card-body p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Truck className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {getMaterialName(transfer.materialId)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {transfer.quantity} units
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(transfer);
                      }}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(transfer.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      From:
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate ml-2">
                      {getProjectName(transfer.fromProjectId)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      To:
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate ml-2">
                      {getProjectName(transfer.toProjectId)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Date:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatDate(transfer.transferDate, 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {transfer.notes && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {transfer.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Truck className="h-12 w-12" />
          </div>
          <h3 className="empty-state-title">Site Transfers</h3>
          <p className="empty-state-description">
            {siteTransfers.length === 0
              ? 'No site transfers yet. Click "New Transfer" to create your first transfer.'
              : 'No site transfers match your search criteria.'}
          </p>
        </div>
      )}

      {showForm && (
        <SiteTransferForm
          transfer={editingTransfer}
          onClose={() => {
            setShowForm(false);
            setEditingTransfer(null);
          }}
        />
      )}
    </>
  );
};

const MaterialIssueContent: React.FC = () => {
  const { materialIssues, projects, tasks, inventory, deleteMaterialIssue } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingIssue, setEditingIssue] = useState<MaterialIssue | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIssues = searchItems(materialIssues, searchTerm, ['notes', 'issuedTo']);

  const handleEdit = (issue: MaterialIssue) => {
    setEditingIssue(issue);
    setShowForm(true);
  };

  const handleDelete = (issueId: string) => {
    if (window.confirm('Are you sure you want to delete this material issue?')) {
      deleteMaterialIssue(issueId);
    }
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'Unknown';
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown';
  };

  const getTaskName = (taskId?: string) => {
    if (!taskId) return null;
    const task = tasks.find(t => t.id === taskId);
    return task?.title || null;
  };

  const getMaterialName = (materialId?: string) => {
    if (!materialId) return 'Unknown';
    const material = inventory.find(m => m.id === materialId);
    return material?.name || 'Unknown';
  };

  return (
    <>
      {/* Header */}
      <div className="card">
        <div className="card-body p-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Material Issue</h2>
            </div>
            <button 
              onClick={() => {
                setEditingIssue(null);
                setShowForm(true);
              }}
              className="w-full lg:w-auto btn-primary flex items-center justify-center text-xs px-3 py-1.5 lg:text-sm lg:px-3 lg:py-2"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5 lg:h-4 lg:w-4 lg:mr-2" />
              Issue Material
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body p-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex-1 flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search material issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input bg-white/90 w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
              </div>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Material Issues Grid */}
      {filteredIssues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-20">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="card cursor-pointer group hover:shadow-lg transition-shadow"
            >
              <div className="card-body p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Upload className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {getMaterialName(issue.materialId)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {issue.quantity} units
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(issue);
                      }}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(issue.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Project:
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate ml-2">
                      {getProjectName(issue.projectId)}
                    </span>
                  </div>

                  {issue.taskId && getTaskName(issue.taskId) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Task:</span>
                      <span className="text-sm text-gray-900 dark:text-white truncate ml-2">
                        {getTaskName(issue.taskId)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Issued To:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white truncate ml-2">
                      {issue.issuedTo || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Date:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatDate(issue.issuedDate, 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {issue.notes && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {issue.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Upload className="h-12 w-12" />
          </div>
          <h3 className="empty-state-title">Material Issue</h3>
          <p className="empty-state-description">
            {materialIssues.length === 0
              ? 'No material issues yet. Click "Issue Material" to create your first issue.'
              : 'No material issues match your search criteria.'}
          </p>
        </div>
      )}

      {showForm && (
        <MaterialIssueForm
          issue={editingIssue}
          onClose={() => {
            setShowForm(false);
            setEditingIssue(null);
          }}
        />
      )}
    </>
  );
};

const MaterialReturnContent: React.FC = () => {
  const { materialReturns, projects, tasks, inventory, deleteMaterialReturn } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingReturn, setEditingReturn] = useState<MaterialReturn | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReturns = searchItems(materialReturns, searchTerm, ['notes', 'receivedBy']);

  const handleEdit = (returnItem: MaterialReturn) => {
    setEditingReturn(returnItem);
    setShowForm(true);
  };

  const handleDelete = (returnId: string) => {
    if (window.confirm('Are you sure you want to delete this material return?')) {
      deleteMaterialReturn(returnId);
    }
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'Unknown';
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown';
  };

  const getTaskName = (taskId?: string) => {
    if (!taskId) return null;
    const task = tasks.find(t => t.id === taskId);
    return task?.title || null;
  };

  const getMaterialName = (materialId?: string) => {
    if (!materialId) return 'Unknown';
    const material = inventory.find(m => m.id === materialId);
    return material?.name || 'Unknown';
  };

  return (
    <>
      {/* Header */}
      <div className="card">
        <div className="card-body p-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Material Return</h2>
            </div>
            <button 
              onClick={() => {
                setEditingReturn(null);
                setShowForm(true);
              }}
              className="w-full lg:w-auto btn-primary flex items-center justify-center text-xs px-3 py-1.5 lg:text-sm lg:px-3 lg:py-2"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5 lg:h-4 lg:w-4 lg:mr-2" />
              Return Material
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body p-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex-1 flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search material returns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input bg-white/90 w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
              </div>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Material Returns Grid */}
      {filteredReturns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-20">
          {filteredReturns.map((returnItem) => (
            <div
              key={returnItem.id}
              className="card cursor-pointer group hover:shadow-lg transition-shadow"
            >
              <div className="card-body p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Download className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {getMaterialName(returnItem.materialId)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {returnItem.quantity} units
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(returnItem);
                      }}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(returnItem.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Project:
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate ml-2">
                      {getProjectName(returnItem.projectId)}
                    </span>
                  </div>

                  {returnItem.taskId && getTaskName(returnItem.taskId) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Task:</span>
                      <span className="text-sm text-gray-900 dark:text-white truncate ml-2">
                        {getTaskName(returnItem.taskId)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Received By:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white truncate ml-2">
                      {returnItem.receivedBy || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Condition:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {returnItem.condition || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Date:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatDate(returnItem.returnDate, 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {returnItem.notes && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {returnItem.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Download className="h-12 w-12" />
          </div>
          <h3 className="empty-state-title">Material Return</h3>
          <p className="empty-state-description">
            {materialReturns.length === 0
              ? 'No material returns yet. Click "Return Material" to create your first return.'
              : 'No material returns match your search criteria.'}
          </p>
        </div>
      )}

      {showForm && (
        <MaterialReturnForm
          returnItem={editingReturn}
          onClose={() => {
            setShowForm(false);
            setEditingReturn(null);
          }}
        />
      )}
    </>
  );
};

const ConsumptionsContent: React.FC = () => {
  const { materialConsumptions, projects, tasks, inventory, deleteMaterialConsumption } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingConsumption, setEditingConsumption] = useState<MaterialConsumption | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConsumptions = searchItems(materialConsumptions, searchTerm, ['notes']);

  const handleEdit = (consumption: MaterialConsumption) => {
    setEditingConsumption(consumption);
    setShowForm(true);
  };

  const handleDelete = (consumptionId: string) => {
    if (window.confirm('Are you sure you want to delete this material consumption?')) {
      deleteMaterialConsumption(consumptionId);
    }
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'Unknown';
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown';
  };

  const getTaskName = (taskId?: string) => {
    if (!taskId) return null;
    const task = tasks.find(t => t.id === taskId);
    return task?.title || null;
  };

  const getMaterialName = (materialId?: string) => {
    if (!materialId) return 'Unknown';
    const material = inventory.find(m => m.id === materialId);
    return material?.name || 'Unknown';
  };

  return (
    <>
      {/* Header */}
      <div className="card">
        <div className="card-body p-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Material Consumptions</h2>
            </div>
            <button 
              onClick={() => {
                setEditingConsumption(null);
                setShowForm(true);
              }}
              className="w-full lg:w-auto btn-primary flex items-center justify-center text-xs px-3 py-1.5 lg:text-sm lg:px-3 lg:py-2"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5 lg:h-4 lg:w-4 lg:mr-2" />
              Record Consumption
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body p-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex-1 flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search consumptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input bg-white/90 w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
              </div>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Material Consumptions Grid */}
      {filteredConsumptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-20">
          {filteredConsumptions.map((consumption) => (
            <div
              key={consumption.id}
              className="card cursor-pointer group hover:shadow-lg transition-shadow"
            >
              <div className="card-body p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {getMaterialName(consumption.materialId)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {consumption.quantity} units
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(consumption);
                      }}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(consumption.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Project:
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate ml-2">
                      {getProjectName(consumption.projectId)}
                    </span>
                  </div>

                  {consumption.taskId && getTaskName(consumption.taskId) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Task:</span>
                      <span className="text-sm text-gray-900 dark:text-white truncate ml-2">
                        {getTaskName(consumption.taskId)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Date:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatDate(consumption.consumptionDate, 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {consumption.notes && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {consumption.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <BarChart3 className="h-12 w-12" />
          </div>
          <h3 className="empty-state-title">Material Consumptions</h3>
          <p className="empty-state-description">
            {materialConsumptions.length === 0
              ? 'No material consumptions yet. Click "Record Consumption" to create your first consumption record.'
              : 'No material consumptions match your search criteria.'}
          </p>
        </div>
      )}

      {showForm && (
        <MaterialConsumptionForm
          consumption={editingConsumption}
          onClose={() => {
            setShowForm(false);
            setEditingConsumption(null);
          }}
        />
      )}
    </>
  );
};

export default Commercial;
