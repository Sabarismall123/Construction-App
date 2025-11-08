// Simple file storage utility for handling uploaded files
// In a real application, you would upload files to a cloud storage service like AWS S3, Cloudinary, etc.

interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  data: string; // base64 encoded data
  uploadedAt: string;
}

class FileStorage {
  private storageKey = 'task_attachments';
  private files: Map<string, StoredFile> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const fileArray = JSON.parse(stored);
        fileArray.forEach((file: StoredFile) => {
          this.files.set(file.id, file);
        });
      }
    } catch (error) {
      console.error('Error loading files from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const fileArray = Array.from(this.files.values());
      localStorage.setItem(this.storageKey, JSON.stringify(fileArray));
    } catch (error) {
      console.error('Error saving files to storage:', error);
    }
  }

  async storeFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileId = Math.random().toString(36).substr(2, 9);
        const storedFile: StoredFile = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          data: reader.result as string,
          uploadedAt: new Date().toISOString()
        };

        this.files.set(fileId, storedFile);
        this.saveToStorage();
        resolve(fileId);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  getFile(fileId: string): StoredFile | null {
    return this.files.get(fileId) || null;
  }

  getFileUrl(fileId: string): string | null {
    const file = this.files.get(fileId);
    return file ? file.data : null;
  }

  deleteFile(fileId: string): boolean {
    const deleted = this.files.delete(fileId);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  getFilesByNames(fileNames: string[]): StoredFile[] {
    return Array.from(this.files.values()).filter(file => 
      fileNames.includes(file.name)
    );
  }

  // Clean up old files (older than 30 days)
  cleanupOldFiles() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let cleaned = 0;
    this.files.forEach((file, id) => {
      if (new Date(file.uploadedAt) < thirtyDaysAgo) {
        this.files.delete(id);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      this.saveToStorage();
      console.log(`Cleaned up ${cleaned} old files`);
    }
  }
}

export const fileStorage = new FileStorage();
