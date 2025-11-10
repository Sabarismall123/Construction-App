import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, MapPin, Clock, Tag, Download, Eye } from 'lucide-react';
import { photoService, PhotoMetadata } from '@/services/photoService';
import { locationService } from '@/services/locationService';

interface PhotoCaptureProps {
  onPhotosCaptured: (photos: PhotoMetadata[]) => void;
  projectId?: string;
  taskId?: string;
  issueId?: string;
  maxPhotos?: number;
  className?: string;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onPhotosCaptured,
  projectId,
  taskId,
  issueId,
  maxPhotos = 10,
  className = ''
}) => {
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList) => {
    if (photos.length + files.length > maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setIsCapturing(true);
    setError(null);

    try {
      const newPhotos = await photoService.processMultiplePhotos(
        files,
        projectId,
        taskId,
        issueId
      );

      // Add description to all photos
      const photosWithDescription = newPhotos.map(photo => ({
        ...photo,
        description: description || photo.description
      }));

      const updatedPhotos = [...photos, ...photosWithDescription];
      setPhotos(updatedPhotos);
      onPhotosCaptured(updatedPhotos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process photos');
    } finally {
      setIsCapturing(false);
    }
  }, [photos, projectId, taskId, issueId, description, maxPhotos, onPhotosCaptured]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  // Handle gallery selection
  const handleGallerySelect = () => {
    fileInputRef.current?.click();
  };

  // Remove photo
  const removePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    setPhotos(updatedPhotos);
    onPhotosCaptured(updatedPhotos);
  };

  // Get photo preview URL
  const getPhotoPreview = (photo: PhotoMetadata): string => {
    return URL.createObjectURL(photo.file);
  };

  // Download photo
  const downloadPhoto = (photo: PhotoMetadata) => {
    const url = URL.createObjectURL(photo.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = photo.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          Photo Capture
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {photos.length}/{maxPhotos} photos
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Description input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description (optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add description for all photos..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Capture buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleCameraCapture}
          disabled={isCapturing || photos.length >= maxPhotos}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
        >
          <Camera className="w-4 h-4 mr-2" />
          {isCapturing ? 'Processing...' : 'Take Photo'}
        </button>
        
        <button
          onClick={handleGallerySelect}
          disabled={isCapturing || photos.length >= maxPhotos}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose from Gallery
        </button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Captured Photos ({photos.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={getPhotoPreview(photo)}
                  alt={photo.file.name}
                  className="w-full h-32 object-cover"
                />
                
                {/* Photo info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                  <div className="flex items-center text-xs mb-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(photo.timestamp).toLocaleTimeString()}
                  </div>
                  {photo.address && (
                    <div className="flex items-center text-xs mb-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{photo.address}</span>
                    </div>
                  )}
                  {photo.tags && photo.tags.length > 0 && (
                    <div className="flex items-center text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      <span className="truncate">{photo.tags.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => downloadPhoto(photo)}
                    className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                    title="Download"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo info summary */}
      {photos.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Photo Summary
          </h5>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div>Total photos: {photos.length}</div>
            <div>Total size: {photoService.formatFileSize(photos.reduce((sum, photo) => sum + photo.file.size, 0))}</div>
            <div>With location: {photos.filter(photo => photo.location).length}</div>
            <div>With description: {photos.filter(photo => photo.description).length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;
