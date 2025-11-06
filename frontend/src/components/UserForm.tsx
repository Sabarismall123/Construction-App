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
        });
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
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error('Failed to save user. Please try again.');
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={handleClose}
        />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                  <UserIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {user ? 'Edit User' : 'Add New User'}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`mt-1 input ${errors.name ? 'border-red-300' : ''}`}
                        placeholder="Enter full name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address *
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`input pl-10 ${errors.email ? 'border-red-300' : ''}`}
                          placeholder="Enter email address"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password {!user && '*'}
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          id="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`input pr-10 ${errors.password ? 'border-red-300' : ''}`}
                          placeholder={user ? 'Leave blank to keep current password' : 'Enter password'}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>

                    {/* Role */}
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Role * {!hasRole(['manager']) && <span className="text-gray-400">(Manager only)</span>}
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Shield className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          name="role"
                          id="role"
                          value={formData.role}
                          onChange={handleChange}
                          disabled={!hasRole(['manager'])}
                          className={`input pl-10 ${!hasRole(['manager']) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        >
                          {Object.entries(ROLES).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {!hasRole(['manager']) && (
                        <p className="mt-1 text-sm text-gray-500">
                          Only managers can change user roles
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (user ? 'Update User' : 'Add User')}
              </button>
              <button
                type="button"
                className="btn-secondary mr-3"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
