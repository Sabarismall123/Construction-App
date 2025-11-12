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
    timeOut: '', // Time out (optional)
    status: 'present' as const
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoAttachments, setPhotoAttachments] = useState<string[]>([]);
  const [hasCapturedPhotos, setHasCapturedPhotos] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [labours, setLabours] = useState<any[]>([]);
  const [loadingLabours, setLoadingLabours] = useState(false);

  // Load labours from API and labor resources - filter by project if selected
  useEffect(() => {
    const loadLabours = async () => {
      setLoadingLabours(true);
      try {
        // Load labours from Labour API
        let laboursResponse;
        if (formData.projectId) {
          laboursResponse = await apiService.getLaboursByProject(formData.projectId);
        } else {
          laboursResponse = await apiService.getLabours();
        }
        const laboursData = (laboursResponse as any).data || laboursResponse;
        const activeLabours = Array.isArray(laboursData) 
          ? laboursData.filter((l: any) => l.isActive !== false)
          : [];

        // Also load labor resources from Resources API
        let resourcesResponse;
        if (formData.projectId) {
          resourcesResponse = await apiService.getResourcesByProject(formData.projectId);
        } else {
          resourcesResponse = await apiService.getResources();
        }
        const resourcesData = (resourcesResponse as any).data || resourcesResponse;
        const resourcesArray = Array.isArray(resourcesData) ? resourcesData : (resourcesData?.data || []);
        
        // Filter for labor resources
        // Backend maps 'labor' to 'other', so check for:
        // 1. type === 'labor' (if frontend sends it directly)
        // 2. type === 'other' AND (mobileNumber OR category === 'labor' OR aadharNumber)
        const laborResources = resourcesArray.filter((r: any) => {
          const isLaborType = r.type === 'labor' || 
                             (r.type === 'other' && (r.mobileNumber || r.category === 'labor' || r.aadharNumber));
          const isValidStatus = r.status === 'available' || r.status === 'in_use';
          
          // If project is selected, check if resource matches the project
          let matchesProject = true;
          if (formData.projectId) {
            const resourceProjectId = r.projectId?._id || r.projectId || r.projectId?.id;
            const resourceProjectIdStr = resourceProjectId?.toString();
            const selectedProjectIdStr = formData.projectId.toString();
            matchesProject = resourceProjectIdStr === selectedProjectIdStr;
          }
          
          return isLaborType && isValidStatus && matchesProject;
        });

        console.log('🔍 Labor resources found:', {
          totalResources: resourcesArray.length,
          laborResources: laborResources.length,
          laborResourcesList: laborResources.map((r: any) => ({
            name: r.name,
            type: r.type,
            category: r.category,
            projectId: r.projectId?._id || r.projectId || r.projectId?.id,
            selectedProjectId: formData.projectId
          }))
        });

        // Convert labor resources to labour format
        const laborResourcesAsLabours = laborResources.map((r: any) => {
          const resourceProjectId = r.projectId?._id || r.projectId || r.projectId?.id;
          return {
            _id: r._id || r.id,
            id: r._id || r.id,
            name: r.name,
            mobileNumber: r.mobileNumber || '',
            labourType: r.category || r.description || '',
            projectId: resourceProjectId,
            projectIdString: resourceProjectId?.toString(),
            isActive: true,
            isFromResource: true // Flag to identify it came from resources
          };
        });

        // Combine both lists and remove duplicates by name and projectId
        const combinedLabours = [...activeLabours, ...laborResourcesAsLabours];
        const uniqueLabours = combinedLabours.filter((labour, index, self) => 
          index === self.findIndex((l) => 
            l.name === labour.name && 
            (l.projectId?._id || l.projectId || l.projectId?.id) === (labour.projectId?._id || labour.projectId || labour.projectId?.id)
          )
        );

        setLabours(uniqueLabours);
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
    
    // Wait for photos to finish uploading if they're still uploading
    if (isUploadingPhotos) {
      toast.error('Please wait for photos to finish uploading');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    // Ensure photos are uploaded before submitting
    if (hasCapturedPhotos && photoAttachments.length === 0) {
      toast.error('Please wait for photos to finish uploading');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get selected labour details
      const selectedLabour = labours.find(l => l.id === formData.labourId || l._id === formData.labourId);
      if (!selectedLabour) {
        toast.error('Selected labour not found');
        setIsSubmitting(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      
      // Calculate hours if both timeIn and timeOut are provided
      let calculatedHours = 8; // Default 8 hours
      if (formData.timeIn && formData.timeOut) {
        const [inHours, inMinutes] = formData.timeIn.split(':').map(Number);
        const [outHours, outMinutes] = formData.timeOut.split(':').map(Number);
        const inTime = inHours * 60 + inMinutes;
        const outTime = outHours * 60 + outMinutes;
        const diffMinutes = outTime - inTime;
        if (diffMinutes > 0) {
          calculatedHours = Math.round((diffMinutes / 60) * 100) / 100; // Round to 2 decimal places
        }
      }
      
      // Format date as ISO8601 string
      const dateISO = new Date(today).toISOString();
      
      // Ensure mobileNumber is exactly 10 digits or undefined
      let mobileNumber = selectedLabour.mobileNumber;
      if (mobileNumber) {
        // Remove any non-digit characters
        mobileNumber = mobileNumber.replace(/\D/g, '');
        // Only include if it's exactly 10 digits
        if (mobileNumber.length !== 10) {
          mobileNumber = undefined;
        }
      }
      
      const attendanceData: any = {
        employeeName: selectedLabour.name || selectedLabour.labourName,
        mobileNumber: mobileNumber || undefined,
        projectId: formData.projectId,
        labourType: selectedLabour.labourType || undefined,
        date: dateISO,
        timeIn: formData.timeIn || undefined,
        timeOut: formData.timeOut || undefined,
        status: formData.status || 'present',
        hours: Number(calculatedHours), // Ensure it's a number
        attachments: photoAttachments.length > 0 ? photoAttachments : []
      };

      console.log('📤 Sending attendance data:', {
        employeeName: attendanceData.employeeName,
        projectId: attendanceData.projectId,
        attachmentsCount: photoAttachments.length,
        attachments: photoAttachments,
        attachmentsType: photoAttachments.map(id => typeof id),
        hasCapturedPhotos: hasCapturedPhotos,
        isUploadingPhotos: isUploadingPhotos
      });
      
      // Double-check that we have attachments if photos were captured
      if (hasCapturedPhotos && photoAttachments.length === 0) {
        toast.error('Photos are still uploading. Please wait...');
        setIsSubmitting(false);
        return;
      }

      try {
        await addAttendance(attendanceData);
        toast.success('Attendance marked successfully!');
      } catch (error: any) {
        console.error('Failed to mark attendance:', error);
        const errorMessage = error?.message || error?.toString() || 'Failed to mark attendance. Please try again.';
        
        // Check if it's a duplicate error
        if (errorMessage.includes('Duplicate attendance record') || errorMessage.includes('already exists')) {
          toast.error(errorMessage, {
            duration: 5000,
            icon: '⚠️'
          });
        } else {
          toast.error(errorMessage);
        }
        setIsSubmitting(false);
        return;
      }

      // Reset form
      setFormData({
        labourId: '',
        projectId: '',
        timeIn: new Date().toTimeString().slice(0, 5),
        timeOut: '',
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

              {/* Time Out */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Out <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="time"
                  value={formData.timeOut}
                  onChange={(e) => handleChange('timeOut', e.target.value)}
                  className="input w-full"
                  min={formData.timeIn} // Ensure time out is after time in
                />
                {formData.timeIn && formData.timeOut && (
                  <p className="mt-1 text-xs text-gray-500">
                    {(() => {
                      const [inHours, inMinutes] = formData.timeIn.split(':').map(Number);
                      const [outHours, outMinutes] = formData.timeOut.split(':').map(Number);
                      const inTime = inHours * 60 + inMinutes;
                      const outTime = outHours * 60 + outMinutes;
                      const diffMinutes = outTime - inTime;
                      if (diffMinutes > 0) {
                        const hours = Math.floor(diffMinutes / 60);
                        const minutes = diffMinutes % 60;
                        return `Total hours: ${hours}h ${minutes}m`;
                      }
                      return 'Time out must be after time in';
                    })()}
                  </p>
                )}
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
                          
                          console.log('📤 Photo upload response:', response);
                          
                          // Backend returns { success: true, data: { id: ..., ... } }
                          const fileId = (response as any).data?.id || 
                                        (response as any).data?._id || 
                                        (response as any).id || 
                                        (response as any)._id ||
                                        (response as any).data?._id?.toString();
                          
                          if (fileId) {
                            const fileIdString = fileId.toString();
                            uploadedFileIds.push(fileIdString);
                            console.log('✅ Photo uploaded successfully, file ID:', fileIdString);
                          } else {
                            console.error('❌ Photo upload response missing file ID');
                            console.error('Full response:', JSON.stringify(response, null, 2));
                            console.error('Response keys:', Object.keys(response || {}));
                            console.error('Response.data keys:', Object.keys((response as any)?.data || {}));
                          }
                        } catch (error) {
                          console.error('❌ Failed to upload photo:', error);
                          toast.error('Failed to upload some photos');
                        }
                      }
                      
                      console.log('📎 All photos uploaded:', {
                        count: uploadedFileIds.length,
                        fileIds: uploadedFileIds,
                        fileIdsType: uploadedFileIds.map(id => typeof id)
                      });
                      
                      if (uploadedFileIds.length > 0) {
                        setPhotoAttachments(uploadedFileIds);
                        console.log('✅ Photo attachments state updated:', uploadedFileIds);
                        toast.success(`${uploadedFileIds.length} photo(s) uploaded with date/time watermark`);
                      } else {
                        console.warn('⚠️ No photos were uploaded successfully');
                        toast.error('Failed to upload photos. Please try again.');
                        setHasCapturedPhotos(false);
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

