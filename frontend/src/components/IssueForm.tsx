import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Issue } from '@/types';
import { formatDate, validateDateRange } from '@/utils';
import { ISSUE_STATUSES, PRIORITIES } from '@/constants';
import { toast } from 'react-hot-toast';

interface IssueFormProps {
  issue?: Issue;
  onClose: () => void;
}

const IssueForm: React.FC<IssueFormProps> = ({ issue, onClose }) => {
  const { addIssue, updateIssue, projects } = useData();
  const [formData, setFormData] = useState({
    title: '',
    projectId: '',
    priority: 'medium' as const,
    status: 'open' as const,
    assignedTo: '',
    dueDate: '',
    description: '',
    attachments: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (issue) {
      setFormData({
        title: issue.title,
        projectId: issue.projectId,
        priority: issue.priority,
        status: issue.status,
        assignedTo: issue.assignedTo,
        dueDate: issue.dueDate,
        description: issue.description,
        attachments: issue.attachments
      });
    } else {
      // Set default due date
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setFormData(prev => ({
        ...prev,
        dueDate: formatDate(nextWeek, 'yyyy-MM-dd')
      }));
    }
  }, [issue]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Issue title is required';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    if (!formData.assignedTo.trim()) {
      newErrors.assignedTo = 'Assigned to is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
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
      const issueData = {
        title: formData.title.trim(),
        projectId: formData.projectId,
        priority: formData.priority,
        status: formData.status,
        assignedTo: formData.assignedTo.trim(),
        dueDate: formData.dueDate,
        description: formData.description.trim(),
        attachments: formData.attachments
      };

      if (issue) {
        updateIssue(issue.id, issueData);
        toast.success('Issue updated successfully');
      } else {
        addIssue(issueData);
        toast.success('Issue created successfully');
      }

      onClose();
    } catch (error) {
      toast.error('Failed to save issue');
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
        <div className="modal-header">
          <h2 className="modal-title">
            {issue ? 'Edit Issue' : 'Add New Issue'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="space-y-6">
              <div className="form-group">
                <label htmlFor="title" className="label">
                  Issue Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className={errors.title ? 'input-error' : 'input'}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter issue title"
                />
                {errors.title && <p className="form-error">{errors.title}</p>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="projectId" className="label">
                    Project *
                  </label>
                  <select
                    id="projectId"
                    name="projectId"
                    className={errors.projectId ? 'input-error' : 'input'}
                    value={formData.projectId}
                    onChange={handleChange}
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && <p className="form-error">{errors.projectId}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="assignedTo" className="label">
                    Assigned To *
                  </label>
                  <input
                    type="text"
                    id="assignedTo"
                    name="assignedTo"
                    className={errors.assignedTo ? 'input-error' : 'input'}
                    value={formData.assignedTo}
                    onChange={handleChange}
                    placeholder="Enter assignee name"
                  />
                  {errors.assignedTo && <p className="form-error">{errors.assignedTo}</p>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority" className="label">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    className="input"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status" className="label">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="input"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {ISSUE_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dueDate" className="label">
                  Due Date *
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  className={errors.dueDate ? 'input-error' : 'input'}
                  value={formData.dueDate}
                  onChange={handleChange}
                />
                {errors.dueDate && <p className="form-error">{errors.dueDate}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="description" className="label">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className={errors.description ? 'input-error' : 'input'}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter issue description"
                />
                {errors.description && <p className="form-error">{errors.description}</p>}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="loading-spinner h-4 w-4 mr-2"></div>
                  {issue ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                issue ? 'Update Issue' : 'Create Issue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueForm;
