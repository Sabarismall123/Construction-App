import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Clock, User } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { apiService } from '@/services/api';
import PhotoCapture from './PhotoCapture';
import MobileDropdown from './MobileDropdown';

interface QuickAttendanceFormProps {
  onClose: () => void;
}

const QuickAttendanceForm: React.FC<QuickAttendanceFormProps> = ({ onClose }) => {
  const { addAttendance, projects } = useData();
  const { hasRole } = useAuth();
  const [formData, setFormData] = useState({
    labourId: '',
    projectId: '',
    timeIn: new Date().toTimeString().slice(0, 5), // Current time in HH:MM
    status: 'present' as const
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoAttachments, setPhotoAttachments] = useState<string[]>([]);
  const [hasCapturedPhotos, setHasCapturedPhotos] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [labours, setLabours] = useState<any[]>([]);
  const [loadingLabours, setLoadingLabours] = useState(false);

  // Load labours from API - filter by project if selected
  useEffect(() => {
    const loadLabours = async () => {
      setLoadingLabours(true);
      try {
        let response;
        if (formData.projectId) {
          // Load labours for the selected project
          response = await apiService.getLaboursByProject(formData.projectId);
        } else {
          // Load all labours
          response = await apiService.getLabours();
        }
        const laboursData = (response as any).data || response;
        const activeLabours = Array.isArray(laboursData) 
          ? laboursData.filter((l: any) => l.isActive !== false)
          : [];
        setLabours(activeLabours);
      } catch (error) {
        console.error('Failed to load labours:', error);
        toast.error('Failed to load labours');
      } finally {
        setLoadingLabours(false);
      }
    };
    loadLabours();
  }, [formData.projectId]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.labourId) {
      newErrors.labourId = 'Please select a labour';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    // Photo is required for quick attendance
    if (!hasCapturedPhotos && photoAttachments.length === 0) {
      newErrors.attachments = 'Photo is required for attendance';
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
      // Get selected labour details
      const selectedLabour = labours.find(l => l.id === formData.labourId || l._id === formData.labourId);
      if (!selectedLabour) {
        toast.error('Selected labour not found');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const attendanceData: any = {
        employeeName: selectedLabour.name || selectedLabour.labourName,
        mobileNumber: selectedLabour.mobileNumber,
        projectId: formData.projectId,
        labourType: selectedLabour.labourType,
        date: today,
        timeIn: formData.timeIn,
        timeOut: '', // Will be updated later
        status: formData.status,
        hours: 8, // Default 8 hours
        attachments: photoAttachments
      };

      await addAttendance(attendanceData);
      toast.success('Attendance marked successfully!');

      // Reset form
      setFormData({
        labourId: '',
        projectId: '',
        timeIn: new Date().toTimeString().slice(0, 5),
        status: 'present'
      });
      setPhotoAttachments([]);
      setHasCapturedPhotos(false);
      setErrors({});

      // Close modal after successful submission
      onClose();
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      toast.error('Failed to mark attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClose = () => {
    document.body.style.overflow = '';
    onClose();
  };

  const labourOptions = [
    { value: '', label: 'Select Labour' },
    ...labours.map((labour: any) => ({
      value: labour.id || labour._id,
      label: `${labour.name || labour.labourName}${labour.mobileNumber ? ` (${labour.mobileNumber})` : ''}${labour.labourType ? ` - ${labour.labourType}` : ''}`
    }))
  ];

  const projectOptions = [
    { value: '', label: 'Select Project' },
    ...projects.map(project => ({
      value: project.id,
      label: project.name
    }))
  ];

  return (
    <div className="modal-overlay">
      <div className="modal max-w-lg">
        <div className="modal-header flex items-center justify-between">
          <h2 className="modal-title">
            Quick Mark Attendance
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
            <div className="space-y-4">
              {/* Project Selection - Must be selected first */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project <span className="text-red-500">*</span>
                </label>
                <MobileDropdown
                  options={projectOptions}
                  value={formData.projectId}
                  onChange={(value) => {
                    handleChange('projectId', value);
                    // Clear labour selection when project changes
                    handleChange('labourId', '');
                  }}
                  placeholder="Select Project"
                  className="w-full"
                />
                {errors.projectId && (
                  <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
                )}
                {formData.projectId && (
                  <p className="mt-1 text-xs text-gray-500">
                    Showing labours for selected project
                  </p>
                )}
              </div>

              {/* Labour Selection - Only shown after project is selected */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Labour <span className="text-red-500">*</span>
                </label>
                {!formData.projectId ? (
                  <div className="input w-full bg-gray-100 text-gray-500 cursor-not-allowed">
                    Please select a project first
                  </div>
                ) : (
                  <MobileDropdown
                    options={labourOptions}
                    value={formData.labourId}
                    onChange={(value) => {
                      handleChange('labourId', value);
                    }}
                    placeholder={labours.length === 0 ? "No labours found for this project" : "Select Labour"}
                    className="w-full"
                    disabled={loadingLabours || labours.length === 0}
                  />
                )}
                {errors.labourId && (
                  <p className="mt-1 text-sm text-red-600">{errors.labourId}</p>
                )}
                {loadingLabours && (
                  <p className="mt-1 text-xs text-gray-500">Loading labours...</p>
                )}
                {formData.projectId && !loadingLabours && labours.length === 0 && (
                  <p className="mt-1 text-xs text-orange-600">
                    No labours found for this project. Create a labour first.
                  </p>
                )}
              </div>

              {/* Time In */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time In
                </label>
                <input
                  type="time"
                  value={formData.timeIn}
                  onChange={(e) => handleChange('timeIn', e.target.value)}
                  className="input w-full"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="input w-full"
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              {/* Photo Capture - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendance Photo <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Photo with current date and time is required for attendance verification
                </p>
                <PhotoCapture
                  onPhotosCaptured={async (photos) => {
                    console.log('Photos captured for quick attendance:', photos);
                    
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
            </div>
          </div>
          
          <div className="modal-footer flex-row justify-between space-x-2">
            <button
              type="button"
              className="btn-secondary flex-1"
              onClick={handleClose}
              disabled={isSubmitting || isUploadingPhotos}
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
                  Marking...
                </div>
              ) : isUploadingPhotos ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner h-4 w-4 mr-2"></div>
                  Uploading...
                </div>
              ) : (
                'Mark Attendance'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickAttendanceForm;

