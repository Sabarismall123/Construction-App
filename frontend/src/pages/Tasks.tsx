import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, User, MessageSquare, Download } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, searchItems, filterItems } from '@/utils';
import { TASK_STATUSES, PRIORITIES } from '@/constants';
import TaskForm from '@/components/TaskForm';
import TaskDetail from '@/components/TaskDetail';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and track project tasks and assignments
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          <button
            onClick={handleExportExcel}
            className="btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
          {hasRole(['admin', 'manager', 'site_supervisor']) && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </button>
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
                  placeholder="Search tasks..."
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
                {TASK_STATUSES.map((status) => (
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

      {/* Tasks List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Task</th>
                <th className="table-header-cell">Project</th>
                <th className="table-header-cell">Assigned To</th>
                <th className="table-header-cell">Priority</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Due Date</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="table-row">
                  <td className="table-cell">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900 dark:text-white">{getProjectName(task.projectId)}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-gray-600">
                          {task.assignedTo?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">User {task.assignedTo}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                      {PRIORITIES.find(p => p.value === task.priority)?.label}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${getStatusColor(task.status)}`}>
                      {TASK_STATUSES.find(s => s.value === task.status)?.label}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(task.dueDate)}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(task)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {hasRole(['admin', 'manager', 'site_supervisor']) && (
                        <>
                          <button
                            onClick={() => handleEdit(task)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
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
