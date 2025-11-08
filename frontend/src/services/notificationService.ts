export interface NotificationData {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Check if notifications are supported and permitted
  isAvailable(): boolean {
    return this.isSupported && this.permission === 'granted';
  }

  // Show a notification
  async showNotification(notificationData: NotificationData): Promise<Notification | null> {
    if (!this.isAvailable()) {
      console.warn('Notifications not available');
      return null;
    }

    try {
      const notification = new Notification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon || '/favicon.ico',
        badge: notificationData.badge || '/favicon.ico',
        tag: notificationData.tag,
        data: notificationData.data,
        requireInteraction: notificationData.requireInteraction || false,
        actions: notificationData.actions || []
      });

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!notificationData.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  // Show task reminder notification
  async showTaskReminder(task: any): Promise<Notification | null> {
    const notificationData: NotificationData = {
      id: `task-reminder-${task.id}`,
      title: '📋 Task Reminder',
      body: `"${task.title}" is due ${this.formatDueDate(task.dueDate)}`,
      tag: 'task-reminder',
      data: { taskId: task.id, type: 'task' },
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Task' },
        { action: 'complete', title: 'Mark Complete' }
      ]
    };

    return this.showNotification(notificationData);
  }

  // Show deadline alert notification
  async showDeadlineAlert(task: any): Promise<Notification | null> {
    const notificationData: NotificationData = {
      id: `deadline-alert-${task.id}`,
      title: '⚠️ Deadline Alert',
      body: `"${task.title}" is overdue!`,
      tag: 'deadline-alert',
      data: { taskId: task.id, type: 'deadline' },
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Task' },
        { action: 'update', title: 'Update Deadline' }
      ]
    };

    return this.showNotification(notificationData);
  }

  // Show project milestone notification
  async showProjectMilestone(project: any, milestone: string): Promise<Notification | null> {
    const notificationData: NotificationData = {
      id: `milestone-${project.id}-${Date.now()}`,
      title: '🎯 Project Milestone',
      body: `"${project.name}": ${milestone}`,
      tag: 'project-milestone',
      data: { projectId: project.id, type: 'milestone' },
      requireInteraction: false
    };

    return this.showNotification(notificationData);
  }

  // Show issue alert notification
  async showIssueAlert(issue: any): Promise<Notification | null> {
    const notificationData: NotificationData = {
      id: `issue-alert-${issue.id}`,
      title: '🚨 Issue Alert',
      body: `New issue: "${issue.title}" (${issue.priority})`,
      tag: 'issue-alert',
      data: { issueId: issue.id, type: 'issue' },
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Issue' },
        { action: 'assign', title: 'Assign to Me' }
      ]
    };

    return this.showNotification(notificationData);
  }

  // Schedule a notification for later
  scheduleNotification(notificationData: NotificationData, delayMs: number): void {
    setTimeout(() => {
      this.showNotification(notificationData);
    }, delayMs);
  }

  // Schedule task reminder
  scheduleTaskReminder(task: any, reminderTime: Date): void {
    const now = new Date();
    const delayMs = reminderTime.getTime() - now.getTime();

    if (delayMs > 0) {
      this.scheduleNotification({
        id: `scheduled-task-reminder-${task.id}`,
        title: '📋 Task Reminder',
        body: `"${task.title}" is due soon!`,
        tag: 'scheduled-task-reminder',
        data: { taskId: task.id, type: 'task' }
      }, delayMs);
    }
  }

  // Format due date for display
  private formatDueDate(dueDate: string | Date): string {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days ago`;
    } else if (diffDays === 0) {
      return 'today';
    } else if (diffDays === 1) {
      return 'tomorrow';
    } else {
      return `in ${diffDays} days`;
    }
  }

  // Close all notifications
  closeAllNotifications(): void {
    if (this.isSupported) {
      // Note: There's no direct way to close all notifications
      // This would need to be implemented with a notification management system
      console.log('Close all notifications requested');
    }
  }
}

export const notificationService = new NotificationService();
