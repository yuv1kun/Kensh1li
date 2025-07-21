import { toast } from 'sonner';
import { Alert, AlertSystem } from '../neuromorphic/alert-system';

/**
 * NotificationService - Handles displaying toast notifications for alerts
 * and manages alert history
 */
export class NotificationService {
  private static instance: NotificationService;
  private alertSystem: AlertSystem;
  private alertHistory: Alert[] = [];
  private subscription: { unsubscribe: () => void } | null = null;

  private constructor(alertSystem: AlertSystem) {
    this.alertSystem = alertSystem;
    
    // Load existing alerts into history
    this.alertHistory = alertSystem.getAllAlerts();
    
    // Subscribe to new alerts
    this.subscription = this.alertSystem.subscribeToAlerts((alert) => {
      this.showNotification(alert);
      this.alertHistory.push(alert);
    });
  }

  /**
   * Get or create the NotificationService instance
   */
  public static getInstance(alertSystem: AlertSystem): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(alertSystem);
    }
    return NotificationService.instance;
  }

  /**
   * Display a toast notification for an alert
   */
  private showNotification(alert: Alert): void {
    const options = {
      duration: getSeverityDuration(alert.severity),
      id: alert.id,
      onDismiss: () => this.acknowledgeAlert(alert.id)
    };

    switch (alert.severity) {
      case 'critical':
      case 'error':
        toast.error(alert.title, {
          description: alert.message,
          ...options
        });
        break;
      case 'warning':
        toast.warning(alert.title, {
          description: alert.message,
          ...options
        });
        break;
      case 'info':
      default:
        toast.info(alert.title, {
          description: alert.message,
          ...options
        });
        break;
    }
  }

  /**
   * Acknowledge an alert
   */
  public acknowledgeAlert(alertId: string): void {
    this.alertSystem.acknowledgeAlert(alertId);
  }

  /**
   * Get all alert history
   */
  public getAlertHistory(): Alert[] {
    return [...this.alertHistory];
  }

  /**
   * Export alert history as CSV
   */
  public exportAlertHistoryCSV(): string {
    const headers = [
      'ID', 'Timestamp', 'Title', 'Message', 'Severity', 
      'Source', 'Related Entity ID', 'Acknowledged', 'Metadata'
    ];
    
    const rows = this.alertHistory.map(alert => [
      alert.id,
      new Date(alert.timestamp).toISOString(),
      escapeCsvField(alert.title),
      escapeCsvField(alert.message),
      alert.severity,
      alert.source,
      alert.relatedEntityId || '',
      alert.acknowledged ? 'Yes' : 'No',
      JSON.stringify(alert.metadata)
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  /**
   * Export alert history as JSON
   */
  public exportAlertHistoryJSON(): string {
    return JSON.stringify(this.alertHistory, null, 2);
  }

  /**
   * Cleanup when the service is no longer needed
   */
  public destroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}

/**
 * Get appropriate duration for toast based on severity
 */
function getSeverityDuration(severity: string): number {
  switch (severity) {
    case 'critical':
    case 'error':
      return 10000; // 10 seconds
    case 'warning':
      return 7000; // 7 seconds
    case 'info':
    default:
      return 5000; // 5 seconds
  }
}

/**
 * Escape CSV fields to handle special characters
 */
function escapeCsvField(field: string): string {
  // If the field contains commas, quotes, or newlines, wrap it in quotes
  if (/[",\n\r]/.test(field)) {
    // Replace any quotes with double quotes for escaping
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
