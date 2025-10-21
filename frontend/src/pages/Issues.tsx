import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, User, AlertTriangle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, searchItems, filterItems } from '@/utils';
import { ISSUE_STATUSES, PRIORITIES } from '@/constants';
import IssueForm from '@/components/IssueForm';
import IssueDetail from '@/components/IssueDetail';

const Issues: React.FC = () => {
  const { issues, projects, deleteIssue } = useData();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage project issues and problems
          </p>
        </div>
        {hasRole(['admin', 'manager', 'site_supervisor']) && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary mt-4 sm:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Issue
          </button>
        )}
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
                  placeholder="Search issues..."
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
                {ISSUE_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="input"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                {PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
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
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Issue</th>
                <th className="table-header-cell">Project</th>
                <th className="table-header-cell">Assigned To</th>
                <th className="table-header-cell">Priority</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Due Date</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredIssues.map((issue) => (
                <tr key={issue.id} className="table-row">
                  <td className="table-cell">
                    <div>
                      <p className="font-medium text-gray-900">{issue.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{issue.description}</p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">{getProjectName(issue.projectId)}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-gray-600">
                          {issue.assignedTo?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">User {issue.assignedTo}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`priority-badge ${getPriorityColor(issue.priority)}`}>
                      {PRIORITIES.find(p => p.value === issue.priority)?.label}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${getStatusColor(issue.status)}`}>
                      {ISSUE_STATUSES.find(s => s.value === issue.status)?.label}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(issue.dueDate)}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(issue)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {hasRole(['admin', 'manager', 'site_supervisor']) && (
                        <>
                          <button
                            onClick={() => handleEdit(issue)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(issue.id)}
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
      </div>

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
