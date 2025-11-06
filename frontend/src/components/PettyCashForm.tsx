import React, { useState, useEffect } from 'react';
import { X, DollarSign, Receipt, Calendar, Building, User } from 'lucide-react';
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
    category: 'other' as PettyCash['category'],
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
        category: expense.category || 'other',
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
        category: 'other',
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
        category: 'other',
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={handleClose}
        />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full relative z-10">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {expense ? 'Edit Expense' : 'Add New Expense'}
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

            {/* Form Body */}
            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Project */}
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
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.projectId && (
                  <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.amount ? 'border-red-300' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-300' : ''}`}
                  placeholder="Enter expense description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Receipt className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
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
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.date ? 'border-red-300' : ''}`}
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              {/* Paid To */}
              <div>
                <label htmlFor="paidTo" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter recipient name"
                  />
                </div>
              </div>

              {/* Attachment URL */}
              <div>
                <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt/Attachment URL (Optional)
                </label>
                <input
                  type="url"
                  name="attachment"
                  id="attachment"
                  value={formData.attachment}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/receipt.jpg"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (expense ? 'UPDATE EXPENSE' : 'CREATE EXPENSE')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PettyCashForm;

