import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Project } from '@/types';
import { formatDate, validateDateRange } from '@/utils';
import { PROJECT_STATUSES } from '@/constants';
import { toast } from 'react-hot-toast';

interface ProjectFormProps {
  project?: Project;
  onClose: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onClose }) => {
  const { addProject, updateProject } = useData();
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    status: 'planning' as const,
    startDate: '',
    endDate: '',
    budget: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        client: project.client,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        budget: project.budget.toString(),
        description: project.description
      });
    } else {
      // Set default dates
      const today = new Date();
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        startDate: formatDate(today, 'yyyy-MM-dd'),
        endDate: formatDate(nextMonth, 'yyyy-MM-dd')
      }));
    }
  }, [project]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.client.trim()) {
      newErrors.client = 'Client name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && !validateDateRange(formData.startDate, formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData.budget.trim()) {
      newErrors.budget = 'Budget is required';
    } else if (isNaN(Number(formData.budget)) || Number(formData.budget) <= 0) {
      newErrors.budget = 'Budget must be a positive number';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const projectData = {
        name: formData.name.trim(),
        client: formData.client.trim(),
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: Number(formData.budget),
        description: formData.description.trim(),
        progress: project?.progress || 0
      };

      if (project) {
        updateProject(project.id, projectData);
        toast.success('Project updated successfully');
      } else {
        addProject(projectData);
        toast.success('Project created successfully');
      }

      onClose();
    } catch (error) {
      toast.error('Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-2xl">
        <div className="modal-header flex items-center justify-between">
          <h2 className="modal-title text-lg lg:text-xl">
            {project ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 lg:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0 ml-2 lg:ml-4"
            aria-label="Close"
          >
            <X className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="space-y-1 lg:space-y-4">
              <div className="form-row flex-col lg:grid">
                <div className="form-group">
                  <label htmlFor="name" className="label text-xs lg:text-sm">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`${errors.name ? 'input-error' : 'input'} text-sm`}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter project name"
                  />
                  {errors.name && <p className="form-error text-xs">{errors.name}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="client" className="label text-xs lg:text-sm">
                    Client *
                  </label>
                  <input
                    type="text"
                    id="client"
                    name="client"
                    className={`${errors.client ? 'input-error' : 'input'} text-sm`}
                    value={formData.client}
                    onChange={handleChange}
                    placeholder="Enter client name"
                  />
                  {errors.client && <p className="form-error text-xs">{errors.client}</p>}
                </div>
              </div>

              <div className="form-row flex-col lg:grid">
                <div className="form-group">
                  <label htmlFor="status" className="label text-xs lg:text-sm">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="input text-sm"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {PROJECT_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="budget" className="label text-xs lg:text-sm">
                    Budget *
                  </label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    className={`${errors.budget ? 'input-error' : 'input'} text-sm`}
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="Enter budget amount"
                    min="0"
                    step="0.01"
                  />
                  {errors.budget && <p className="form-error text-xs">{errors.budget}</p>}
                </div>
              </div>

              <div className="form-row flex-col lg:grid">
                <div className="form-group">
                  <label htmlFor="startDate" className="label text-xs lg:text-sm">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className={`${errors.startDate ? 'input-error' : 'input'} text-sm`}
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                  {errors.startDate && <p className="form-error text-xs">{errors.startDate}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="endDate" className="label text-xs lg:text-sm">
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    className={`${errors.endDate ? 'input-error' : 'input'} text-sm`}
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                  {errors.endDate && <p className="form-error text-xs">{errors.endDate}</p>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="label text-xs lg:text-sm">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className={`input resize-none w-full text-sm ${errors.description ? 'input-error' : ''}`}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter project description"
                />
                {errors.description && <p className="form-error text-xs">{errors.description}</p>}
              </div>
            </div>
          </div>

          <div className="modal-footer flex-row justify-between space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 text-xs px-3 py-2 lg:text-sm lg:px-4 lg:py-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 text-xs px-3 py-2 lg:text-sm lg:px-4 lg:py-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner h-3 w-3 lg:h-4 lg:w-4 mr-1.5 lg:mr-2"></div>
                  <span className="text-xs lg:text-sm">{project ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                project ? 'Update Project' : 'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
