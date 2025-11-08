import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Wifi, WifiOff } from 'lucide-react';
import { locationService, LocationData } from '@/services/locationService';

interface LocationTrackerProps {
  onLocationUpdate?: (location: LocationData) => void;
  onLocationError?: (error: string) => void;
  autoTrack?: boolean;
  showAddress?: boolean;
  className?: string;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({
  onLocationUpdate,
  onLocationError,
  autoTrack = false,
  showAddress = true,
  className = ''
}) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');

  // Get current location
  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentLocation = await locationService.getCurrentLocation();
      setLocation(currentLocation);

      if (showAddress) {
        const addr = await locationService.getAddressFromCoordinates(
          currentLocation.latitude,
          currentLocation.longitude
        );
        setAddress(addr);
      }

      onLocationUpdate?.(currentLocation);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      onLocationError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Start/stop tracking
  const toggleTracking = () => {
    if (isTracking) {
      locationService.stopWatchingLocation();
      setIsTracking(false);
    } else {
      locationService.startWatchingLocation((newLocation) => {
        setLocation(newLocation);
        onLocationUpdate?.(newLocation);

        if (showAddress) {
          locationService.getAddressFromCoordinates(
            newLocation.latitude,
            newLocation.longitude
          ).then(setAddress);
        }
      });
      setIsTracking(true);
    }
  };

  // Auto-track on mount if enabled
  useEffect(() => {
    if (autoTrack) {
      getCurrentLocation();
    }
  }, [autoTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      locationService.stopWatchingLocation();
    };
  }, []);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Location Tracking
        </h3>
        <div className="flex items-center space-x-2">
          {isTracking ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isTracking ? 'Tracking' : 'Stopped'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {location && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Navigation className="w-4 h-4 mr-2" />
            <span>
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </span>
          </div>
          
          {showAddress && address && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              📍 {address}
            </div>
          )}

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              Accuracy: ±{Math.round(location.accuracy)}m
            </span>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date(location.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {isLoading ? 'Getting Location...' : 'Get Current Location'}
        </button>
        
        <button
          onClick={toggleTracking}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isTracking
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </button>
      </div>
    </div>
  );
};

export default LocationTracker;
