import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Building, MapPin, User, AlertTriangle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { InventoryItem } from '@/types';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/utils';

interface InventoryFormProps {
  item?: InventoryItem | null;
  onClose: () => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ item, onClose }) => {
  const { addInventoryItem, updateInventoryItem, projects } = useData();
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={handleClose}
        />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full relative z-10">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {item ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300' : ''}`}
                    placeholder="Enter item name"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  id="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.category ? 'border-red-300' : ''}`}
                  placeholder="e.g., Cement, Steel, Wood"
                />
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.currentStock ? 'border-red-300' : ''}`}
                  />
                  {errors.currentStock && <p className="mt-1 text-sm text-red-600">{errors.currentStock}</p>}
                </div>

                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    name="unit"
                    id="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="tons">Tons</option>
                    <option value="m">Meters</option>
                    <option value="sqm">Square Meters</option>
                    <option value="cum">Cubic Meters</option>
                    <option value="bags">Bags</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="minThreshold" className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="maxThreshold" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="unitCost" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.unitCost ? 'border-red-300' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.unitCost && <p className="mt-1 text-sm text-red-600">{errors.unitCost}</p>}
              </div>

              <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter supplier name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter storage location"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (item ? 'UPDATE ITEM' : 'ADD ITEM')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryForm;

