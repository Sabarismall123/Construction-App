import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, DollarSign, Receipt, TrendingUp, X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatCurrency, searchItems, filterItems } from '@/utils';
import { PETTY_CASH_CATEGORIES } from '@/constants';
import MobileDropdown from '@/components/MobileDropdown';
import PettyCashForm from '@/components/PettyCashForm';

const PettyCash: React.FC = () => {
  const { pettyCash, projects, deletePettyCash } = useData();
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const filteredExpenses = filterItems(
    searchItems(pettyCash, searchTerm, ['paidTo', 'description']),
    { 
      category: categoryFilter,
      projectId: projectFilter
    }
  ).filter(expense => {
    if (!dateFrom && !dateTo) return true;
    const expenseDate = new Date(expense.date);
    const fromDate = dateFrom ? new Date(dateFrom) : new Date(0);
    const toDate = dateTo ? new Date(dateTo) : new Date();
    return expenseDate >= fromDate && expenseDate <= toDate;
  });

  const getCategoryIcon = (category: string) => {
    const categoryConfig = PETTY_CASH_CATEGORIES.find(c => c.value === category);
    return categoryConfig?.icon || '💰';
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Prepare dropdown options
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...PETTY_CASH_CATEGORIES.map(category => ({
      value: category.value,
      label: category.label
    }))
  ];

  const projectOptions = [
    { value: '', label: 'All Projects' },
    ...projects.map(project => ({
      value: project.id,
      label: project.name
    }))
  ];

  const clearAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setProjectFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchTerm || categoryFilter || projectFilter || dateFrom || dateTo;

  return (
    <div className="mobile-content w-full px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Petty Cash</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track and manage small expenses and reimbursements
          </p>
        </div>
        {hasRole(['admin', 'manager', 'site_supervisor']) && (
          <button
            onClick={() => {
              setEditingExpense(null);
              setShowForm(true);
            }}
            className="w-full lg:w-auto btn-primary flex items-center justify-center text-xs px-3 py-1.5 lg:text-sm lg:px-3 lg:py-2"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5 lg:h-4 lg:w-4 lg:mr-2" />
            Add Expense
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Expenses</p>
              <p className="stat-value">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">This Month</p>
              <p className="stat-value">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Records</p>
              <p className="stat-value">{filteredExpenses.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <Receipt className="h-6 w-6 text-white" />
            </div>
          </div>
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
                placeholder="Search expenses..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:space-x-3">
              <div className="flex-1">
                <MobileDropdown
                  options={categoryOptions}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  placeholder="All Categories"
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <MobileDropdown
                  options={projectOptions}
                  value={projectFilter}
                  onChange={setProjectFilter}
                  placeholder="All Projects"
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  className="input w-full"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From Date"
                />
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  className="input w-full"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To Date"
                />
              </div>
            </div>

            {/* Debug Info and Clear Filters */}
            <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="text-sm text-gray-600">
                Showing {filteredExpenses.length} of {pettyCash.length} expenses
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="w-full lg:w-auto btn-secondary flex items-center justify-center text-xs px-3 py-1.5 lg:text-sm lg:px-3 lg:py-2"
                >
                  <X className="h-3.5 w-3.5 mr-1.5 lg:h-4 lg:w-4 lg:mr-2" />
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Receipt className="h-12 w-12" />
          </div>
          <h3 className="empty-state-title">No expenses found</h3>
          <p className="empty-state-description">
            {searchTerm || categoryFilter || projectFilter || dateFrom || dateTo
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first expense.'}
          </p>
        </div>
      ) : (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className="card hover:shadow-md transition-shadow">
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {expense.description}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          Paid to: {expense.paidTo}
                        </p>
                      </div>
                      <div className="flex space-x-1 flex-shrink-0">
                        {hasRole(['admin', 'manager', 'site_supervisor']) && (
                          <>
                            <button
                              onClick={() => {
                                setEditingExpense(expense);
                                setShowForm(true);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deletePettyCash(expense.id)}
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
                        <span className="text-xs font-medium text-gray-700 mr-2">Date:</span>
                        <span className="text-xs text-gray-900">
                          {formatDate(expense.date)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 mr-2">Category:</span>
                        <div className="flex items-center">
                          <span className="mr-1">{getCategoryIcon(expense.category)}</span>
                          <span className="text-xs text-gray-900">
                            {PETTY_CASH_CATEGORIES.find(c => c.value === expense.category)?.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 mr-2">Project:</span>
                        <span className="text-xs text-gray-900 truncate flex-1 text-right">
                          {getProjectName(expense.projectId)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 mr-2">Amount:</span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>

                      {expense.attachment && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700 mr-2">Attachment:</span>
                          <span className="text-xs text-gray-500">📎 Available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

      {/* Petty Cash Form Modal */}
      {showForm && (
        <PettyCashForm
          expense={editingExpense}
          onClose={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
};

export default PettyCash;
