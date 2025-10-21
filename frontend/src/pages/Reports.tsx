import React, { useState } from 'react';
import { Download, FileText, BarChart3, TrendingUp, Calendar, Filter } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatCurrency } from '@/utils';

const Reports: React.FC = () => {
  const { getDashboardStats, projects, tasks, issues, pettyCash, attendance } = useData();
  const { hasPermission } = useAuth();
  const [selectedModule, setSelectedModule] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    to: formatDate(new Date(), 'yyyy-MM-dd')
  });
  const [reportFormat, setReportFormat] = useState('pdf');

  if (!hasPermission('reports')) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <BarChart3 className="h-12 w-12" />
        </div>
        <h3 className="empty-state-title">Access Denied</h3>
        <p className="empty-state-description">
          You don't have permission to access the reports module.
        </p>
      </div>
    );
  }

  const stats = getDashboardStats();

  const handleGenerateReport = () => {
    // In a real app, this would generate and download the report
    alert(`Generating ${reportFormat.toUpperCase()} report for ${selectedModule} from ${dateRange.from} to ${dateRange.to}`);
  };

  const reportModules = [
    { key: 'all', label: 'All Modules', icon: '📊' },
    { key: 'projects', label: 'Projects', icon: '🏗️' },
    { key: 'tasks', label: 'Tasks', icon: '✅' },
    { key: 'issues', label: 'Issues', icon: '⚠️' },
    { key: 'resources', label: 'Resources', icon: '👥' },
    { key: 'attendance', label: 'Attendance', icon: '⏰' },
    { key: 'petty_cash', label: 'Petty Cash', icon: '💰' },
    { key: 'commercial', label: 'Commercial', icon: '🏪' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate and export comprehensive reports for all modules
          </p>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Report Configuration</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="label">Module</label>
              <select
                className="input"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
              >
                {reportModules.map((module) => (
                  <option key={module.key} value={module.key}>
                    {module.icon} {module.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">From Date</label>
              <input
                type="date"
                className="input"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">To Date</label>
              <input
                type="date"
                className="input"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Format</label>
              <select
                className="input"
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value)}
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleGenerateReport}
              className="btn-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Projects</p>
              <p className="stat-value">{stats.totalProjects}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Active Tasks</p>
              <p className="stat-value">{stats.pendingTasks}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Open Issues</p>
              <p className="stat-value">{stats.openIssues}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Expenses</p>
              <p className="stat-value">{formatCurrency(stats.totalExpenses)}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="card-body">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Project Summary</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Comprehensive overview of all projects including progress, budget, and timeline.
            </p>
            <button className="btn-secondary w-full">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="card-body">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Financial Report</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Detailed financial analysis including expenses, budget utilization, and cost trends.
            </p>
            <button className="btn-secondary w-full">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="card-body">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Attendance Report</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Employee attendance summary with working hours, overtime, and attendance rates.
            </p>
            <button className="btn-secondary w-full">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
        </div>
        <div className="card-body">
          <div className="space-y-3">
            {[
              { name: 'Project Summary - Q1 2024', date: '2024-01-15', format: 'PDF', size: '2.3 MB' },
              { name: 'Financial Report - March 2024', date: '2024-03-31', format: 'Excel', size: '1.8 MB' },
              { name: 'Attendance Report - March 2024', date: '2024-03-31', format: 'PDF', size: '1.2 MB' }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{report.name}</p>
                    <p className="text-xs text-gray-500">{report.date} • {report.format} • {report.size}</p>
                  </div>
                </div>
                <button className="btn-secondary btn-sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
