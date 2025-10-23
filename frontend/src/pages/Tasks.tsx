import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, User, MessageSquare, Download, Paperclip } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, searchItems, filterItems } from '@/utils';
import { TASK_STATUSES, PRIORITIES } from '@/constants';
import TaskForm from '@/components/TaskForm';
import TaskDetail from '@/components/TaskDetail';
import MobileDropdown from '@/components/MobileDropdown';

const Tasks: React.FC = () => {
  const { tasks, projects, deleteTask } = useData();
  const { hasRole, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<any>(null);

  const filteredTasks = filterItems(
    searchItems(tasks, searchTerm, ['title', 'description']),
    { 
      status: statusFilter,
      priority: priorityFilter,
      projectId: projectFilter
    }
  );

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleView = (task: any) => {
    setSelectedTask(task);
    setShowDetail(true);
  };

  const handleDelete = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedTask(null);
  };

  const getStatusColor = (status: string) => {
    const statusConfig = TASK_STATUSES.find(s => s.value === status);
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

  const handleExportExcel = () => {
    // Create CSV content
    const headers = ['Title', 'Project', 'Status', 'Priority', 'Assigned To', 'Due Date', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredTasks.map(task => [
        `"${task.title}"`,
        `"${getProjectName(task.projectId)}"`,
        `"${TASK_STATUSES.find(s => s.value === task.status)?.label || task.status}"`,
        `"${PRIORITIES.find(p => p.value === task.priority)?.label || task.priority}"`,
        `"${task.assignedTo}"`,
        `"${formatDate(task.dueDate)}"`,
        `"${task.description.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mobile-content w-full px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and track project tasks and assignments
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleExportExcel}
            className="w-full btn-secondary flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
          {hasRole(['admin', 'manager', 'site_supervisor']) && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full btn-primary flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body p-4">
          <div className="flex flex-col space-y-3">
            <div className="relative">
              <div className="search-icon">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <MobileDropdown
                options={[
                  { value: '', label: 'All Statuses' },
                  ...TASK_STATUSES.map(status => ({
                    value: status.value,
                    label: status.label
                  }))
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="All Statuses"
              />
            </div>
            <div>
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
            <div>
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

      {/* Debug Info */}
      <div className="text-xs text-gray-500 mb-2">
        Showing {filteredTasks.length} of {tasks.length} tasks
        {(statusFilter || priorityFilter || projectFilter) && (
          <span className="ml-2">
            (filters active: {statusFilter && 'status '}{priorityFilter && 'priority '}{projectFilter && 'project '})
          </span>
        )}
      </div>

      {/* Clear Filters Button */}
      {(statusFilter || priorityFilter || projectFilter || searchTerm) && (
        <div className="mb-4">
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setPriorityFilter('');
              setProjectFilter('');
            }}
            className="text-sm text-primary-600 hover:text-primary-700 underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="card hover:shadow-md transition-shadow">
            <div className="card-body p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                      {task.title}
                    </h3>
                    {task.attachments && task.attachments.length > 0 && (
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Paperclip className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {task.attachments.length}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">{task.description}</p>
                </div>
                <div className="flex space-x-1 flex-shrink-0">
                  <button
                    onClick={() => handleView(task)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {hasRole(['admin', 'manager', 'site_supervisor']) && (
                    <>
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
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
                  <span className="truncate">{getProjectName(task.projectId)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium text-gray-700 mr-2">Assigned:</span>
                  <div className="flex items-center">
                    <div className="h-5 w-5 bg-gray-300 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <span className="text-xs font-medium text-gray-600">
                        {task.assignedTo?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="truncate">User {task.assignedTo}</span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{formatDate(task.dueDate)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex space-x-2">
                  <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                    {PRIORITIES.find(p => p.value === task.priority)?.label}
                  </span>
                  <span className={`status-badge ${getStatusColor(task.status)}`}>
                    {TASK_STATUSES.find(s => s.value === task.status)?.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search className="h-12 w-12" />
            </div>
            <h3 className="empty-state-title">No tasks found</h3>
            <p className="empty-state-description">
              {searchTerm || statusFilter || priorityFilter || projectFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first task.'}
            </p>
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseForm}
        />
      )}

      {/* Task Detail Modal */}
      {showDetail && selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default Tasks;
