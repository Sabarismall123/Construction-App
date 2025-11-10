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

  // Get current GPS location with improved accuracy
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      // Use high accuracy settings for better location precision
      const options: PositionOptions = {
        enableHighAccuracy: true, // Use GPS if available
        timeout: 20000, // Increased timeout for better accuracy (20 seconds)
        maximumAge: 0 // Always get fresh location, don't use cached
      };

      // Try to get multiple readings and average them for better accuracy
      let readings: Array<{ lat: number; lng: number; accuracy: number }> = [];
      let attempts = 0;
      const maxAttempts = 3;

      const getLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            readings.push({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            });

            attempts++;

            // If we have good accuracy (< 50m) or we've tried 3 times, use the best reading
            if (position.coords.accuracy < 50 || attempts >= maxAttempts) {
              // Use the reading with the best (lowest) accuracy
              const bestReading = readings.reduce((best, current) => 
                current.accuracy < best.accuracy ? current : best
              );

              const location: LocationData = {
                latitude: bestReading.lat,
                longitude: bestReading.lng,
                accuracy: bestReading.accuracy,
                timestamp: Date.now()
              };
              
              this.currentLocation = location;
              console.log('📍 Location captured:', {
                lat: location.latitude,
                lng: location.longitude,
                accuracy: `${location.accuracy}m`,
                attempts: attempts
              });
              resolve(location);
            } else {
              // Wait a bit and try again for better accuracy
              setTimeout(() => {
                getLocation();
              }, 1000);
            }
          },
          (error) => {
            // If we have at least one reading, use it
            if (readings.length > 0) {
              const bestReading = readings.reduce((best, current) => 
                current.accuracy < best.accuracy ? current : best
              );
              
              const location: LocationData = {
                latitude: bestReading.lat,
                longitude: bestReading.lng,
                accuracy: bestReading.accuracy,
                timestamp: Date.now()
              };
              
              this.currentLocation = location;
              console.log('📍 Location captured (with errors):', {
                lat: location.latitude,
                lng: location.longitude,
                accuracy: `${location.accuracy}m`
              });
              resolve(location);
            } else {
              console.error('Error getting location:', error);
              reject(new Error(`Location error: ${error.message}`));
            }
          },
          options
        );
      };

      // Start getting location
      getLocation();
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

  // Get address from coordinates (using reverse geocoding with multiple fallbacks)
  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
    // Try multiple reverse geocoding services for better accuracy
    const services = [
      // Service 1: OpenStreetMap Nominatim (more accurate for Indian locations)
      async () => {
        try {
          // Use higher zoom level (18-19) for more specific results
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=19&addressdetails=1&extratags=1`,
            {
              headers: {
                'User-Agent': 'ConstructionApp/1.0',
                'Accept-Language': 'en'
              }
            }
          );
          const data = await response.json();
          
          if (data.address) {
            const addr = data.address;
            // Build address from most specific to least specific
            const parts: string[] = [];
            
            // Check if we're in Chennai area (by checking state or city)
            const isInChennai = (addr.state && addr.state.toLowerCase().includes('tamil')) ||
                               (addr.city && (addr.city.toLowerCase().includes('chennai') || addr.city.toLowerCase().includes('madras'))) ||
                               (data.display_name && data.display_name.toLowerCase().includes('chennai'));
            
            // For Chennai and Tamil Nadu, prioritize specific areas
            // Check for specific Chennai areas first
            if (isInChennai) {
              // Check display_name for Chennai-specific areas like Tondiarpet
              if (data.display_name) {
                const displayLower = data.display_name.toLowerCase();
                // Common Chennai areas/zones
                const chennaiAreas = ['tondiarpet', 'tondiarpet', 'royapuram', 'washermanpet', 'perambur', 
                                     'vyasarpadi', 'kolathur', 'ambattur', 'anna nagar', 't nagar', 
                                     'mylapore', 'adyar', 'guindy', 'porur', 'padi', 'koyambedu'];
                
                for (const area of chennaiAreas) {
                  if (displayLower.includes(area)) {
                    // Capitalize first letter
                    const areaName = area.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    parts.push(areaName);
                    break;
                  }
                }
              }
              
              // Check neighbourhood/suburb for Chennai areas
              if (addr.neighbourhood) {
                const neighLower = addr.neighbourhood.toLowerCase();
                // If it's a Chennai area name, use it
                if (neighLower.includes('tondiarpet') || neighLower.includes('division') || 
                    neighLower.includes('zone') || neighLower.includes('ward')) {
                  parts.push(addr.neighbourhood);
                } else if (!parts.length) {
                  // Only add if we don't have a more specific area
                  parts.push(addr.neighbourhood);
                }
              } else if (addr.suburb && !parts.length) {
                parts.push(addr.suburb);
              } else if (addr.quarter && !parts.length) {
                parts.push(addr.quarter);
              }
              
              // Always add Chennai if we're in Chennai area
              if (!parts.some(p => p.toLowerCase().includes('chennai') || p.toLowerCase().includes('madras'))) {
                parts.push('Chennai');
              }
            } else {
              // Not in Chennai, use standard parsing
              if (addr.neighbourhood) {
                parts.push(addr.neighbourhood);
              } else if (addr.suburb) {
                parts.push(addr.suburb);
              } else if (addr.quarter) {
                parts.push(addr.quarter);
              }
              
              // Then city/district
              if (addr.city) {
                parts.push(addr.city);
              } else if (addr.town) {
                parts.push(addr.town);
              } else if (addr.village) {
                parts.push(addr.village);
              }
            }
            
            // State level
            if (addr.state) {
              parts.push(addr.state);
            } else if (addr.state_district) {
              parts.push(addr.state_district);
            }
            
            // Country
            if (addr.country) {
              parts.push(addr.country);
            }
            
            if (parts.length > 0) {
              const address = parts.join(', ');
              console.log('📍 OpenStreetMap address:', address, 'from coordinates:', latitude, longitude);
              return address;
            }
            
            // Fallback to display_name if available, but parse it better
            if (data.display_name) {
              const displayParts = data.display_name.split(',').map((p: string) => p.trim());
              // For Chennai, try to get the first 2-3 parts (area, city, state)
              // Filter out generic parts like "India", "Tamil Nadu" if we have more specific info
              const relevantParts = displayParts.filter((p: string) => {
                const lower = p.toLowerCase();
                return !lower.includes('india') || displayParts.length <= 2;
              }).slice(0, 3);
              
              if (relevantParts.length > 0) {
                const address = relevantParts.join(', ');
                console.log('📍 Using display_name:', address);
                return address;
              }
            }
          }
          return null;
        } catch (error) {
          console.warn('OpenStreetMap geocoding failed:', error);
          return null;
        }
      },
      
      // Service 2: BigDataCloud (fallback) - improved for Indian locations
      async () => {
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          // Build address with more specific information
          const parts: string[] = [];
          
          // City/Locality
          if (data.locality) {
            // For Chennai, check if we have a more specific area
            if (data.locality.toLowerCase().includes('chennai') || 
                data.locality.toLowerCase().includes('madras')) {
              // Try to get the specific area if available
              if (data.city) {
                parts.push(data.city);
              }
              parts.push('Chennai');
            } else {
              parts.push(data.locality);
            }
          } else if (data.city) {
            parts.push(data.city);
          }
          
          // State
          if (data.principalSubdivision) {
            parts.push(data.principalSubdivision);
          }
          
          // Country
          if (data.countryName) {
            parts.push(data.countryName);
          } else {
            parts.push('India');
          }
          
          if (parts.length > 0) {
            const address = parts.join(', ');
            console.log('📍 BigDataCloud address:', address);
            return address;
          }
          
          return null;
        } catch (error) {
          console.warn('BigDataCloud geocoding failed:', error);
          return null;
        }
      },
      
      // Service 3: MapBox (if available)
      async () => {
        try {
          // Using a free alternative - GeoNames
          const response = await fetch(
            `https://api.geonames.org/findNearbyPlaceNameJSON?lat=${latitude}&lng=${longitude}&username=demo&maxRows=1`
          );
          const data = await response.json();
          
          if (data.geonames && data.geonames.length > 0) {
            const place = data.geonames[0];
            return `${place.name}, ${place.adminName1 || ''}, ${place.countryName || 'India'}`.replace(/,\s*,/g, ',').trim();
          }
          return null;
        } catch (error) {
          console.warn('GeoNames geocoding failed:', error);
          return null;
        }
      }
    ];

    // Try each service in order until one succeeds
    for (const service of services) {
      try {
        const address = await service();
        if (address && address.trim().length > 0) {
          console.log('✅ Address resolved:', address);
          return address;
        }
      } catch (error) {
        console.warn('Geocoding service error:', error);
        continue;
      }
    }

    // If all services fail, return coordinates
    console.warn('⚠️ All geocoding services failed, using coordinates');
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
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
