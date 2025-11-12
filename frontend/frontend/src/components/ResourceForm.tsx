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
    cost: 0,
    description: '',
    location: '',
    category: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    // Labor-specific fields
    mobileNumber: '',
    aadharNumber: '',
    // Material-specific fields
    supplier: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name,
        type: resource.type,
        quantity: resource.quantity,
        allocatedQuantity: resource.allocatedQuantity || 0,
        status: resource.status,
        projectId: resource.projectId || '',
        unit: resource.unit,
        cost: resource.cost,
        description: (resource as any).description || '',
        location: (resource as any).location || '',
        category: (resource as any).category || '',
        purchaseDate: (resource as any).purchaseDate 
          ? new Date((resource as any).purchaseDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        mobileNumber: (resource as any).mobileNumber || '',
        aadharNumber: (resource as any).aadharNumber || '',
        supplier: (resource as any).supplier || ''
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
        cost: 0,
        description: '',
        location: '',
        category: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        mobileNumber: '',
        aadharNumber: '',
        supplier: ''
      });
    }
    setErrors({});
  }, [resource]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Resource name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Labor-specific validations
    if (formData.type === 'labor') {
      if (!formData.mobileNumber.trim()) {
        newErrors.mobileNumber = 'Mobile number is required for labor';
      } else if (!/^[0-9]{10}$/.test(formData.mobileNumber.replace(/\s+/g, ''))) {
        newErrors.mobileNumber = 'Mobile number must be 10 digits';
      }
      if (!formData.aadharNumber.trim()) {
        newErrors.aadharNumber = 'Aadhar card number is required for labor';
      } else if (!/^[0-9]{12}$/.test(formData.aadharNumber.replace(/\s+/g, ''))) {
        newErrors.aadharNumber = 'Aadhar card number must be 12 digits';
      }
      // For labor, quantity, unit, location, category, purchaseDate, and cost are optional
    }

    // Material-specific validations
    if (formData.type === 'material') {
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required for material';
      }

      if (!formData.category.trim()) {
        newErrors.category = 'Category is required for material';
      }

      if (!formData.purchaseDate) {
        newErrors.purchaseDate = 'Purchase date is required for material';
      }

      if (formData.quantity <= 0) {
        newErrors.quantity = 'Quantity must be greater than 0';
      }

      if (!formData.unit.trim()) {
        newErrors.unit = 'Unit is required for material';
      }

      if (formData.cost < 0) {
        newErrors.cost = 'Cost cannot be negative';
      }

      if (!formData.supplier.trim()) {
        newErrors.supplier = 'Supplier is required for material';
      }
    }

    // Common validations (for both types)
    if (formData.allocatedQuantity < 0) {
      newErrors.allocatedQuantity = 'Allocated quantity cannot be negative';
    }

    if (formData.quantity > 0 && formData.allocatedQuantity > formData.quantity) {
      newErrors.allocatedQuantity = 'Allocated quantity cannot exceed total quantity';
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
      const resourceData: any = {
        name: formData.name.trim(),
        type: formData.type,
        status: formData.status,
        projectId: formData.projectId || undefined,
        description: formData.description.trim()
      };

      // Add type-specific fields
      if (formData.type === 'labor') {
        resourceData.mobileNumber = formData.mobileNumber.trim();
        resourceData.aadharNumber = formData.aadharNumber.trim();
        // For labor, quantity, unit, cost, location, category, purchaseDate are optional
        if (formData.quantity > 0) {
          resourceData.quantity = formData.quantity;
        }
        if (formData.unit.trim()) {
          resourceData.unit = formData.unit.trim();
        }
        if (formData.cost > 0) {
          resourceData.cost = formData.cost;
        }
        if (formData.location.trim()) {
          resourceData.location = formData.location.trim();
        }
        if (formData.category.trim()) {
          resourceData.category = formData.category.trim();
        }
        if (formData.purchaseDate) {
          resourceData.purchaseDate = formData.purchaseDate;
        }
        if (formData.allocatedQuantity > 0) {
          resourceData.allocatedQuantity = formData.allocatedQuantity;
        }
      } else if (formData.type === 'material') {
        // For material, all fields are required
        resourceData.quantity = formData.quantity;
        resourceData.allocatedQuantity = formData.allocatedQuantity;
        resourceData.unit = formData.unit.trim();
        resourceData.cost = formData.cost;
        resourceData.location = formData.location.trim();
        resourceData.category = formData.category.trim();
        resourceData.purchaseDate = formData.purchaseDate;
        resourceData.supplier = formData.supplier.trim();
      }

      if (resource) {
        updateResource(resource.id, resourceData);
        toast.success('Resource updated successfully');
      } else {
        addResource(resourceData);
        toast.success('Resource created successfully');
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving resource:', error);
      // Show clearer error messages
      if (error?.response?.data?.details) {
        const errorDetails = error.response.data.details;
        if (Array.isArray(errorDetails)) {
          const errorMessages = errorDetails.map((detail: any) => {
            const field = detail.path || detail.param || '';
            const message = detail.msg || detail.message || 'Validation error';
            return `${field ? field.charAt(0).toUpperCase() + field.slice(1) + ': ' : ''}${message}`;
          }).join(', ');
          toast.error(`Validation failed: ${errorMessages}`);
        } else {
          toast.error(error.response.data.error || 'Failed to save resource');
        }
      } else if (error?.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to save resource. Please check all required fields.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'quantity' || name === 'cost') {
      const numValue = value === '' ? 0 : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else if (name === 'allocatedQuantity') {
      // Allow empty string for allocated quantity, but convert to 0 if empty
      const numValue = value === '' ? 0 : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else if (name === 'mobileNumber' || name === 'aadharNumber') {
      // Only allow digits for mobile and Aadhar
      const digitsOnly = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
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
            <div className="space-y-4">
              {/* Basic Information Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-2">
                  Basic Information
                </h3>
                
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
                    <label htmlFor="description" className="label">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className={errors.description ? 'input-error' : 'input'}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief description of the resource"
                      rows={2}
                    />
                    {errors.description && <p className="form-error">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* Quantity & Cost Section - Only required for Material */}
              {formData.type === 'material' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-2">
                    Quantity & Cost
                  </h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="quantity" className="label">
                        Total Quantity *
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        className={errors.quantity ? 'input-error' : 'input'}
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                      {errors.quantity && <p className="form-error">{errors.quantity}</p>}
                    </div>

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
                        placeholder="e.g., pieces, kg, hours"
                        list="unit-suggestions"
                      />
                      <datalist id="unit-suggestions">
                        <option value="pieces" />
                        <option value="kg" />
                        <option value="tons" />
                        <option value="hours" />
                        <option value="days" />
                        <option value="liters" />
                        <option value="meters" />
                        <option value="sqft" />
                      </datalist>
                      {errors.unit && <p className="form-error">{errors.unit}</p>}
                    </div>
                  </div>

                  <div className="form-row">
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
                        placeholder="0"
                        min="0"
                        step="0.01"
                        max={formData.quantity}
                      />
                      {errors.allocatedQuantity && <p className="form-error">{errors.allocatedQuantity}</p>}
                      {formData.quantity > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round((formData.allocatedQuantity / formData.quantity) * 100)}% allocated
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="cost" className="label">
                        Cost per Unit *
                      </label>
                      <input
                        type="number"
                        id="cost"
                        name="cost"
                        className={errors.cost ? 'input-error' : 'input'}
                        value={formData.cost}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      {errors.cost && <p className="form-error">{errors.cost}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Location & Details Section - Only required for Material */}
              {formData.type === 'material' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-2">
                    Location & Details
                  </h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="location" className="label">
                        Location *
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        className={errors.location ? 'input-error' : 'input'}
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Site A, Warehouse, Office"
                      />
                      {errors.location && <p className="form-error">{errors.location}</p>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="category" className="label">
                        Category *
                      </label>
                      <input
                        type="text"
                        id="category"
                        name="category"
                        className={errors.category ? 'input-error' : 'input'}
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="e.g., Heavy Equipment, Tools, Materials"
                      />
                      {errors.category && <p className="form-error">{errors.category}</p>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="purchaseDate" className="label">
                        Purchase Date *
                      </label>
                      <input
                        type="date"
                        id="purchaseDate"
                        name="purchaseDate"
                        className={errors.purchaseDate ? 'input-error' : 'input'}
                        value={formData.purchaseDate}
                        onChange={handleChange}
                      />
                      {errors.purchaseDate && <p className="form-error">{errors.purchaseDate}</p>}
                    </div>

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
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="projectId" className="label">
                        Assign to Project (Optional)
                      </label>
                      <select
                        id="projectId"
                        name="projectId"
                        className="input"
                        value={formData.projectId}
                        onChange={handleChange}
                      >
                        <option value="">No project assignment</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Status and Project Assignment - Show for both types */}
              {formData.type === 'labor' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-2">
                    Additional Information
                  </h3>

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
                        Assign to Project (Optional)
                      </label>
                      <select
                        id="projectId"
                        name="projectId"
                        className="input"
                        value={formData.projectId}
                        onChange={handleChange}
                      >
                        <option value="">No project assignment</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Type-Specific Information */}
              {formData.type === 'labor' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-2">
                    Labor Details
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="mobileNumber" className="label">
                        Mobile Number *
                      </label>
                      <input
                        type="text"
                        id="mobileNumber"
                        name="mobileNumber"
                        className={errors.mobileNumber ? 'input-error' : 'input'}
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        placeholder="10 digits"
                        maxLength={10}
                      />
                      {errors.mobileNumber && <p className="form-error">{errors.mobileNumber}</p>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="aadharNumber" className="label">
                        Aadhar Card Number *
                      </label>
                      <input
                        type="text"
                        id="aadharNumber"
                        name="aadharNumber"
                        className={errors.aadharNumber ? 'input-error' : 'input'}
                        value={formData.aadharNumber}
                        onChange={handleChange}
                        placeholder="12 digits"
                        maxLength={12}
                      />
                      {errors.aadharNumber && <p className="form-error">{errors.aadharNumber}</p>}
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'material' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-2">
                    Material Details
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="supplier" className="label">
                        Supplier Name *
                      </label>
                      <input
                        type="text"
                        id="supplier"
                        name="supplier"
                        className={errors.supplier ? 'input-error' : 'input'}
                        value={formData.supplier}
                        onChange={handleChange}
                        placeholder="Enter supplier name"
                      />
                      {errors.supplier && <p className="form-error">{errors.supplier}</p>}
                    </div>
                  </div>
                </div>
              )}
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

