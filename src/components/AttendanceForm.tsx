import React, { useState, useEffect } from 'react';
import { X, User, Phone, Building, Briefcase } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Attendance } from '@/types';
import { ATTENDANCE_STATUSES } from '@/constants';

interface AttendanceFormProps {
  attendance?: Attendance | null;
  onClose: () => void;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ attendance, onClose }) => {
  const { addAttendance, updateAttendance, projects, users } = useData();
  const { hasRole } = useAuth();
  const [formData, setFormData] = useState({
    labourName: '',
    mobileNumber: '',
    projectId: '',
    labourType: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (attendance) {
      setFormData({
        labourName: attendance.employeeName || '',
        mobileNumber: '',
        projectId: attendance.projectId || '',
        labourType: ''
      });
    } else {
      // Set default values for new labour
      setFormData({
        labourName: '',
        mobileNumber: '',
        projectId: '',
        labourType: ''
      });
    }
  }, [attendance]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.labourName.trim()) {
      newErrors.labourName = 'Labour name is required';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // For now, we'll create a basic attendance record
    // In a real app, this would create a labour record
    const today = new Date().toISOString().split('T')[0];
    const attendanceData = {
      employeeName: formData.labourName.trim(),
      projectId: formData.projectId,
      date: today,
      timeIn: '08:00',
      timeOut: '17:00',
      status: 'present' as any,
      hours: 8
    };

    if (attendance) {
      // Update existing attendance
      updateAttendance(attendance.id, attendanceData);
    } else {
      // Add new attendance
      addAttendance(attendanceData);
    }

    onClose();
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Labour
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Labour Name */}
              <div>
                <label htmlFor="labourName" className="block text-sm font-medium text-gray-700 mb-1">
                  Labour Name*
                </label>
                <input
                  type="text"
                  name="labourName"
                  id="labourName"
                  value={formData.labourName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.labourName ? 'border-red-300' : ''}`}
                  placeholder="Add Labour Name"
                />
                {errors.labourName && (
                  <p className="mt-1 text-sm text-red-600">{errors.labourName}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <div className="flex">
                  <div className="flex items-center px-3 py-2 border border-gray-300 border-r-0 rounded-l-md bg-gray-50">
                    <span className="text-sm text-gray-500">🇮🇳 +91</span>
                  </div>
                  <input
                    type="tel"
                    name="mobileNumber"
                    id="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>

              {/* Project Name */}
              <div>
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name*
                </label>
                <div className="relative">
                  <select
                    name="projectId"
                    id="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${errors.projectId ? 'border-red-300' : ''}`}
                  >
                    <option value="">Select projects</option>
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

              {/* Labour Type */}
              <div>
                <label htmlFor="labourType" className="block text-sm font-medium text-gray-700 mb-1">
                  Labour Type
                </label>
                <input
                  type="text"
                  name="labourType"
                  id="labourType"
                  value={formData.labourType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add Type"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                type="submit"
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                CREATE NEW LABOUR
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AttendanceForm;
