import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Image, Download, File, MapPin } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Attendance } from '@/types';
import { formatDate } from '@/utils';
import { ATTENDANCE_STATUSES } from '@/constants';
import { apiService } from '@/services/api';

interface AttendanceDetailProps {
  attendance: Attendance;
  onClose: () => void;
}

const AttendanceDetail: React.FC<AttendanceDetailProps> = ({ attendance, onClose }) => {
  const { projects } = useData();
  const [storedFiles, setStoredFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState<Attendance>(attendance);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [imageBlobUrls, setImageBlobUrls] = useState<Record<string, string>>({});

  const project = projects.find(p => p.id === currentAttendance.projectId);

  // Fetch latest attendance record from API to ensure we have the latest attachments
  useEffect(() => {
    const fetchLatestAttendance = async () => {
      setLoadingAttendance(true);
      try {
        const response = await apiService.getAttendanceRecord(attendance.id);
        if (response.success && response.data) {
          const latestAttendance = response.data;
          // Map the response to match Attendance type
          const mappedAttendance: Attendance = {
            ...latestAttendance,
            id: latestAttendance._id || latestAttendance.id,
            projectId: latestAttendance.projectId?._id || latestAttendance.projectId || latestAttendance.projectId,
            projectName: latestAttendance.projectName || latestAttendance.projectId?.name || 'Unknown Project',
            employeeId: latestAttendance.employeeId?._id || latestAttendance.employeeId || latestAttendance.employeeId,
            employeeName: latestAttendance.employeeName || latestAttendance.employeeId?.name || '',
            mobileNumber: latestAttendance.mobileNumber || latestAttendance.employeeId?.mobileNumber || '',
            labourType: latestAttendance.labourType || '',
            timeIn: latestAttendance.timeIn || '',
            timeOut: latestAttendance.timeOut || '',
            location: (latestAttendance as any).location || (latestAttendance as any).address || '',
            // Map attachments - handle both populated objects and IDs
            attachments: (latestAttendance.attachments || []).map((attachment: any) => {
              if (typeof attachment === 'object' && (attachment._id || attachment.id)) {
                return attachment._id || attachment.id;
              } else if (typeof attachment === 'string') {
                return attachment;
              }
              return attachment;
            }),
            date: latestAttendance.date ? new Date(latestAttendance.date) : new Date(),
            createdAt: latestAttendance.createdAt ? new Date(latestAttendance.createdAt) : new Date(),
            updatedAt: latestAttendance.updatedAt ? new Date(latestAttendance.updatedAt) : new Date()
          };
          setCurrentAttendance(mappedAttendance);
          console.log('✅ Fetched latest attendance with attachments:', {
            id: mappedAttendance.id,
            attachmentsCount: mappedAttendance.attachments?.length || 0,
            attachments: mappedAttendance.attachments
          });
        }
      } catch (error) {
        console.error('❌ Failed to fetch latest attendance:', error);
        // Use the provided attendance if fetch fails
        setCurrentAttendance(attendance);
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchLatestAttendance();
  }, [attendance.id]);

  useEffect(() => {
    // Load files from attendance attachments
    const loadFiles = async () => {
      console.log('🔄 Loading files for attendance:', {
        attendanceId: currentAttendance.id,
        attachments: currentAttendance.attachments,
        attachmentsLength: currentAttendance.attachments?.length
      });
      
      if (currentAttendance.attachments && currentAttendance.attachments.length > 0) {
        setLoadingFiles(true);
        try {
          // Load file info for each attachment ID
          console.log('⚠️ Loading attachment files individually...');
          const loadFilePromises = currentAttendance.attachments.map(async (fileId) => {
              try {
                const response = await apiService.getFileInfo(fileId);
                if (response.success && response.data) {
                  const fileData = {
                    id: response.data._id || response.data.id || fileId,
                    originalName: response.data.originalName || response.data.name || 'Unknown file',
                    mimetype: response.data.mimetype || response.data.type || 'application/octet-stream',
                    size: response.data.size || 0
                  };
                  
                  // Pre-load image as blob URL for better compatibility
                  if (fileData.mimetype.startsWith('image/')) {
                    try {
                      const blob = await apiService.getFile(fileData.id);
                      const blobUrl = URL.createObjectURL(blob);
                      setImageBlobUrls(prev => ({ ...prev, [fileData.id]: blobUrl }));
                    } catch (blobError) {
                      console.warn(`⚠️ Failed to pre-load image blob for ${fileData.id}:`, blobError);
                    }
                  }
                  
                  return fileData;
                }
                return null;
              } catch (error) {
                console.error(`❌ Failed to load file ${fileId}:`, error);
                // Return a placeholder if file info can't be loaded
                return {
                  id: fileId,
                  originalName: 'Unknown file',
                  mimetype: 'application/octet-stream',
                  size: 0
                };
              }
            });
            
            const files = await Promise.all(loadFilePromises);
            const validFiles = files.filter(file => file !== null);
            console.log('📁 Loaded files from API:', validFiles);
            setStoredFiles(validFiles);
        } catch (error) {
          console.error('❌ Error loading files:', error);
          setStoredFiles([]);
        } finally {
          setLoadingFiles(false);
        }
      } else {
        console.log('ℹ️ No attachments found for this attendance');
        setStoredFiles([]);
      }
    };

    loadFiles();
    
    // Cleanup blob URLs on unmount
    return () => {
      setImageBlobUrls(prev => {
        Object.values(prev).forEach(url => URL.revokeObjectURL(url));
        return {};
      });
    };
  }, [currentAttendance.id, currentAttendance.attachments]);

  const getStatusColor = (status: string) => {
    const statusConfig = ATTENDANCE_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const getFileUrl = (fileId: string) => {
    return apiService.getFileUrl(fileId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="modal max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="modal-header">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Attendance Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="modal-body">
          {loadingAttendance ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="loading-spinner h-8 w-8 mx-auto mb-2"></div>
              Loading attendance details...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Employee Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Employee Information</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {currentAttendance.employeeName}
                      </p>
                      {currentAttendance.mobileNumber && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {currentAttendance.mobileNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {currentAttendance.labourType && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Labour Type:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{currentAttendance.labourType}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Project Information</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {currentAttendance.projectName || project?.name || 'Unknown Project'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendance Details */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Attendance Details</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date:</span>
                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(currentAttendance.date, 'MMM dd, yyyy')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time In:</span>
                    <div className="flex items-center text-sm text-gray-900 dark:text-white font-medium">
                      <Clock className="h-4 w-4 mr-2" />
                      {currentAttendance.timeIn || 'N/A'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Out:</span>
                    <div className="flex items-center text-sm text-gray-900 dark:text-white font-medium">
                      <Clock className="h-4 w-4 mr-2" />
                      {currentAttendance.timeOut || 'N/A'}
                    </div>
                  </div>
                  
                  {/* Location Display */}
                  {((currentAttendance as any).location || (currentAttendance as any).address) && (
                    <div className="flex items-start justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Location:</span>
                      <div className="flex items-start text-sm text-gray-900 dark:text-white max-w-[60%] text-right">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="break-words">{(currentAttendance as any).location || (currentAttendance as any).address}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hours:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {currentAttendance.hours || 0}h
                      {currentAttendance.overtimeHours && currentAttendance.overtimeHours > 0 && (
                        <span className="text-orange-600 ml-1">+{currentAttendance.overtimeHours}h OT</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentAttendance.status)}`}>
                      {ATTENDANCE_STATUSES.find(s => s.value === currentAttendance.status)?.label}
                    </span>
                  </div>

                  {currentAttendance.notes && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Notes:</span>
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {currentAttendance.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments / Images */}
              {currentAttendance.attachments && currentAttendance.attachments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Attendance Photos ({currentAttendance.attachments.length})
                </h3>
                {loadingFiles ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Loading images...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentAttendance.attachments.map((attachment, index) => {
                      // Handle both populated objects and ID strings
                      const attachmentId = typeof attachment === 'object' ? ((attachment as any)._id || (attachment as any).id) : attachment;
                      const storedFile = storedFiles.find(f => f.id === attachmentId || f.id === attachment);
                      
                      // Try to determine if it's an image from the file name or mimetype
                      const fileName = storedFile?.originalName || (typeof attachment === 'object' ? (attachment as any).originalName || (attachment as any).name : '');
                      const fileMimetype = storedFile?.mimetype || (typeof attachment === 'object' ? (attachment as any).mimetype || (attachment as any).type : '');
                      const isImage = fileMimetype?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName);
                      
                      // Use attachment ID directly if storedFile is not found
                      const fileId = storedFile?.id || attachmentId;
                      const displayName = storedFile?.originalName || fileName || 'Unknown file';
                      // Use blob URL if available, otherwise fall back to direct URL
                      const imageUrl = imageBlobUrls[fileId] || getFileUrl(fileId);
                      
                      return (
                        <div key={fileId || index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          {isImage ? (
                            <div className="relative">
                              <img
                                src={imageUrl}
                                alt={displayName}
                                className="w-full h-64 object-cover"
                                onError={(e) => {
                                  console.error('Failed to load image:', imageUrl);
                                  // Try to load via blob if direct URL failed
                                  if (!imageBlobUrls[fileId] && fileId) {
                                    apiService.getFile(fileId).then(blob => {
                                      const blobUrl = URL.createObjectURL(blob);
                                      setImageBlobUrls(prev => ({ ...prev, [fileId]: blobUrl }));
                                      (e.target as HTMLImageElement).src = blobUrl;
                                    }).catch(err => {
                                      console.error('Failed to load image as blob:', err);
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    });
                                  } else {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }
                                }}
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                                <p className="text-xs text-white truncate">{displayName}</p>
                              </div>
                              <a
                                href={imageUrl}
                                download={displayName}
                                className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full transition-colors"
                                title="Download image"
                                onClick={async (e) => {
                                  // For blob URLs, download properly
                                  if (imageBlobUrls[fileId]) {
                                    e.preventDefault();
                                    try {
                                      const blob = await apiService.getFile(fileId);
                                      const url = window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = displayName;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                      console.error('Failed to download image:', error);
                                    }
                                  }
                                }}
                              >
                                <Download className="h-4 w-4 text-gray-700" />
                              </a>
                            </div>
                          ) : (
                            <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <File className="h-8 w-8 text-gray-400 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {displayName}
                                  </p>
                                  {storedFile?.size && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {(storedFile.size / 1024).toFixed(2)} KB
                                    </p>
                                  )}
                                </div>
                              </div>
                              <a
                                href={getFileUrl(fileId)}
                                download={displayName}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                title="Download file"
                              >
                                <Download className="h-5 w-5" />
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {(!currentAttendance.attachments || currentAttendance.attachments.length === 0) && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No attendance photos uploaded</p>
              </div>
            )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetail;

