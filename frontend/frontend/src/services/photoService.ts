import { locationService, LocationData } from './locationService';

export interface PhotoMetadata {
  id: string;
  file: File;
  timestamp: number;
  location?: LocationData;
  address?: string;
  projectId?: string;
  taskId?: string;
  issueId?: string;
  description?: string;
  tags?: string[];
}

export interface PhotoWithMetadata {
  id: string;
  url: string;
  metadata: PhotoMetadata;
  thumbnail?: string;
}

class PhotoService {
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private thumbnailSize = 200;

  // Process photo with automatic timestamp and location
  async processPhoto(
    file: File, 
    projectId?: string, 
    taskId?: string, 
    issueId?: string,
    description?: string
  ): Promise<PhotoMetadata> {
    // Validate file
    this.validateFile(file);

    // Get current location
    let location: LocationData | undefined;
    let address: string | undefined;

    try {
      location = await locationService.getCurrentLocation();
      address = await locationService.getAddressFromCoordinates(
        location.latitude, 
        location.longitude
      );
    } catch (error) {
      console.warn('Could not get location for photo:', error);
    }

    // Create photo metadata
    const photoMetadata: PhotoMetadata = {
      id: this.generatePhotoId(),
      file,
      timestamp: Date.now(),
      location,
      address,
      projectId,
      taskId,
      issueId,
      description,
      tags: this.generateTags(file, description)
    };

    return photoMetadata;
  }

  // Process multiple photos
  async processMultiplePhotos(
    files: FileList, 
    projectId?: string, 
    taskId?: string, 
    issueId?: string
  ): Promise<PhotoMetadata[]> {
    const photos: PhotoMetadata[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const photo = await this.processPhoto(files[i], projectId, taskId, issueId);
        photos.push(photo);
      } catch (error) {
        console.error(`Error processing photo ${i + 1}:`, error);
      }
    }

    return photos;
  }

  // Create thumbnail for photo
  async createThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate thumbnail dimensions
        const maxSize = this.thumbnailSize;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw thumbnail
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to data URL
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnail);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Add timestamp and location overlay to photo
  async addOverlay(photo: PhotoMetadata): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx?.drawImage(img, 0, 0);

        if (ctx) {
          // Add overlay background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(10, canvas.height - 80, canvas.width - 20, 70);

          // Add timestamp
          const timestamp = new Date(photo.timestamp).toLocaleString();
          ctx.fillStyle = 'white';
          ctx.font = '16px Arial';
          ctx.fillText(`📅 ${timestamp}`, 20, canvas.height - 50);

          // Add location if available
          if (photo.address) {
            ctx.fillText(`📍 ${photo.address}`, 20, canvas.height - 30);
          } else if (photo.location) {
            ctx.fillText(
              `📍 ${photo.location.latitude.toFixed(6)}, ${photo.location.longitude.toFixed(6)}`, 
              20, 
              canvas.height - 30
            );
          }

          // Add project info if available
          if (photo.projectId) {
            ctx.fillText(`🏗️ Project: ${photo.projectId}`, 20, canvas.height - 10);
          }
        }

        // Convert to data URL
        const overlayImage = canvas.toDataURL('image/jpeg', 0.9);
        resolve(overlayImage);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(photo.file);
    });
  }

  // Extract EXIF data from photo
  async extractEXIFData(file: File): Promise<any> {
    return new Promise((resolve) => {
      // This is a simplified version - in a real app, you'd use a library like exif-js
      const reader = new FileReader();
      reader.onload = () => {
        // Basic EXIF extraction would go here
        resolve({
          make: 'Unknown',
          model: 'Unknown',
          dateTime: new Date(file.lastModified).toISOString(),
          orientation: 1
        });
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // Validate file
  private validateFile(file: File): void {
    if (!this.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported. Allowed types: ${this.allowedTypes.join(', ')}`);
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum size of ${this.maxFileSize / 1024 / 1024}MB`);
    }
  }

  // Generate unique photo ID
  private generatePhotoId(): string {
    return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate tags based on file and description
  private generateTags(file: File, description?: string): string[] {
    const tags: string[] = [];
    
    // Add file type tag
    tags.push(file.type.split('/')[1]);
    
    // Add size tag
    if (file.size > 5 * 1024 * 1024) {
      tags.push('large');
    } else if (file.size < 500 * 1024) {
      tags.push('small');
    }
    
    // Add description-based tags
    if (description) {
      const words = description.toLowerCase().split(' ');
      const commonTags = ['progress', 'issue', 'completed', 'before', 'after', 'damage', 'safety'];
      words.forEach(word => {
        if (commonTags.includes(word)) {
          tags.push(word);
        }
      });
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get photo info for display
  getPhotoInfo(photo: PhotoMetadata): {
    name: string;
    size: string;
    dimensions: string;
    timestamp: string;
    location: string;
  } {
    return {
      name: photo.file.name,
      size: this.formatFileSize(photo.file.size),
      dimensions: 'Unknown', // Would need to load image to get dimensions
      timestamp: new Date(photo.timestamp).toLocaleString(),
      location: photo.address || (photo.location ? 
        `${photo.location.latitude.toFixed(6)}, ${photo.location.longitude.toFixed(6)}` : 
        'No location'
      )
    };
  }
}

export const photoService = new PhotoService();
