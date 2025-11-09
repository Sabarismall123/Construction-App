import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Mail, Shield, Eye, EyeOff } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserRole } from '@/types';
import { ROLES } from '@/constants';
import { toast } from 'react-hot-toast';

interface UserFormProps {
  user?: User | null;
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose }) => {
  const { addUser, updateUser } = useData();
  const { hasRole } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as UserRole
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorToastShownRef = React.useRef(false);
  const lastErrorRef = React.useRef<string | null>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role
      });
    } else {
      // Reset form when adding new user
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee' as UserRole
      });
    }
    // Clear errors when user changes
    setErrors({});
    setShowPassword(false);
    errorToastShownRef.current = false; // Reset error flag when form resets
    lastErrorRef.current = null; // Reset last error when form resets
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!user && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if non-manager is trying to change role
    if (!hasRole(['manager']) && user && formData.role !== user.role) {
      toast.error('Only managers can change user roles');
      return;
    }

    setIsSubmitting(true);
    errorToastShownRef.current = false; // Reset error flag for new submission
    lastErrorRef.current = null; // Reset last error for new submission

    const userData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role
    };

    try {
      if (user) {
        // Update existing user
        await updateUser(user.id, userData);
        toast.success('User updated successfully');
      } else {
        // Add new user - include password
        await addUser({
          ...userData,
          password: formData.password
        } as any);
        toast.success('User created successfully');
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee' as UserRole
      });
      setErrors({});
      
      // Close modal after successful submission
      onClose();
    } catch (error: any) {
      console.error('Failed to save user:', error);
      
      // Extract error message from error object
      let errorMessage = 'Failed to save user. Please try again.';
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Only show error toast once per unique error message
      // This prevents the same error from showing multiple times
      if (!errorToastShownRef.current || lastErrorRef.current !== errorMessage) {
        errorToastShownRef.current = true;
        lastErrorRef.current = errorMessage;
        
        // Show specific error message with stable ID to prevent duplicate toasts
        toast.error(errorMessage, {
          duration: 5000,
          id: 'user-form-error' // Stable ID - react-hot-toast will replace existing toast with same ID
        });
      }
      // Don't close modal on error so user can fix and retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      <div className="modal max-w-lg">
        <div className="modal-header flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-primary-100 mr-2 lg:mr-3">
              <UserIcon className="h-4 w-4 lg:h-5 lg:w-5 text-primary-600" />
            </div>
            <h2 className="modal-title text-lg lg:text-xl">
              {user ? 'Edit User' : 'Add New User'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 lg:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0 ml-2 lg:ml-4"
            aria-label="Close"
          >
            <X className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="space-y-1 lg:space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="label text-xs lg:text-sm">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="name"
                  className={`input text-sm ${errors.name ? 'input-error' : ''}`}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="form-error text-xs">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="label text-xs lg:text-sm">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    autoComplete="email"
                    className={`input pl-10 text-sm ${errors.email ? 'input-error' : ''}`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && (
                  <p className="form-error text-xs">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="label text-xs lg:text-sm">
                  Password {!user && '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    className={`input pr-10 text-sm ${errors.password ? 'input-error' : ''}`}
                    placeholder={user ? 'Leave blank to keep current password' : 'Enter password'}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error text-xs">{errors.password}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="label text-xs lg:text-sm">
                  Role * {!hasRole(['manager']) && <span className="text-gray-400">(Manager only)</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                  </div>
                  <select
                    name="role"
                    id="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={!hasRole(['manager']) || isSubmitting}
                    className={`input pl-10 text-sm ${!hasRole(['manager']) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    {Object.entries(ROLES).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                {!hasRole(['manager']) && (
                  <p className="form-error text-xs text-gray-500">
                    Only managers can change user roles
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="modal-footer flex-row justify-between space-x-2">
            <button
              type="button"
              className="btn-secondary flex-1 text-xs px-3 py-2 lg:text-sm lg:px-4 lg:py-2"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 text-xs px-3 py-2 lg:text-sm lg:px-4 lg:py-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner h-3 w-3 lg:h-4 lg:w-4 mr-1.5 lg:mr-2"></div>
                  <span className="text-xs lg:text-sm">Saving...</span>
                </div>
              ) : (
                user ? 'Update User' : 'Add User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
