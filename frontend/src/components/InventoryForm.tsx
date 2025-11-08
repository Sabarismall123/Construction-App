import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, MapPin, User, AlertTriangle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { InventoryItem } from '@/types';
import { toast } from 'react-hot-toast';

interface InventoryFormProps {
  item?: InventoryItem | null;
  onClose: () => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ item, onClose }) => {
  const { addInventoryItem, updateInventoryItem } = useData();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    currentStock: '',
    minThreshold: '',
    maxThreshold: '',
    unit: 'pcs',
    unitCost: '',
    supplier: '',
    location: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || '',
        currentStock: item.currentStock?.toString() || '0',
        minThreshold: item.minThreshold?.toString() || '0',
        maxThreshold: item.maxThreshold?.toString() || '0',
        unit: item.unit || 'pcs',
        unitCost: item.unitCost?.toString() || '0',
        supplier: item.supplier || '',
        location: item.location || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        currentStock: '0',
        minThreshold: '0',
        maxThreshold: '0',
        unit: 'pcs',
        unitCost: '0',
        supplier: '',
        location: ''
      });
    }
  }, [item]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (isNaN(Number(formData.currentStock)) || Number(formData.currentStock) < 0) {
      newErrors.currentStock = 'Current stock must be a non-negative number';
    }

    if (isNaN(Number(formData.unitCost)) || Number(formData.unitCost) < 0) {
      newErrors.unitCost = 'Unit cost must be a non-negative number';
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
      const inventoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        currentStock: Number(formData.currentStock),
        minThreshold: Number(formData.minThreshold) || 0,
        maxThreshold: Number(formData.maxThreshold) || 0,
        unit: formData.unit,
        unitCost: Number(formData.unitCost),
        supplier: formData.supplier.trim(),
        location: formData.location.trim()
      };

      if (item) {
        updateInventoryItem(item.id, inventoryData);
        toast.success('Inventory item updated successfully');
      } else {
        addInventoryItem(inventoryData);
        toast.success('Inventory item created successfully');
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        currentStock: '0',
        minThreshold: '0',
        maxThreshold: '0',
        unit: 'pcs',
        unitCost: '0',
        supplier: '',
        location: ''
      });
      setErrors({});

      // Close modal after successful submission
      onClose();
    } catch (error) {
      console.error('Failed to save inventory item:', error);
      toast.error('Failed to save inventory item. Please try again.');
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

  return (
    <div className="modal-overlay">
      <div className="modal max-w-2xl">
        <div className="modal-header flex items-center justify-between">
          <h2 className="modal-title">
            {item ? 'Edit Inventory Item' : 'Add New Inventory Item'}
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
                <label htmlFor="name" className="label">
                  Item Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.name ? 'input-error' : ''}`}
                    placeholder="Enter item name"
                  />
                </div>
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="description" className="label">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="input resize-none"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label htmlFor="category" className="label">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  id="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? 'input-error' : 'input'}
                  placeholder="e.g., Cement, Steel, Wood"
                />
                {errors.category && <p className="form-error">{errors.category}</p>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="currentStock" className="label">
                    Current Stock *
                  </label>
                  <input
                    type="number"
                    name="currentStock"
                    id="currentStock"
                    value={formData.currentStock}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={errors.currentStock ? 'input-error' : 'input'}
                  />
                  {errors.currentStock && <p className="form-error">{errors.currentStock}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="unit" className="label">
                    Unit
                  </label>
                  <div className="relative">
                    <select
                      name="unit"
                      id="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="input appearance-none pr-10"
                    >
                      <option value="pcs">Pieces</option>
                      <option value="kg">Kilograms</option>
                      <option value="tons">Tons</option>
                      <option value="m">Meters</option>
                      <option value="sqm">Square Meters</option>
                      <option value="cum">Cubic Meters</option>
                      <option value="bags">Bags</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="minThreshold" className="label">
                    Min Threshold
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AlertTriangle className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="minThreshold"
                      id="minThreshold"
                      value={formData.minThreshold}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="input pl-10"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="maxThreshold" className="label">
                    Max Threshold
                  </label>
                  <input
                    type="number"
                    name="maxThreshold"
                    id="maxThreshold"
                    value={formData.maxThreshold}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="unitCost" className="label">
                  Unit Cost *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="unitCost"
                    id="unitCost"
                    value={formData.unitCost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`input pl-10 ${errors.unitCost ? 'input-error' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.unitCost && <p className="form-error">{errors.unitCost}</p>}
              </div>

              <div>
                <label htmlFor="supplier" className="label">
                  Supplier
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="supplier"
                    id="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter supplier name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="label">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter storage location"
                  />
                </div>
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
                  {item ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                item ? 'Update Item' : 'Add Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;

