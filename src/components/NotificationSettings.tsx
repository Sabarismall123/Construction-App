import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { notificationService } from '@/services/notificationService';

interface NotificationSettingsProps {
  className?: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ className = '' }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    taskReminders: true,
    deadlineAlerts: true,
    projectMilestones: true,
    issueAlerts: true,
    reminderTime: 15, // minutes before due date
    soundEnabled: true,
    vibrationEnabled: true
  });

  // Check notification permission on mount
  useEffect(() => {
    setIsEnabled(notificationService.isAvailable());
  }, []);

  // Request notification permission
  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await notificationService.requestPermission();
      setIsEnabled(granted);
      
      if (granted) {
        // Show welcome notification
        await notificationService.showNotification({
          id: 'welcome-notification',
          title: '🔔 Notifications Enabled',
          body: 'You will now receive task reminders and deadline alerts!',
          tag: 'welcome'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test notification
  const testNotification = async () => {
    if (!isEnabled) return;

    await notificationService.showNotification({
      id: 'test-notification',
      title: '🧪 Test Notification',
      body: 'This is a test notification to verify everything is working!',
      tag: 'test',
      requireInteraction: true,
      actions: [
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  };

  // Update settings
  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify({
      ...settings,
      [key]: value
    }));
  };

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  }, []);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notification Settings
        </h3>
        <div className="flex items-center space-x-2">
          {isEnabled ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      {!isEnabled && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Notifications Disabled
            </h4>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            Enable notifications to receive task reminders, deadline alerts, and project updates.
          </p>
          <button
            onClick={requestPermission}
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {isLoading ? 'Requesting...' : 'Enable Notifications'}
          </button>
        </div>
      )}

      {isEnabled && (
        <div className="space-y-6">
          {/* Test notification */}
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Test Notifications
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Send a test notification to verify everything is working.
              </p>
            </div>
            <button
              onClick={testNotification}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Send Test
            </button>
          </div>

          {/* Notification types */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Notification Types
            </h4>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Task Reminders
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.taskReminders}
                  onChange={(e) => updateSetting('taskReminders', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Deadline Alerts
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.deadlineAlerts}
                  onChange={(e) => updateSetting('deadlineAlerts', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Project Milestones
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.projectMilestones}
                  onChange={(e) => updateSetting('projectMilestones', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Issue Alerts
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.issueAlerts}
                  onChange={(e) => updateSetting('issueAlerts', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>
            </div>
          </div>

          {/* Reminder timing */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Reminder Timing
            </h4>
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Remind me before due date:
              </label>
              <select
                value={settings.reminderTime}
                onChange={(e) => updateSetting('reminderTime', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={1440}>1 day</option>
                <option value={2880}>2 days</option>
                <option value={10080}>1 week</option>
              </select>
            </div>
          </div>

          {/* Advanced settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Advanced Settings
            </h4>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Sound Notifications
                </span>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Vibration (Mobile)
                </span>
                <input
                  type="checkbox"
                  checked={settings.vibrationEnabled}
                  onChange={(e) => updateSetting('vibrationEnabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
