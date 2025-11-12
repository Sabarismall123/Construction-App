import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Resource } from '@/types';
import { RESOURCE_TYPES, RESOURCE_STATUSES } from '@/constants';
import { toast } from 'react-hot-toast';

interface ResourceFormProps {
  resource?: Resource | null;
  onClose: () => void;
}

const ResourceForm: React.FC<ResourceFormProps> = ({ resource, onClose }) => {
  const { addResource, updateResource, projects } = useData();
  const [formData, setFormData] = useState({
    name: '',
    type: 'labor' as const,
    quantity: 0,
    allocatedQuantity: 0,
    status: 'available' as const,
    projectId: '',
    unit: '',
    cost: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name,
        type: resource.type,
        quantity: resource.quantity,
        allocatedQuantity: resource.allocatedQuantity,
        status: resource.status,
        projectId: resource.projectId || '',
        unit: resource.unit,
        cost: resource.cost
      });
    } else {
      setFormData({
        name: '',
        type: 'labor',
        quantity: 0,
        allocatedQuantity: 0,
        status: 'available',
        projectId: '',
        unit: '',
        cost: 0
      });
    }
    setErrors({});
  }, [resource]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Resource name is required';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (formData.allocatedQuantity < 0) {
      newErrors.allocatedQuantity = 'Allocated quantity cannot be negative';
    }

    if (formData.allocatedQuantity > formData.quantity) {
      newErrors.allocatedQuantity = 'Allocated quantity cannot exceed total quantity';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    if (formData.cost < 0) {
      newErrors.cost = 'Cost cannot be negative';
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
      const resourceData = {
        name: formData.name.trim(),
        type: formData.type,
        quantity: formData.quantity,
        allocatedQuantity: formData.allocatedQuantity,
        status: formData.status,
        projectId: formData.projectId || undefined,
        unit: formData.unit.trim(),
        cost: formData.cost
      };

      if (resource) {
        updateResource(resource.id, resourceData);
        toast.success('Resource updated successfully');
      } else {
        addResource(resourceData);
        toast.success('Resource created successfully');
      }

      onClose();
    } catch (error) {
      toast.error('Failed to save resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'quantity' || name === 'allocatedQuantity' || name === 'cost') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-2xl">
        <div className="modal-header flex items-center justify-between">
          <h2 className="modal-title">
            {resource ? 'Edit Resource' : 'Add New Resource'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0 ml-4"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="space-y-1 lg:space-y-4">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="label">
                    Resource Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={errors.name ? 'input-error' : 'input'}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter resource name"
                  />
                  {errors.name && <p className="form-error">{errors.name}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="type" className="label">
                    Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    className="input"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    {RESOURCE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="quantity" className="label">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    className={errors.quantity ? 'input-error' : 'input'}
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="Enter quantity"
                    min="0"
                    step="0.01"
                  />
                  {errors.quantity && <p className="form-error">{errors.quantity}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="allocatedQuantity" className="label">
                    Allocated Quantity
                  </label>
                  <input
                    type="number"
                    id="allocatedQuantity"
                    name="allocatedQuantity"
                    className={errors.allocatedQuantity ? 'input-error' : 'input'}
                    value={formData.allocatedQuantity}
                    onChange={handleChange}
                    placeholder="Enter allocated quantity"
                    min="0"
                    step="0.01"
                    max={formData.quantity}
                  />
                  {errors.allocatedQuantity && <p className="form-error">{errors.allocatedQuantity}</p>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="unit" className="label">
                    Unit *
                  </label>
                  <input
                    type="text"
                    id="unit"
                    name="unit"
                    className={errors.unit ? 'input-error' : 'input'}
                    value={formData.unit}
                    onChange={handleChange}
                    placeholder="e.g., kg, pieces, hours"
                  />
                  {errors.unit && <p className="form-error">{errors.unit}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="cost" className="label">
                    Cost *
                  </label>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    className={errors.cost ? 'input-error' : 'input'}
                    value={formData.cost}
                    onChange={handleChange}
                    placeholder="Enter cost"
                    min="0"
                    step="0.01"
                  />
                  {errors.cost && <p className="form-error">{errors.cost}</p>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status" className="label">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="input"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {RESOURCE_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="projectId" className="label">
                    Project
                  </label>
                  <div className="relative">
                    <select
                      id="projectId"
                      name="projectId"
                      className="input appearance-none pr-10"
                      value={formData.projectId}
                      onChange={handleChange}
                    >
                      <option value="">Select project (optional)</option>
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
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer flex-row justify-between space-x-2">
            <button
              type="button"
              onClick={onClose}
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
                  {resource ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                resource ? 'Update Resource' : 'Create Resource'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceForm;

