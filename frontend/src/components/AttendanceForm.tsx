import React, { useState, useEffect, useRef } from 'react';
import { X, User, Phone, Building, Briefcase, Camera, Image as ImageIcon } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Attendance } from '@/types';
import { ATTENDANCE_STATUSES } from '@/constants';
import { toast } from 'react-hot-toast';
import { apiService } from '@/services/api';
import PhotoCapture from './PhotoCapture';

interface AttendanceFormProps {
  attendance?: Attendance | null;
  onClose: () => void;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ attendance, onClose }) => {
  const { addAttendance, updateAttendance, projects, users } = useData();
  const { hasRole, user } = useAuth();
  const [formData, setFormData] = useState({
    labourName: '',
    mobileNumber: '',
    projectId: '',
    labourType: '',
    timeIn: '',
    timeOut: '',
    hours: '',
    status: 'present'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoAttachments, setPhotoAttachments] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [hasCapturedPhotos, setHasCapturedPhotos] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (attendance) {
      setFormData({
        labourName: attendance.employeeName || '',
        mobileNumber: attendance.mobileNumber || '',
        projectId: attendance.projectId || '',
        labourType: attendance.labourType || '',
        timeIn: attendance.timeIn || '08:00',
        timeOut: attendance.timeOut || '17:00',
        hours: attendance.hours?.toString() || '8',
        status: attendance.status || 'present'
      });
      // Set attachments if they exist
      if ((attendance as any).attachments) {
        setAttachments((attendance as any).attachments || []);
      }
    } else {
      // Set default values for new labour
      setFormData({
        labourName: '',
        mobileNumber: '',
        projectId: '',
        labourType: '',
        timeIn: '08:00',
        timeOut: '17:00',
        hours: '8',
        status: 'present'
      });
      setAttachments([]);
      setPhotoAttachments([]);
      setHasCapturedPhotos(false);
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

    // For supervisors/managers adding attendance, image is required
    // Check if photos are captured (even if not yet uploaded) or if attachments exist
    if (!attendance && hasRole(['admin', 'manager', 'site_supervisor']) && 
        !hasCapturedPhotos && photoAttachments.length === 0 && attachments.length === 0) {
      newErrors.attachments = 'Image attachment is required for attendance';
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
      const today = new Date().toISOString().split('T')[0];
      const attendanceData: any = {
        employeeName: formData.labourName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        projectId: formData.projectId,
        labourType: formData.labourType.trim(),
        date: attendance?.date || today,
        timeIn: formData.timeIn,
        timeOut: formData.timeOut,
        status: formData.status as any,
        hours: parseInt(formData.hours) || 8,
        attachments: [...attachments, ...photoAttachments] // Combine both attachment types
      };

      if (attendance) {
        // Update existing attendance - only managers can edit
        if (!hasRole(['admin', 'manager'])) {
          toast.error('Only managers can edit attendance records');
          return;
        }
        await updateAttendance(attendance.id, attendanceData);
        toast.success('Labour updated successfully');
      } else {
        // Add new attendance - managers and supervisors can add
        await addAttendance(attendanceData);
        
        // Also create a labour profile for future quick attendance marking
        try {
          await apiService.createLabour({
            name: formData.labourName.trim(),
            mobileNumber: formData.mobileNumber.trim(),
            labourType: formData.labourType.trim(),
            projectId: formData.projectId,
            isActive: true
          });
          console.log('✅ Labour profile created successfully');
        } catch (error) {
          console.warn('⚠️  Failed to create labour profile (attendance still created):', error);
          // Don't fail the attendance creation if labour profile creation fails
        }
        
        toast.success('Labour created successfully');
      }

      // Reset form
      setFormData({
        labourName: '',
        mobileNumber: '',
        projectId: '',
        labourType: '',
        timeIn: '08:00',
        timeOut: '17:00',
        hours: '8',
        status: 'present'
      });
      setErrors({});

      // Close modal after successful submission
      onClose();
    } catch (error) {
      console.error('Failed to save labour:', error);
      toast.error('Failed to save labour. Please try again.');
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

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
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
          <h2 className="modal-title">
            {attendance ? 'Edit Labour' : 'Add New Labour'}
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
            <div className="space-y-3 lg:space-y-4">
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
                  className={`input w-full ${errors.labourName ? 'border-red-300' : ''}`}
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
                <div className="flex items-stretch">
                  <div className="flex items-center justify-center px-3 py-2 border border-gray-300 border-r-0 rounded-l-md bg-gray-50 text-sm text-gray-500 h-full">
                    <span>🇮🇳 +91</span>
                  </div>
                  <input
                    type="tel"
                    name="mobileNumber"
                    id="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="flex-1 input rounded-l-none border-l-0"
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
                    className={`input appearance-none pr-10 ${errors.projectId ? 'border-red-300' : ''}`}
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
                  className="input"
                  placeholder="Add Type"
                />
              </div>

              {/* Time In */}
              <div>
                <label htmlFor="timeIn" className="block text-sm font-medium text-gray-700 mb-1">
                  Time In
                </label>
                <input
                  type="time"
                  name="timeIn"
                  id="timeIn"
                  value={formData.timeIn}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              {/* Time Out */}
              <div>
                <label htmlFor="timeOut" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Out
                </label>
                <input
                  type="time"
                  name="timeOut"
                  id="timeOut"
                  value={formData.timeOut}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              {/* Hours */}
              <div>
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
                  Hours
                </label>
                <input
                  type="number"
                  name="hours"
                  id="hours"
                  value={formData.hours}
                  onChange={handleChange}
                  min="0"
                  max="24"
                  step="0.5"
                  className="input"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input"
                >
                  {ATTENDANCE_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Photo Capture - Required for supervisors/managers when adding new attendance */}
              {!attendance && hasRole(['admin', 'manager', 'site_supervisor']) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attendance Photo <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Photo with current date and time is required for attendance verification
                  </p>
                  <PhotoCapture
                    onPhotosCaptured={async (photos) => {
                      console.log('Photos captured for attendance:', photos);
                      
                      // Mark that photos are captured (clear error immediately)
                      if (photos.length > 0) {
                        setHasCapturedPhotos(true);
                        // Clear attachment error if it exists
                        if (errors.attachments) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.attachments;
                            return newErrors;
                          });
                        }
                      }
                      
                      // Upload photos asynchronously
                      setIsUploadingPhotos(true);
                      try {
                        const uploadedFileIds: string[] = [];
                        for (const photo of photos) {
                          try {
                            // Add date/time watermark to photo before uploading
                            const { photoService } = await import('@/services/photoService');
                            const watermarkedFile = await photoService.addDateTimeWatermark(photo);
                            
                            // Upload watermarked photo file
                            const response = await apiService.uploadFile(
                              watermarkedFile,
                              undefined,
                              formData.projectId || undefined
                            );
                            if ((response as any).data?._id) {
                              uploadedFileIds.push((response as any).data._id);
                            }
                          } catch (error) {
                            console.error('Failed to upload photo:', error);
                            toast.error('Failed to upload some photos');
                          }
                        }
                        setPhotoAttachments(uploadedFileIds);
                        if (uploadedFileIds.length > 0) {
                          toast.success(`${uploadedFileIds.length} photo(s) uploaded with date/time watermark`);
                        } else if (photos.length > 0) {
                          // If photos were captured but upload failed, still allow form submission
                          // The photo is captured, just not uploaded yet
                          console.warn('Photos captured but upload failed, allowing form submission');
                        }
                      } catch (error) {
                        console.error('Error uploading photos:', error);
                        toast.error('Failed to upload photos');
                      } finally {
                        setIsUploadingPhotos(false);
                      }
                    }}
                    projectId={formData.projectId}
                    maxPhotos={1}
                    className="mb-4"
                  />
                  {isUploadingPhotos && (
                    <p className="text-xs text-blue-600 mt-1">Uploading photo...</p>
                  )}
                  {errors.attachments && (
                    <p className="mt-1 text-sm text-red-600">{errors.attachments}</p>
                  )}
                </div>
              )}

              {/* File Upload - For editing or additional attachments */}
              {hasRole(['admin', 'manager']) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Attachments
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Add Attachment
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;

                      try {
                        const uploadedFileIds: string[] = [];
                        for (const file of Array.from(files)) {
                          try {
                            const response = await apiService.uploadFile(
                              file,
                              undefined,
                              formData.projectId || undefined
                            );
                            if ((response as any).data?._id) {
                              uploadedFileIds.push((response as any).data._id);
                            }
                          } catch (error) {
                            console.error('Failed to upload file:', error);
                          }
                        }
                        setAttachments(prev => [...prev, ...uploadedFileIds]);
                        toast.success(`${uploadedFileIds.length} file(s) uploaded successfully`);
                      } catch (error) {
                        console.error('Error uploading files:', error);
                        toast.error('Failed to upload files');
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="modal-footer flex-row justify-between space-x-2">
            <button
              type="button"
              className="btn-secondary flex-1"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isSubmitting || isUploadingPhotos}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner h-4 w-4 mr-2"></div>
                  Saving...
                </div>
              ) : isUploadingPhotos ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner h-4 w-4 mr-2"></div>
                  Uploading photo...
                </div>
              ) : (
                attendance ? 'Update Labour' : 'Create New Labour'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceForm;
