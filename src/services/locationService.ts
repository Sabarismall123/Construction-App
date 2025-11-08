export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
}

export interface ProjectLocation {
  projectId: string;
  location: LocationData;
  visitType: 'site_visit' | 'inspection' | 'delivery' | 'maintenance';
  notes?: string;
  photos?: string[];
}

class LocationService {
  private watchId: number | null = null;
  private currentLocation: LocationData | null = null;

  // Get current GPS location
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          this.currentLocation = location;
          resolve(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(new Error(`Location error: ${error.message}`));
        },
        options
      );
    });
  }

  // Start watching location (for continuous tracking)
  startWatchingLocation(callback: (location: LocationData) => void): void {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };
        this.currentLocation = location;
        callback(location);
      },
      (error) => {
        console.error('Error watching location:', error);
      },
      options
    );
  }

  // Stop watching location
  stopWatchingLocation(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Get last known location
  getLastKnownLocation(): LocationData | null {
    return this.currentLocation;
  }

  // Calculate distance between two points (in meters)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  // Get address from coordinates (using reverse geocoding)
  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
    try {
      // Using a free reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.locality && data.principalSubdivision) {
        return `${data.locality}, ${data.principalSubdivision}, ${data.countryName}`;
      }
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Error getting address:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }

  // Check if location is within project radius
  isLocationWithinProject(
    currentLat: number, 
    currentLon: number, 
    projectLat: number, 
    projectLon: number, 
    radiusMeters: number = 100
  ): boolean {
    const distance = this.calculateDistance(currentLat, currentLon, projectLat, projectLon);
    return distance <= radiusMeters;
  }
}

export const locationService = new LocationService();
