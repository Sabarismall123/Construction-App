import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, User, AlertTriangle, Paperclip } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, searchItems, filterItems } from '@/utils';
import { ISSUE_STATUSES, PRIORITIES } from '@/constants';
import IssueForm from '@/components/IssueForm';
import IssueDetail from '@/components/IssueDetail';
import MobileDropdown from '@/components/MobileDropdown';

const Issues: React.FC = () => {
  const { issues, projects, users, deleteIssue } = useData();
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [editingIssue, setEditingIssue] = useState<any>(null);

  const filteredIssues = filterItems(
    searchItems(issues, searchTerm, ['title', 'description']),
    { 
      status: statusFilter,
      priority: priorityFilter,
      projectId: projectFilter
    }
  );

  const handleEdit = (issue: any) => {
    setEditingIssue(issue);
    setShowForm(true);
  };

  const handleView = (issue: any) => {
    setSelectedIssue(issue);
    setShowDetail(true);
  };

  const handleDelete = (issueId: string) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      deleteIssue(issueId);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingIssue(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedIssue(null);
  };

  const getStatusColor = (status: string) => {
    const statusConfig = ISSUE_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const priorityConfig = PRIORITIES.find(p => p.value === priority);
    return priorityConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const getUserName = (assignedTo: any) => {
    if (!assignedTo) return 'Unassigned';
    
    // Handle different types of assignedTo (string, object, etc.)
    const assignedToId = typeof assignedTo === 'string' 
      ? assignedTo 
      : (assignedTo._id ? assignedTo._id.toString() : assignedTo.toString());
    
    const user = users.find(u => {
      const userId = u.id?.toString() || u._id?.toString() || u.id;
      return userId === assignedToId || userId === assignedTo?.toString();
    });
    return user?.name || 'Unknown User';
  };

  return (
    <div className="mobile-content w-full px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Issues</h1>
          <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Track and manage project issues and problems
          </p>
        </div>
        <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-2">
          {/* Allow all users including employees to add issues */}
          <button
            onClick={() => {
              setEditingIssue(null);
              setShowForm(true);
            }}
            className="w-full lg:w-auto btn-primary flex items-center justify-center text-xs px-3 py-1.5 lg:text-sm lg:px-3 lg:py-2"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5 lg:h-4 lg:w-4 lg:mr-2" />
            Add Issue
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.98) 0%, rgba(255, 248, 235, 0.95) 100%)',
        border: '2px solid rgba(217, 119, 6, 0.15)',
        boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div className="card-body p-4 md:p-5">
          <div className="flex flex-col space-y-3">
            <div className="relative flex-1 lg:max-w-md">
              <div className="search-icon">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search issues..."
                className="search-input bg-white/90"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-3">
              <div className="lg:w-auto lg:min-w-[180px]">
                <MobileDropdown
                  options={[
                    { value: '', label: 'All Statuses' },
                    ...ISSUE_STATUSES.map(status => ({
                      value: status.value,
                      label: status.label
                    }))
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="All Statuses"
                />
              </div>
              <div className="lg:w-auto lg:min-w-[180px]">
                <MobileDropdown
                  options={[
                    { value: '', label: 'All Priorities' },
                    ...PRIORITIES.map(priority => ({
                      value: priority.value,
                      label: priority.label
                    }))
                  ]}
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                  placeholder="All Priorities"
                />
              </div>
              <div className="lg:w-auto lg:min-w-[180px]">
                <MobileDropdown
                  options={[
                    { value: '', label: 'All Projects' },
                    ...projects.map(project => ({
                      value: project.id,
                      label: project.name
                    }))
                  ]}
                  value={projectFilter}
                  onChange={setProjectFilter}
                  placeholder="All Projects"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-20">
        {filteredIssues.map((issue) => (
          <div 
            key={issue.id} 
            className="card hover:shadow-md transition-shadow cursor-pointer group"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.98) 0%, rgba(255, 248, 235, 0.95) 100%)',
              border: '2px solid rgba(217, 119, 6, 0.15)',
              boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            onClick={() => handleView(issue)}
          >
            <div className="card-body p-4 md:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                      {issue.title}
                    </h3>
                    {issue.attachments && issue.attachments.length > 0 && (
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Paperclip className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {issue.attachments.length}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">{issue.description}</p>
                </div>
                <div className="flex space-x-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleView(issue)}
                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {hasRole(['admin', 'manager', 'site_supervisor']) && (
                    <>
                      <button
                        onClick={() => handleEdit(issue)}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(issue.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium text-gray-700 mr-2">Project:</span>
                  <span className="truncate">{getProjectName(issue.projectId)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium text-gray-700 mr-2">Assigned:</span>
                  <div className="flex items-center">
                    {issue.assignedTo ? (
                      <>
                        <div className="h-5 w-5 bg-gray-300 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                          <span className="text-xs font-medium text-gray-600">
                            {getUserName(issue.assignedTo)?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <span className="truncate">{getUserName(issue.assignedTo)}</span>
                      </>
                    ) : (
                      <>
                        <div className="h-5 w-5 bg-gray-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                          <span className="text-xs font-medium text-gray-500">-</span>
                        </div>
                        <span className="truncate text-gray-400 italic">Unassigned</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{formatDate(issue.dueDate)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex space-x-2">
                  <span className={`priority-badge ${getPriorityColor(issue.priority)}`}>
                    {PRIORITIES.find(p => p.value === issue.priority)?.label}
                  </span>
                  <span className={`status-badge ${getStatusColor(issue.status)}`}>
                    {ISSUE_STATUSES.find(s => s.value === issue.status)?.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

      </div>

      {/* Empty State */}
      {filteredIssues.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <h3 className="empty-state-title">No issues found</h3>
          <p className="empty-state-description">
            {searchTerm || statusFilter || priorityFilter || projectFilter
              ? 'Try adjusting your search or filter criteria.'
              : 'Great! No issues to report.'}
          </p>
        </div>
      )}

      {/* Issue Form Modal */}
      {showForm && (
        <IssueForm
          issue={editingIssue}
          onClose={handleCloseForm}
        />
      )}

      {/* Issue Detail Modal */}
      {showDetail && selectedIssue && (
        <IssueDetail
          issue={selectedIssue}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default Issues;
