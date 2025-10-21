import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, DollarSign, Receipt, TrendingUp } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatCurrency, searchItems, filterItems } from '@/utils';
import { PETTY_CASH_CATEGORIES } from '@/constants';

const PettyCash: React.FC = () => {
  const { pettyCash, projects, deletePettyCash } = useData();
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Petty Cash</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage small expenses and reimbursements
          </p>
        </div>
        {hasRole(['admin', 'manager', 'site_supervisor']) && (
          <button
            onClick={() => alert('Add Expense form would open here')}
            className="btn-primary mt-4 sm:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
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
            </div>
            <div>
              <select
                className="input"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {PETTY_CASH_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="input"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="date"
                className="input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From Date"
              />
            </div>
            <div>
              <input
                type="date"
                className="input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To Date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Description</th>
                <th className="table-header-cell">Paid To</th>
                <th className="table-header-cell">Category</th>
                <th className="table-header-cell">Project</th>
                <th className="table-header-cell">Amount</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="table-row">
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">{formatDate(expense.date)}</span>
                  </td>
                  <td className="table-cell">
                    <div>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      {expense.attachment && (
                        <p className="text-xs text-gray-500">📎 Attachment</p>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">{expense.paidTo}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <span className="mr-2">{getCategoryIcon(expense.category)}</span>
                      <span className="text-sm text-gray-900">
                        {PETTY_CASH_CATEGORIES.find(c => c.value === expense.category)?.label}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">{getProjectName(expense.projectId)}</span>
                  </td>
                  <td className="table-cell">
                    <span className="font-medium text-gray-900">{formatCurrency(expense.amount)}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      {hasRole(['admin', 'manager', 'site_supervisor']) && (
                        <>
                          <button
                            onClick={() => alert('Edit Expense form would open here')}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deletePettyCash(expense.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExpenses.length === 0 && (
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
        )}
      </div>
    </div>
  );
};

export default PettyCash;
