import React, { useState, useEffect } from 'react';
import { X, Upload, Package, Building, Clipboard, User, Calendar } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { MaterialIssue } from '@/types';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/utils';

interface MaterialIssueFormProps {
  issue?: MaterialIssue | null;
  onClose: () => void;
}

const MaterialIssueForm: React.FC<MaterialIssueFormProps> = ({ issue, onClose }) => {
  const { addMaterialIssue, updateMaterialIssue, projects, tasks, inventory } = useData();
  const [formData, setFormData] = useState({
    projectId: '',
    taskId: '',
    materialId: '',
    quantity: '',
    issuedDate: '',
    issuedBy: '',
    issuedTo: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (issue) {
      setFormData({
        projectId: issue.projectId || '',
        taskId: issue.taskId || '',
        materialId: issue.materialId || '',
        quantity: issue.quantity?.toString() || '0',
        issuedDate: issue.issuedDate ? (typeof issue.issuedDate === 'string' ? issue.issuedDate : formatDate(new Date(issue.issuedDate), 'yyyy-MM-dd')) : formatDate(new Date(), 'yyyy-MM-dd'),
        issuedBy: issue.issuedBy || '',
        issuedTo: issue.issuedTo || '',
        notes: issue.notes || ''
      });
    } else {
      setFormData({
        projectId: '',
        taskId: '',
        materialId: '',
        quantity: '0',
        issuedDate: formatDate(new Date(), 'yyyy-MM-dd'),
        issuedBy: '',
        issuedTo: '',
        notes: ''
      });
    }
  }, [issue]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    if (!formData.materialId) {
      newErrors.materialId = 'Material is required';
    }

    if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.issuedDate) {
      newErrors.issuedDate = 'Issue date is required';
    }

    if (!formData.issuedTo.trim()) {
      newErrors.issuedTo = 'Issued to is required';
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
        projectId: formData.projectId,
        taskId: formData.taskId || undefined,
        materialId: formData.materialId,
        quantity: Number(formData.quantity),
        issuedDate: formData.issuedDate,
        issuedBy: formData.issuedBy.trim() || 'System',
        issuedTo: formData.issuedTo.trim(),
        notes: formData.notes.trim()
      };

      if (issue) {
        updateMaterialIssue(issue.id, issueData);
        toast.success('Material issue updated successfully');
      } else {
        addMaterialIssue(issueData);
        toast.success('Material issued successfully');
      }

      setFormData({
        projectId: '',
        taskId: '',
        materialId: '',
        quantity: '0',
        issuedDate: formatDate(new Date(), 'yyyy-MM-dd'),
        issuedBy: '',
        issuedTo: '',
        notes: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to save material issue:', error);
      toast.error('Failed to save material issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClose = () => {
    document.body.style.overflow = '';
    onClose();
  };

  const projectTasks = formData.projectId ? tasks.filter(t => t.projectId === formData.projectId) : [];

  return (
    <div className="modal-overlay">
      <div className="modal max-w-2xl">
        <div className="modal-header flex items-center justify-between">
          <h2 className="modal-title">
            {issue ? 'Edit Material Issue' : 'Issue Material'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0 ml-4"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="space-y-1 lg:space-y-4">
              <div>
                <label htmlFor="projectId" className="label">
                  Project *
                </label>
                <div className="relative">
                  <select
                    name="projectId"
                    id="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    className={`input appearance-none pr-10 ${errors.projectId ? 'input-error' : ''}`}
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.projectId && <p className="form-error">{errors.projectId}</p>}
              </div>

              {projectTasks.length > 0 && (
                <div>
                  <label htmlFor="taskId" className="label">
                    Task (Optional)
                  </label>
                  <div className="relative">
                    <select
                      name="taskId"
                      id="taskId"
                      value={formData.taskId}
                      onChange={handleChange}
                      className="input appearance-none pr-10"
                    >
                      <option value="">Select task</option>
                      {projectTasks.map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.title}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="materialId" className="label">
                  Material *
                </label>
                <div className="relative">
                  <select
                    name="materialId"
                    id="materialId"
                    value={formData.materialId}
                    onChange={handleChange}
                    className={`input appearance-none pr-10 ${errors.materialId ? 'input-error' : ''}`}
                  >
                    <option value="">Select material</option>
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.currentStock} {item.unit})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.materialId && <p className="form-error">{errors.materialId}</p>}
              </div>

              <div>
                <label htmlFor="quantity" className="label">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  className={errors.quantity ? 'input-error' : 'input'}
                  placeholder="0.00"
                />
                {errors.quantity && <p className="form-error">{errors.quantity}</p>}
              </div>

              <div>
                <label htmlFor="issuedDate" className="label">
                  Issue Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="issuedDate"
                    id="issuedDate"
                    value={formData.issuedDate}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.issuedDate ? 'input-error' : ''}`}
                  />
                </div>
                {errors.issuedDate && <p className="form-error">{errors.issuedDate}</p>}
              </div>

              <div>
                <label htmlFor="issuedBy" className="label">
                  Issued By
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="issuedBy"
                    id="issuedBy"
                    value={formData.issuedBy}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter issuer name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="issuedTo" className="label">
                  Issued To *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="issuedTo"
                    id="issuedTo"
                    value={formData.issuedTo}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.issuedTo ? 'input-error' : ''}`}
                    placeholder="Enter recipient name"
                  />
                </div>
                {errors.issuedTo && <p className="form-error">{errors.issuedTo}</p>}
              </div>

              <div>
                <label htmlFor="notes" className="label">
                  Notes
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="input resize-none"
                  placeholder="Enter any additional notes"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer flex-row justify-between space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner h-4 w-4 mr-2"></div>
                  {issue ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                issue ? 'Update Issue' : 'Issue Material'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialIssueForm;

