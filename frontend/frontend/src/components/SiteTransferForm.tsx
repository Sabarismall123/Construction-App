import React, { useState, useEffect } from 'react';
import { X, Truck, Package, Building, Calendar, User } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { SiteTransfer } from '@/types';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/utils';

interface SiteTransferFormProps {
  transfer?: SiteTransfer | null;
  onClose: () => void;
}

const SiteTransferForm: React.FC<SiteTransferFormProps> = ({ transfer, onClose }) => {
  const { addSiteTransfer, updateSiteTransfer, projects, inventory } = useData();
  const [formData, setFormData] = useState({
    fromProjectId: '',
    toProjectId: '',
    materialId: '',
    quantity: '',
    transferDate: '',
    transferredBy: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transfer) {
      setFormData({
        fromProjectId: transfer.fromProjectId || '',
        toProjectId: transfer.toProjectId || '',
        materialId: transfer.materialId || '',
        quantity: transfer.quantity?.toString() || '0',
        transferDate: transfer.transferDate || formatDate(new Date(), 'yyyy-MM-dd'),
        transferredBy: transfer.transferredBy || '',
        notes: transfer.notes || ''
      });
    } else {
      setFormData({
        fromProjectId: '',
        toProjectId: '',
        materialId: '',
        quantity: '0',
        transferDate: formatDate(new Date(), 'yyyy-MM-dd'),
        transferredBy: '',
        notes: ''
      });
    }
    setErrors({});
  }, [transfer]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fromProjectId) {
      newErrors.fromProjectId = 'From project is required';
    }

    if (!formData.toProjectId) {
      newErrors.toProjectId = 'To project is required';
    }

    if (formData.fromProjectId === formData.toProjectId) {
      newErrors.toProjectId = 'To project must be different from from project';
    }

    if (!formData.materialId) {
      newErrors.materialId = 'Material is required';
    }

    if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.transferDate) {
      newErrors.transferDate = 'Transfer date is required';
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
      const transferData = {
        fromProjectId: formData.fromProjectId,
        toProjectId: formData.toProjectId,
        materialId: formData.materialId,
        quantity: Number(formData.quantity),
        transferDate: formData.transferDate,
        transferredBy: formData.transferredBy.trim() || 'System',
        notes: formData.notes.trim()
      };

      if (transfer) {
        updateSiteTransfer(transfer.id, transferData);
        toast.success('Site transfer updated successfully');
      } else {
        addSiteTransfer(transferData);
        toast.success('Site transfer created successfully');
      }

      onClose();
    } catch (error) {
      toast.error('Failed to save site transfer');
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

  return (
    <div className="modal-overlay">
      <div className="modal max-w-2xl">
        <div className="modal-header flex items-center justify-between">
          <h2 className="modal-title">
            {transfer ? 'Edit Site Transfer' : 'New Site Transfer'}
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
                  <label htmlFor="fromProjectId" className="label">
                    From Project *
                  </label>
                  <div className="relative">
                    <select
                      id="fromProjectId"
                      name="fromProjectId"
                      className={`input appearance-none pr-10 ${errors.fromProjectId ? 'input-error' : ''}`}
                      value={formData.fromProjectId}
                      onChange={handleChange}
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
                  {errors.fromProjectId && <p className="form-error">{errors.fromProjectId}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="toProjectId" className="label">
                    To Project *
                  </label>
                  <div className="relative">
                    <select
                      id="toProjectId"
                      name="toProjectId"
                      className={`input appearance-none pr-10 ${errors.toProjectId ? 'input-error' : ''}`}
                      value={formData.toProjectId}
                      onChange={handleChange}
                    >
                      <option value="">Select project</option>
                      {projects
                        .filter(p => p.id !== formData.fromProjectId)
                        .map((project) => (
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
                  {errors.toProjectId && <p className="form-error">{errors.toProjectId}</p>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="materialId" className="label">
                    Material *
                  </label>
                  <div className="relative">
                    <select
                      id="materialId"
                      name="materialId"
                      className={`input appearance-none pr-10 ${errors.materialId ? 'input-error' : ''}`}
                      value={formData.materialId}
                      onChange={handleChange}
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
                    min="0.01"
                    step="0.01"
                  />
                  {errors.quantity && <p className="form-error">{errors.quantity}</p>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="transferDate" className="label">
                    Transfer Date *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="transferDate"
                      name="transferDate"
                      className={`input pl-10 ${errors.transferDate ? 'input-error' : ''}`}
                      value={formData.transferDate}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.transferDate && <p className="form-error">{errors.transferDate}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="transferredBy" className="label">
                    Transferred By
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="transferredBy"
                      name="transferredBy"
                      className="input pl-10"
                      value={formData.transferredBy}
                      onChange={handleChange}
                      placeholder="Enter person name"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes" className="label">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="input resize-none"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Enter any additional notes"
                />
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
                  {transfer ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                transfer ? 'Update Transfer' : 'Create Transfer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteTransferForm;

