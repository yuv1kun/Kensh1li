import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCheck, ChevronDown, Download, BellOff, Trash } from 'lucide-react';
import { Alert, AlertSystem } from '@/lib/neuromorphic/alert-system';
import { NotificationService } from '@/lib/notifications/notification-service';

interface AlertManagementButtonsProps {
  alertSystem: AlertSystem;
  selectedAlerts: Alert[];
  onSelectionChange: () => void;
}

/**
 * Utility buttons for bulk alert management operations
 */
const AlertManagementButtons: React.FC<AlertManagementButtonsProps> = ({ 
  alertSystem, 
  selectedAlerts,
  onSelectionChange
}) => {
  const notificationService = NotificationService.getInstance(alertSystem);
  
  const handleAcknowledgeAll = () => {
    if (!alertSystem) return;
    
    const activeAlerts = alertSystem.getActiveAlerts();
    activeAlerts.forEach(alert => {
      alertSystem.acknowledgeAlert(alert.id);
    });
    
    onSelectionChange();
  };
  
  const handleAcknowledgeSelected = () => {
    if (!alertSystem || selectedAlerts.length === 0) return;
    
    selectedAlerts.forEach(alert => {
      alertSystem.acknowledgeAlert(alert.id);
    });
    
    onSelectionChange();
  };

  const handleExportCSV = () => {
    const csv = notificationService.exportAlertHistoryCSV();
    downloadFile(csv, 'alert-history.csv', 'text/csv');
  };

  const handleExportJSON = () => {
    const json = notificationService.exportAlertHistoryJSON();
    downloadFile(json, 'alert-history.json', 'application/json');
  };
  
  const handleExportSelectedCSV = () => {
    if (selectedAlerts.length === 0) return;
    
    const headers = [
      'ID', 'Timestamp', 'Title', 'Message', 'Severity', 
      'Source', 'Related Entity ID', 'Acknowledged', 'Metadata'
    ];
    
    const rows = selectedAlerts.map(alert => [
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
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    downloadFile(csv, 'selected-alerts.csv', 'text/csv');
  };
  
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };
  
  const escapeCsvField = (field: string): string => {
    // If the field contains commas, quotes, or newlines, wrap it in quotes
    if (/[",\n\r]/.test(field)) {
      // Replace any quotes with double quotes for escaping
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };
  
  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center"
        onClick={handleAcknowledgeAll}
      >
        <CheckCheck className="mr-1 h-4 w-4" />
        Acknowledge All
      </Button>
      
      {selectedAlerts.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={handleAcknowledgeSelected}
        >
          <BellOff className="mr-1 h-4 w-4" />
          Acknowledge Selected ({selectedAlerts.length})
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center">
            <Download className="mr-1 h-4 w-4" />
            Export <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportCSV}>
            All Alerts as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportJSON}>
            All Alerts as JSON
          </DropdownMenuItem>
          
          {selectedAlerts.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportSelectedCSV}>
                Selected Alerts ({selectedAlerts.length}) as CSV
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AlertManagementButtons;
