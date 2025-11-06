import React, { useState, useEffect } from 'react';
import { X, BarChart3, Package, Building, Clipboard, User, Calendar } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { MaterialConsumption } from '@/types';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/utils';

interface MaterialConsumptionFormProps {
  consumption?: MaterialConsumption | null;
  onClose: () => void;
}

const MaterialConsumptionForm: React.FC<MaterialConsumptionFormProps> = ({ consumption, onClose }) => {
  const { addMaterialConsumption, updateMaterialConsumption, projects, tasks, inventory } = useData();
  const [formData, setFormData] = useState({
    projectId: '',
    taskId: '',
    materialId: '',
    quantity: '',
    consumptionDate: '',
    recordedBy: '',
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
    if (consumption) {
      setFormData({
        projectId: consumption.projectId || '',
        taskId: consumption.taskId || '',
        materialId: consumption.materialId || '',
        quantity: consumption.quantity?.toString() || '0',
        consumptionDate: consumption.consumptionDate ? (typeof consumption.consumptionDate === 'string' ? consumption.consumptionDate : formatDate(new Date(consumption.consumptionDate), 'yyyy-MM-dd')) : formatDate(new Date(), 'yyyy-MM-dd'),
        recordedBy: consumption.recordedBy || '',
        notes: consumption.notes || ''
      });
    } else {
      setFormData({
        projectId: '',
        taskId: '',
        materialId: '',
        quantity: '0',
        consumptionDate: formatDate(new Date(), 'yyyy-MM-dd'),
        recordedBy: '',
        notes: ''
      });
    }
  }, [consumption]);

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

    if (!formData.consumptionDate) {
      newErrors.consumptionDate = 'Consumption date is required';
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
      const consumptionData = {
        projectId: formData.projectId,
        taskId: formData.taskId || undefined,
        materialId: formData.materialId,
        quantity: Number(formData.quantity),
        consumptionDate: formData.consumptionDate,
        recordedBy: formData.recordedBy.trim() || 'System',
        notes: formData.notes.trim()
      };

      if (consumption) {
        updateMaterialConsumption(consumption.id, consumptionData);
        toast.success('Material consumption updated successfully');
      } else {
        addMaterialConsumption(consumptionData);
        toast.success('Material consumption recorded successfully');
      }

      setFormData({
        projectId: '',
        taskId: '',
        materialId: '',
        quantity: '0',
        consumptionDate: formatDate(new Date(), 'yyyy-MM-dd'),
        recordedBy: '',
        notes: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to save material consumption:', error);
      toast.error('Failed to save material consumption. Please try again.');
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
                {consumption ? 'Edit Material Consumption' : 'Record Material Consumption'}
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
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                  Project *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="projectId"
                    id="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${errors.projectId ? 'border-red-300' : ''}`}
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.projectId && <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>}
              </div>

              {projectTasks.length > 0 && (
                <div>
                  <label htmlFor="taskId" className="block text-sm font-medium text-gray-700 mb-1">
                    Task (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clipboard className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="taskId"
                      id="taskId"
                      value={formData.taskId}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="">Select task</option>
                      {projectTasks.map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="materialId" className="block text-sm font-medium text-gray-700 mb-1">
                  Material *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="materialId"
                    id="materialId"
                    value={formData.materialId}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${errors.materialId ? 'border-red-300' : ''}`}
                  >
                    <option value="">Select material</option>
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.materialId && <p className="mt-1 text-sm text-red-600">{errors.materialId}</p>}
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
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
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.quantity ? 'border-red-300' : ''}`}
                  placeholder="0.00"
                />
                {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
              </div>

              <div>
                <label htmlFor="consumptionDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Consumption Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="consumptionDate"
                    id="consumptionDate"
                    value={formData.consumptionDate}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.consumptionDate ? 'border-red-300' : ''}`}
                  />
                </div>
                {errors.consumptionDate && <p className="mt-1 text-sm text-red-600">{errors.consumptionDate}</p>}
              </div>

              <div>
                <label htmlFor="recordedBy" className="block text-sm font-medium text-gray-700 mb-1">
                  Recorded By
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="recordedBy"
                    id="recordedBy"
                    value={formData.recordedBy}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter recorder name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter any additional notes"
                />
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (consumption ? 'UPDATE CONSUMPTION' : 'RECORD CONSUMPTION')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaterialConsumptionForm;

