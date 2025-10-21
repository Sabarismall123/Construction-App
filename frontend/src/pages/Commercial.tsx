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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commercial</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage inventory, material transfers, issues, returns, and consumptions
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button className="btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Submodule Navigation */}
      <div className="card">
        <div className="card-body">
          <nav className="flex space-x-8">
            {COMMERCIAL_SUBMODULES.map((submodule) => {
              const isActive = location.pathname === `/commercial/${submodule.key}`;
              return (
                <Link
                  key={submodule.key}
                  to={`/commercial/${submodule.key}`}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{submodule.icon}</span>
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
const InventoryContent: React.FC = () => (
  <div className="card">
    <div className="card-body">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Inventory Management</h2>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </button>
      </div>
      <div className="empty-state">
        <div className="empty-state-icon">
          <Package className="h-12 w-12" />
        </div>
        <h3 className="empty-state-title">Inventory Management</h3>
        <p className="empty-state-description">
          Manage your material inventory, track stock levels, and set thresholds.
        </p>
      </div>
    </div>
  </div>
);

const SiteTransfersContent: React.FC = () => (
  <div className="card">
    <div className="card-body">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Site Transfers</h2>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </button>
      </div>
      <div className="empty-state">
        <div className="empty-state-icon">
          <Truck className="h-12 w-12" />
        </div>
        <h3 className="empty-state-title">Site Transfers</h3>
        <p className="empty-state-description">
          Record material transfers between different sites and projects.
        </p>
      </div>
    </div>
  </div>
);

const MaterialIssueContent: React.FC = () => (
  <div className="card">
    <div className="card-body">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Material Issue</h2>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Issue Material
        </button>
      </div>
      <div className="empty-state">
        <div className="empty-state-icon">
          <Upload className="h-12 w-12" />
        </div>
        <h3 className="empty-state-title">Material Issue</h3>
        <p className="empty-state-description">
          Issue materials to projects and tasks for construction work.
        </p>
      </div>
    </div>
  </div>
);

const MaterialReturnContent: React.FC = () => (
  <div className="card">
    <div className="card-body">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Material Return</h2>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Return Material
        </button>
      </div>
      <div className="empty-state">
        <div className="empty-state-icon">
          <Download className="h-12 w-12" />
        </div>
        <h3 className="empty-state-title">Material Return</h3>
        <p className="empty-state-description">
          Return unused materials back to inventory.
        </p>
      </div>
    </div>
  </div>
);

const ConsumptionsContent: React.FC = () => (
  <div className="card">
    <div className="card-body">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Material Consumptions</h2>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Record Consumption
        </button>
      </div>
      <div className="empty-state">
        <div className="empty-state-icon">
          <BarChart3 className="h-12 w-12" />
        </div>
        <h3 className="empty-state-title">Material Consumptions</h3>
        <p className="empty-state-description">
          Track material consumption per project and task.
        </p>
      </div>
    </div>
  </div>
);

export default Commercial;
