import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Upload, Download, Clock, User } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, searchItems, filterItems } from '@/utils';
import { ATTENDANCE_STATUSES } from '@/constants';
import AttendanceForm from '@/components/AttendanceForm';

const Attendance: React.FC = () => {
  const { attendance, projects, deleteAttendance } = useData();
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<any>(null);

  const filteredAttendance = filterItems(
    searchItems(attendance, searchTerm, ['employeeName']),
    { 
      status: statusFilter,
      projectId: projectFilter
    }
  ).filter(record => {
    if (!dateFilter) return true;
    return record.date === dateFilter;
  });

  const getStatusColor = (status: string) => {
    const statusConfig = ATTENDANCE_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const handleBulkUpload = () => {
    // In a real app, this would open a file picker and process CSV/Excel
    alert('Bulk upload feature would be implemented here');
  };

  const handleExport = () => {
    // In a real app, this would export to CSV/Excel
    alert('Export feature would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track employee attendance and working hours
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          {hasRole(['admin', 'manager', 'site_supervisor']) && (
            <>
              <button
                onClick={handleBulkUpload}
                className="btn-secondary"
              >
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </button>
              <button
                onClick={handleExport}
                className="btn-secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Labour
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <div className="search-icon">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                {ATTENDANCE_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
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
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filter by date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Employee</th>
                <th className="table-header-cell">Project</th>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Time In</th>
                <th className="table-header-cell">Time Out</th>
                <th className="table-header-cell">Hours</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredAttendance.map((record) => (
                <tr key={record.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">{record.employeeName}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">{getProjectName(record.projectId)}</span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">{formatDate(record.date)}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {record.timeIn}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {record.timeOut || 'N/A'}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm font-medium">{record.hoursWorked}h</span>
                    {record.overtime > 0 && (
                      <span className="text-xs text-orange-600 ml-1">+{record.overtime}h OT</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${getStatusColor(record.status)}`}>
                      {ATTENDANCE_STATUSES.find(s => s.value === record.status)?.label}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      {hasRole(['admin', 'manager', 'site_supervisor']) && (
                        <>
                          <button
                            onClick={() => setEditingAttendance(record)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteAttendance(record.id)}
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

        {filteredAttendance.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Clock className="h-12 w-12" />
            </div>
            <h3 className="empty-state-title">No attendance records found</h3>
            <p className="empty-state-description">
              {searchTerm || statusFilter || projectFilter || dateFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding attendance records.'}
            </p>
          </div>
        )}
      </div>

      {/* Create Labour Form Modal */}
      {showForm && (
        <AttendanceForm
          attendance={editingAttendance}
          onClose={() => {
            setShowForm(false);
            setEditingAttendance(null);
          }}
        />
      )}
    </div>
  );
};

export default Attendance;
