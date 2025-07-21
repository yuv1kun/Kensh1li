import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/components/alerts/NotificationProvider';
import AlertHistory from '@/components/alerts/AlertHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Gauge, FileText, Activity, Shield } from 'lucide-react';

/**
 * Alert Dashboard - Comprehensive view for alert management and monitoring
 */
const AlertDashboard: React.FC = () => {
  const { alertSystem } = useNotifications();
  const [activeTab, setActiveTab] = useState<string>("alerts");
  
  if (!alertSystem) {
    return <div className="flex items-center justify-center h-64">Loading alert system...</div>;
  }

  // Generate a test alert (only for demonstration purposes)
  const generateTestAlert = () => {
    if (alertSystem) {
      // Using processAnomaly to generate an alert through the proper channels
      alertSystem.processAnomaly({
        id: `demo-anomaly-${Date.now()}`,
        timestamp: Date.now(),
        confidence: 0.85,
        description: 'This is a test anomaly alert for demonstration',
        relatedFeatures: ['traffic_volume', 'connection_frequency'],
        featureVector: {
          timestamp: Date.now(),
          protocol: 1,
          packetSize: 0.75,
          sourcePortCategory: 2,
          destPortCategory: 3,
          flagsVector: [1, 0, 1],
          payloadEntropy: 0.75,
          srcIpEntropy: 0.65,
          dstIpEntropy: 0.8,
          isIntranet: 0,
          headerFields: [1, 1, 0],
          interPacketTime: 0.5,
          packetRatio: 0.7
        }
      });
    }
  };

  // Generate a test threat (only for demonstration purposes)
  const generateTestThreat = () => {
    if (alertSystem) {
      // Using processThreatDetection to generate an alert through the proper channels
      alertSystem.processThreatDetection({
        id: `demo-threat-${Date.now()}`,
        timestamp: Date.now(),
        description: 'This is a test threat alert for demonstration',
        severity: 'high',
        confidence: 0.95,
        isZeroDay: true,
        protocols: [6, 80], // Numeric protocol identifiers
        sourceIps: ['192.168.1.100'],
        destinationIps: ['10.0.0.1'],
        ports: [80, 443],
        anomalies: [],
        recommendedAction: 'block'
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" /> Alert Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage system alerts, threats, and anomalies
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={generateTestAlert}>
            Generate Test Anomaly
          </Button>
          <Button variant="default" onClick={generateTestThreat}>
            Generate Test Threat
          </Button>
        </div>
      </header>

      <Tabs defaultValue="alerts" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-[600px]">
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Alerts
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" /> Metrics
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Reports
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="alerts" className="space-y-6 mt-6">
          <div className="grid gap-6">
            <AlertHistory alertSystem={alertSystem} />
          </div>
        </TabsContent>
        
        <TabsContent value="metrics" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Metrics</CardTitle>
              <CardDescription>
                Visualizations and statistics for system alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-md">
                <p className="text-muted-foreground">Alert metrics visualization would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Reports</CardTitle>
              <CardDescription>
                Generated reports and analysis of alert patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-md">
                <p className="text-muted-foreground">Alert reports would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Settings</CardTitle>
              <CardDescription>
                Configure alert notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-md">
                <p className="text-muted-foreground">Alert settings would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertDashboard;
