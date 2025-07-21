import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertSystem } from "@/lib/neuromorphic/alert-system";
import { useNotifications } from './NotificationProvider';
import AlertManagementButtons from './AlertManagementButtons';
import { Download, CheckCircle, AlertCircle, Bell, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AlertHistoryProps {
  alertSystem: AlertSystem;
}

const AlertHistory: React.FC<AlertHistoryProps> = ({ alertSystem }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [source, setSource] = useState<string>('all');
  const [selectedAlerts, setSelectedAlerts] = useState<Alert[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");
  const { notificationService } = useNotifications();

  useEffect(() => {
    // Initial fetch of alert history
    setAlerts(notificationService.getAlertHistory());

    // Subscribe to new alerts
    const subscription = alertSystem.subscribeToAlerts((alert) => {
      setAlerts((prevAlerts) => [...prevAlerts, alert]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [alertSystem, notificationService]);

  const handleExportCSV = () => {
    const csv = notificationService.exportAlertHistoryCSV();
    downloadFile(csv, 'alert-history.csv', 'text/csv');
  };

  const handleExportJSON = () => {
    const json = notificationService.exportAlertHistoryJSON();
    downloadFile(json, 'alert-history.json', 'application/json');
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

  const handleAcknowledge = (alertId: string) => {
    notificationService.acknowledgeAlert(alertId);
    setAlerts((prevAlerts) => 
      prevAlerts.map((alert) => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (source !== 'all' && alert.source !== source) return false;
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (activeTab === 'acknowledged' && !alert.acknowledged) return false;
    if (activeTab === 'active' && alert.acknowledged) return false;
    return true;
  });

  // Reset selection when filters change
  useEffect(() => {
    setSelectedAlerts([]);
  }, [source, filterSeverity, activeTab]);

  const handleSelectAlert = (alert: Alert, isChecked: boolean) => {
    if (isChecked) {
      setSelectedAlerts(prev => [...prev, alert]);
    } else {
      setSelectedAlerts(prev => prev.filter(a => a.id !== alert.id));
    }
  };

  const isAlertSelected = (id: string) => {
    return selectedAlerts.some(alert => alert.id === id);
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedAlerts(filteredAlerts);
    } else {
      setSelectedAlerts([]);
    }
  };

  const areAllSelected = filteredAlerts.length > 0 && 
    selectedAlerts.length === filteredAlerts.length;

  const renderSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle size={14} /> Critical</Badge>;
      case 'error':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle size={14} /> Error</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500 text-white flex items-center gap-1"><AlertCircle size={14} /> Warning</Badge>;
      case 'info':
      default:
        return <Badge variant="secondary" className="flex items-center gap-1"><Info size={14} /> Info</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center space-x-4">
          <h2 className="text-2xl font-bold mb-0">
            Alert History
            {selectedAlerts.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({selectedAlerts.length} selected)
              </span>
            )}
          </h2>
          {alertSystem && (
            <AlertManagementButtons 
              alertSystem={alertSystem}
              selectedAlerts={selectedAlerts}
              onSelectionChange={() => setSelectedAlerts([])}
            />
          )}
        </div>
        <CardDescription>
          View and manage all system alerts and notifications
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <Tabs defaultValue="all" className="w-[400px]" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Alerts</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-2">
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="anomaly">Anomaly</SelectItem>
                  <SelectItem value="threat">Threat</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableCaption>A list of all system alerts and notifications</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]">
                  <Checkbox 
                    checked={areAllSelected} 
                    onCheckedChange={handleSelectAll} 
                    disabled={filteredAlerts.length === 0}
                  />
                </TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No alerts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Checkbox 
                        checked={isAlertSelected(alert.id)} 
                        onCheckedChange={(checked) => handleSelectAlert(alert, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-mono">
                      {new Date(alert.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm text-gray-500">{alert.message}</div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{alert.source}</TableCell>
                    <TableCell>{renderSeverityBadge(alert.severity)}</TableCell>
                    <TableCell>
                      {alert.acknowledged ? 
                        <Badge variant="outline" className="flex items-center gap-1">
                          <CheckCircle size={14} />
                          Acknowledged
                        </Badge> : 
                        <Badge variant="default" className="flex items-center gap-1">
                          <Bell size={14} />
                          Active
                        </Badge>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      {!alert.acknowledged && (
                        <Button size="sm" variant="ghost" onClick={() => handleAcknowledge(alert.id)}>
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Acknowledge
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-gray-500">
        <div>{filteredAlerts.length} alerts</div>
        <div>Updated {new Date().toLocaleString()}</div>
      </CardFooter>
    </Card>
  );
};

export default AlertHistory;
