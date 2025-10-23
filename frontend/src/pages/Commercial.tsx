import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Package, Truck, Upload, Download, BarChart3, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { COMMERCIAL_SUBMODULES } from '@/constants';

const Commercial: React.FC = () => {
  const { hasPermission } = useAuth();
  const location = useLocation();

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
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commercial</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage inventory, material transfers, issues, returns, and consumptions
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <button className="w-full btn-secondary flex items-center justify-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="w-full btn-primary flex items-center justify-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Submodule Navigation */}
      <div className="card-body p-4">
        <nav className="flex flex-col space-y-2">
          {COMMERCIAL_SUBMODULES.map((submodule) => {
            const isActive = location.pathname === `/commercial/${submodule.key}`;
            return (
              <Link
                key={submodule.key}
                to={`/commercial/${submodule.key}`}
                className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 text-lg">{submodule.icon}</span>
                {submodule.label}
              </Link>
            );
          })}
        </nav>
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
const InventoryContent: React.FC = () => (
  <div className="card-body p-4">
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">Inventory Management</h2>
        <button className="w-full btn-primary flex items-center justify-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </button>
      </div>
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Package className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Inventory Management</h3>
        <p className="text-sm text-gray-500">
          Manage your material inventory, track stock levels, and set thresholds.
        </p>
      </div>
    </div>
  </div>
);

const SiteTransfersContent: React.FC = () => (
  <div className="card-body p-4">
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">Site Transfers</h2>
        <button className="w-full btn-primary flex items-center justify-center">
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </button>
      </div>
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Truck className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Site Transfers</h3>
        <p className="text-sm text-gray-500">
          Record material transfers between different sites and projects.
        </p>
      </div>
    </div>
  </div>
);

const MaterialIssueContent: React.FC = () => (
  <div className="card-body p-4">
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">Material Issue</h2>
        <button className="w-full btn-primary flex items-center justify-center">
          <Plus className="h-4 w-4 mr-2" />
          Issue Material
        </button>
      </div>
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Upload className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Material Issue</h3>
        <p className="text-sm text-gray-500">
          Issue materials to projects and tasks for construction work.
        </p>
      </div>
    </div>
  </div>
);

const MaterialReturnContent: React.FC = () => (
  <div className="card-body p-4">
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">Material Return</h2>
        <button className="w-full btn-primary flex items-center justify-center">
          <Plus className="h-4 w-4 mr-2" />
          Return Material
        </button>
      </div>
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Download className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Material Return</h3>
        <p className="text-sm text-gray-500">
          Return unused materials back to inventory.
        </p>
      </div>
    </div>
  </div>
);

const ConsumptionsContent: React.FC = () => (
  <div className="card-body p-4">
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">Material Consumptions</h2>
        <button className="w-full btn-primary flex items-center justify-center">
          <Plus className="h-4 w-4 mr-2" />
          Record Consumption
        </button>
      </div>
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Material Consumptions</h3>
        <p className="text-sm text-gray-500">
          Track material consumption per project and task.
        </p>
      </div>
    </div>
  </div>
);

export default Commercial;
