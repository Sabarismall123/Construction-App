import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Package, Truck, Upload, Download, BarChart3, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { COMMERCIAL_SUBMODULES } from '@/constants';
import InventoryForm from '@/components/InventoryForm';
import SiteTransferForm from '@/components/SiteTransferForm';
import MaterialIssueForm from '@/components/MaterialIssueForm';
import MaterialReturnForm from '@/components/MaterialReturnForm';
import MaterialConsumptionForm from '@/components/MaterialConsumptionForm';
import { InventoryItem, SiteTransfer, MaterialIssue, MaterialReturn, MaterialConsumption } from '@/types';

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
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Commercial</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage inventory, material transfers, issues, returns, and consumptions
          </p>
        </div>
        <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-3">
          <button className="w-full lg:w-auto btn-secondary flex items-center justify-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="w-full lg:w-auto btn-primary flex items-center justify-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

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
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  return (
    <>
      <div className="card">
        <div className="card-body p-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Inventory Management</h2>
            </div>
            <button 
              onClick={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
              className="w-full lg:w-auto btn-primary flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>
        </div>
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
  const [showForm, setShowForm] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<SiteTransfer | null>(null);

  return (
    <>
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
              className="w-full lg:w-auto btn-primary flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Transfer
            </button>
          </div>
        </div>
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
  const [showForm, setShowForm] = useState(false);
  const [editingIssue, setEditingIssue] = useState<MaterialIssue | null>(null);

  return (
    <>
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
              className="w-full lg:w-auto btn-primary flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Issue Material
            </button>
          </div>
        </div>
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
  const [showForm, setShowForm] = useState(false);
  const [editingReturn, setEditingReturn] = useState<MaterialReturn | null>(null);

  return (
    <>
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
              className="w-full lg:w-auto btn-primary flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Return Material
            </button>
          </div>
        </div>
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
  const [showForm, setShowForm] = useState(false);
  const [editingConsumption, setEditingConsumption] = useState<MaterialConsumption | null>(null);

  return (
    <>
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
              className="w-full lg:w-auto btn-primary flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Consumption
            </button>
          </div>
        </div>
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
