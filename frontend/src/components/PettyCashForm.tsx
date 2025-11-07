import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, User } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { PettyCash } from '@/types';
import { PETTY_CASH_CATEGORIES } from '@/constants';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/utils';

interface PettyCashFormProps {
  expense?: PettyCash | null;
  onClose: () => void;
}

const PettyCashForm: React.FC<PettyCashFormProps> = ({ expense, onClose }) => {
  const { addPettyCash, updatePettyCash, projects } = useData();
  const [formData, setFormData] = useState({
    projectId: '',
    amount: '',
    description: '',
    category: 'miscellaneous' as PettyCash['category'],
    date: '',
    paidTo: '',
    attachment: ''
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
    if (expense) {
      setFormData({
        projectId: expense.projectId || '',
        amount: expense.amount.toString(),
        description: expense.description || '',
        category: expense.category || 'miscellaneous',
        date: expense.date ? (typeof expense.date === 'string' ? expense.date : formatDate(new Date(expense.date), 'yyyy-MM-dd')) : formatDate(new Date(), 'yyyy-MM-dd'),
        paidTo: expense.paidTo || '',
        attachment: expense.attachment || ''
      });
    } else {
      // Set default values for new expense
      setFormData({
        projectId: '',
        amount: '',
        description: '',
        category: 'miscellaneous',
        date: formatDate(new Date(), 'yyyy-MM-dd'),
        paidTo: '',
        attachment: ''
      });
    }
  }, [expense]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
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
      const expenseData = {
        projectId: formData.projectId,
        amount: Number(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
        date: formData.date,
        paidTo: formData.paidTo.trim(),
        attachment: formData.attachment.trim()
      };

      if (expense) {
        // Update existing expense
        await updatePettyCash(expense.id, expenseData);
        toast.success('Expense updated successfully');
      } else {
        // Add new expense
        await addPettyCash(expenseData);
        toast.success('Expense created successfully');
      }

      // Reset form
      setFormData({
        projectId: '',
        amount: '',
        description: '',
        category: 'miscellaneous',
        date: formatDate(new Date(), 'yyyy-MM-dd'),
        paidTo: '',
        attachment: ''
      });
      setErrors({});

      // Close modal after successful submission
      onClose();
    } catch (error) {
      console.error('Failed to save expense:', error);
      toast.error('Failed to save expense. Please try again.');
      // Don't close modal on error so user can fix and retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClose = () => {
    // Reset body scroll
    document.body.style.overflow = '';
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-2xl">
        <div className="modal-header flex items-center justify-between">
          <h2 className="modal-title">
            {expense ? 'Edit Expense' : 'Add New Expense'}
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
              {/* Project */}
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
                {errors.projectId && (
                  <p className="form-error">{errors.projectId}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="label">
                  Amount *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    className={`input pl-10 ${errors.amount ? 'input-error' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="form-error">{errors.amount}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="label">
                  Description *
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`input resize-none ${errors.description ? 'input-error' : ''}`}
                  placeholder="Enter expense description"
                />
                {errors.description && (
                  <p className="form-error">{errors.description}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="label">
                  Category
                </label>
                <div className="relative">
                  <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input appearance-none pr-10"
                  >
                    {PETTY_CASH_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
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

              {/* Date */}
              <div>
                <label htmlFor="date" className="label">
                  Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.date ? 'input-error' : ''}`}
                  />
                </div>
                {errors.date && (
                  <p className="form-error">{errors.date}</p>
                )}
              </div>

              {/* Paid To */}
              <div>
                <label htmlFor="paidTo" className="label">
                  Paid To
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="paidTo"
                    id="paidTo"
                    value={formData.paidTo}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter recipient name"
                  />
                </div>
              </div>

              {/* Attachment URL */}
              <div>
                <label htmlFor="attachment" className="label">
                  Receipt/Attachment URL (Optional)
                </label>
                <input
                  type="url"
                  name="attachment"
                  id="attachment"
                  value={formData.attachment}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://example.com/receipt.jpg"
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
                  {expense ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                expense ? 'Update Expense' : 'Create Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PettyCashForm;

