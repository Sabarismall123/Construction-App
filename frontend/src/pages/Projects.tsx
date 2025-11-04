import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, DollarSign, User, Download } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatCurrency, searchItems, filterItems } from '@/utils';
import { PROJECT_STATUSES } from '@/constants';
import ProjectForm from '@/components/ProjectForm';
import ProjectDetail from '@/components/ProjectDetail';
import MobileDropdown from '@/components/MobileDropdown';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { projects, deleteProject } = useData();
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<any>(null);

  const filteredProjects = filterItems(
    searchItems(projects, searchTerm, ['name', 'client', 'description']),
    { status: statusFilter }
  );

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleView = (project: any) => {
    navigate(`/projects/${project.id}`);
  };

  const handleDelete = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedProject(null);
  };

  const getStatusColor = (status: string) => {
    const statusConfig = PROJECT_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const handleExportExcel = () => {
    // Create CSV content
    const headers = ['Name', 'Client', 'Status', 'Start Date', 'End Date', 'Budget', 'Progress', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredProjects.map(project => [
        `"${project.name}"`,
        `"${project.client}"`,
        `"${PROJECT_STATUSES.find(s => s.value === project.status)?.label || project.status}"`,
        `"${formatDate(project.startDate)}"`,
        `"${formatDate(project.endDate)}"`,
        `"${formatCurrency(project.budget)}"`,
        `"${project.progress}%"`,
        `"${project.description.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `projects_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mobile-content w-full px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your construction projects and track their progress
          </p>
        </div>
        <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-3">
          <button
            onClick={handleExportExcel}
            className="w-full lg:w-auto btn-secondary flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
          {hasRole(['admin', 'manager']) && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full lg:w-auto btn-primary flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
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
                placeholder="Search projects..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <MobileDropdown
                options={[
                  { value: '', label: 'All Statuses' },
                  ...PROJECT_STATUSES.map(status => ({
                    value: status.value,
                    label: status.label
                  }))
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="All Statuses"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.map((project) => (
          <div 
            key={project.id} 
            className="card hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleView(project)}
          >
            <div className="card-body p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1 truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 truncate">{project.client}</p>
                  <span className={`status-badge ${getStatusColor(project.status)}`}>
                    {PROJECT_STATUSES.find(s => s.value === project.status)?.label}
                  </span>
                </div>
                <div className="flex space-x-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleView(project)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {hasRole(['admin', 'manager']) && (
                    <>
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
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
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{formatCurrency(project.budget)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Project Manager</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                {project.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Search className="h-12 w-12" />
          </div>
          <h3 className="empty-state-title">No projects found</h3>
          <p className="empty-state-description">
            {searchTerm || statusFilter
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first project.'}
          </p>
        </div>
      )}

      {/* Project Form Modal */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          onClose={handleCloseForm}
        />
      )}

      {/* Project Detail Modal */}
      {showDetail && selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default Projects;
