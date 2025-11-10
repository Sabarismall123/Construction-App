import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Upload, Download, Clock, User, X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, searchItems, filterItems } from '@/utils';
import { ATTENDANCE_STATUSES } from '@/constants';
import AttendanceForm from '@/components/AttendanceForm';
import MobileDropdown from '@/components/MobileDropdown';
import * as XLSX from 'xlsx';

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
    
    // Convert record.date to YYYY-MM-DD format for comparison
    let recordDate: string;
    try {
      const date = new Date(record.date);
      recordDate = date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error parsing record date:', record.date, error);
      return false;
    }
    
    
    return recordDate === dateFilter;
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
    try {
      // Prepare data for export
      const exportData = filteredAttendance.map(record => ({
        'Employee Name': record.employeeName,
        'Mobile Number': record.mobileNumber || 'N/A',
        'Project': getProjectName(record.projectId),
        'Labour Type': record.labourType || 'N/A',
        'Date': formatDate(record.date, 'MMM dd, yyyy'),
        'Time In': record.timeIn || 'N/A',
        'Time Out': record.timeOut || 'N/A',
        'Hours': record.hours || 0,
        'Overtime Hours': record.overtimeHours || 0,
        'Status': ATTENDANCE_STATUSES.find(s => s.value === record.status)?.label || record.status,
        'Notes': record.notes || 'N/A',
        'Created At': formatDate(record.createdAt, 'MMM dd, yyyy HH:mm'),
        'Updated At': formatDate(record.updatedAt, 'MMM dd, yyyy HH:mm')
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 20 }, // Employee Name
        { wch: 15 }, // Mobile Number
        { wch: 25 }, // Project
        { wch: 15 }, // Labour Type
        { wch: 12 }, // Date
        { wch: 10 }, // Time In
        { wch: 10 }, // Time Out
        { wch: 8 },  // Hours
        { wch: 12 }, // Overtime Hours
        { wch: 12 }, // Status
        { wch: 30 }, // Notes
        { wch: 20 }, // Created At
        { wch: 20 }  // Updated At
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance Records');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `attendance_records_${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      // Show success message
      alert(`Attendance records exported successfully as ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export attendance records. Please try again.');
    }
  };

  // Prepare dropdown options
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...ATTENDANCE_STATUSES.map(status => ({
      value: status.value,
      label: status.label
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
    setStatusFilter('');
    setProjectFilter('');
    setDateFilter('');
  };

  const hasActiveFilters = searchTerm || statusFilter || projectFilter || dateFilter;

  return (
    <div className="mobile-content w-full px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track employee attendance and working hours
          </p>
        </div>
        {hasRole(['admin', 'manager', 'site_supervisor']) && (
          <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-2">
            <button
              onClick={handleBulkUpload}
              className="w-full lg:w-auto btn-secondary flex items-center justify-center text-xs px-3 py-1.5 lg:text-sm lg:px-3 lg:py-2"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5 lg:h-4 lg:w-4 lg:mr-2" />
              Bulk Upload
            </button>
            <button
              onClick={handleExport}
              className="w-full lg:w-auto btn-secondary flex items-center justify-center text-xs px-3 py-1.5 lg:text-sm lg:px-3 lg:py-2"
            >
              <Download className="h-3.5 w-3.5 mr-1.5 lg:h-4 lg:w-4 lg:mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="w-full lg:w-auto btn-primary flex items-center justify-center text-xs px-3 py-1.5 lg:text-sm lg:px-3 lg:py-2"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5 lg:h-4 lg:w-4 lg:mr-2" />
              Create Labour
            </button>
          </div>
        )}
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
                placeholder="Search employees..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:space-x-3">
              <div className="flex-1">
                <MobileDropdown
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="All Statuses"
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
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  placeholder="Filter by date"
                />
              </div>
            </div>

            {/* Debug Info and Clear Filters */}
            <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="text-sm text-gray-600">
                Showing {filteredAttendance.length} of {attendance.length} attendance records
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

      {/* Attendance List */}
      {filteredAttendance.length === 0 ? (
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
      ) : (
        <div className="space-y-4">
          {filteredAttendance.map((record) => (
            <div key={record.id} className="card hover:shadow-md transition-shadow">
              <div className="card-body p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {record.employeeName}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {record.mobileNumber || 'No mobile number'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1 flex-shrink-0">
                        {hasRole(['admin', 'manager', 'site_supervisor']) && (
                          <>
                            <button
                              onClick={() => {
                                setEditingAttendance(record);
                                setShowForm(true);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteAttendance(record.id)}
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
                        <span className="text-xs font-medium text-gray-700 mr-2">Project:</span>
                        <span className="text-xs text-gray-900 truncate flex-1 text-right">
                          {getProjectName(record.projectId)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 mr-2">Labour Type:</span>
                        <span className="text-xs text-gray-900">
                          {record.labourType || 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 mr-2">Date:</span>
                        <span className="text-xs text-gray-900">
                          {formatDate(record.date)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 mr-2">Time In:</span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {record.timeIn}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 mr-2">Time Out:</span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {record.timeOut || 'N/A'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 mr-2">Hours:</span>
                        <div className="flex items-center">
                          <span className="text-xs font-medium text-gray-900">{record.hours}h</span>
                          {record.overtimeHours > 0 && (
                            <span className="text-xs text-orange-600 ml-1">+{record.overtimeHours}h OT</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 mr-2">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {ATTENDANCE_STATUSES.find(s => s.value === record.status)?.label}
                        </span>
                      </div>

                      {record.notes && (
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-medium text-gray-700 mr-2">Notes:</span>
                          <span className="text-xs text-gray-900 text-right flex-1">
                            {record.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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
