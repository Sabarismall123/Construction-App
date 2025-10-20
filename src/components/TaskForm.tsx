import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Task } from '@/types';
import { formatDate, validateDateRange } from '@/utils';
import { TASK_STATUSES, PRIORITIES } from '@/constants';
import { toast } from 'react-hot-toast';

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const { addTask, updateTask, projects } = useData();
  const [formData, setFormData] = useState({
    title: '',
    assignedTo: '',
    priority: 'medium' as const,
    status: 'todo' as const,
    dueDate: '',
    description: '',
    projectId: '',
    attachments: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        assignedTo: task.assignedTo,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        description: task.description,
        projectId: task.projectId,
        attachments: task.attachments
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
  }, [task]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.assignedTo.trim()) {
      newErrors.assignedTo = 'Assigned to is required';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
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
      const taskData = {
        title: formData.title.trim(),
        assignedTo: formData.assignedTo.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate,
        description: formData.description.trim(),
        projectId: formData.projectId,
        attachments: formData.attachments
      };

      if (task) {
        updateTask(task.id, taskData);
        toast.success('Task updated successfully');
      } else {
        addTask(taskData);
        toast.success('Task created successfully');
      }

      onClose();
    } catch (error) {
      toast.error('Failed to save task');
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
            {task ? 'Edit Task' : 'Add New Task'}
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
                  Task Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className={errors.title ? 'input-error' : 'input'}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
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
                    {TASK_STATUSES.map((status) => (
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
                  placeholder="Enter task description"
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
                  {task ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                task ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
