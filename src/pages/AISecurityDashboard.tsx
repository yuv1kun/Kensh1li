/**
 * AI Security Dashboard
 * 
 * This page integrates all the AI-enhanced security features, including
 * anomaly analysis, threat intelligence, and security recommendations.
 */

import React, { useState, useEffect } from 'react';
import { EnrichedAnomaly } from '../lib/ai/analysis/anomaly-analysis-integration';
import { AnomalyInsightsContainer } from '../components/ai-enhanced/AnomalyInsights';
import { RootCauseAnalysisContainer } from '../components/ai-enhanced/RootCauseAnalysis';
import { AnomalyClassificationContainer } from '../components/ai-enhanced/AnomalyClassification';
import { EventCorrelationContainer } from '../components/ai-enhanced/EventCorrelation';
import { ThreatIntelligenceContainer } from '../components/ai-enhanced/ThreatIntelligence';
import { ZeroDayDetectionContainer } from '../components/ai-enhanced/ZeroDayDetection';
import { ResponseRecommendationsContainer } from '../components/ai-enhanced/ResponseRecommendations';
import { IncidentPlaybooksContainer } from '../components/ai-enhanced/IncidentPlaybooks';
import { SecurityBriefingsContainer } from '../components/ai-enhanced/SecurityBriefings';
import { getAnomalyAnalysisIntegration } from '../lib/ai/analysis/anomaly-analysis-integration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Shield, 
  AlertCircle, 
  AlertOctagon, 
  Search, 
  Zap, 
  FileText, 
  PieChart, 
  BarChart, 
  Network,
  ClipboardList
} from 'lucide-react';

export function AISecurityDashboard() {
  const [integrationStatus, setIntegrationStatus] = useState<{
    isEnabled: boolean;
    queueLength: number;
    isProcessing: boolean;
  }>({
    isEnabled: false,
    queueLength: 0,
    isProcessing: false,
  });
  
  const [selectedTabValue, setSelectedTabValue] = useState('anomalies');
  const [selectedAnomaly, setSelectedAnomaly] = useState<EnrichedAnomaly | null>(null);

  useEffect(() => {
    // Initialize the integration
    const integration = getAnomalyAnalysisIntegration();
    
    // In a real implementation, we would check the status
    // and update the state accordingly
    setIntegrationStatus({
      isEnabled: true,
      queueLength: 0,
      isProcessing: false,
    });

    // Enable the integration
    integration.enable();
    integration.configure({
      analysisThreshold: 0.6,
      analyzeAll: false,
    });

    return () => {
      // Disable the integration when the component unmounts
      integration.disable();
    };
  }, []);

  const toggleIntegration = () => {
    const integration = getAnomalyAnalysisIntegration();
    if (integrationStatus.isEnabled) {
      integration.disable();
    } else {
      integration.enable();
    }

    setIntegrationStatus(prev => ({
      ...prev,
      isEnabled: !prev.isEnabled,
    }));
  };
  
  const handleInvestigateAnomaly = (anomaly: EnrichedAnomaly) => {
    console.log('Investigating anomaly:', anomaly.id);
    setSelectedAnomaly(anomaly);
    setSelectedTabValue('rootcause');
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Security Dashboard</h1>
          <p className="text-muted-foreground">
            Advanced network security analysis powered by Llama 3
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={integrationStatus.isEnabled ? 'bg-green-500/10 text-green-500 border-green-500' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500'}
          >
            {integrationStatus.isEnabled ? 'AI Analysis Active' : 'AI Analysis Inactive'}
          </Badge>
          
          <Button
            variant={integrationStatus.isEnabled ? "destructive" : "default"}
            size="sm"
            onClick={toggleIntegration}
          >
            {integrationStatus.isEnabled ? 'Disable AI' : 'Enable AI'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Analysis Status</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrationStatus.queueLength} 
              <span className="text-muted-foreground text-sm font-normal"> in queue</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {integrationStatus.isProcessing ? 'Currently analyzing anomalies...' : 'Waiting for new anomalies'}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="flex flex-col bg-muted rounded-md p-2">
                <span className="text-muted-foreground">Analyzed Today</span>
                <span className="text-lg font-medium">24</span>
              </div>
              <div className="flex flex-col bg-muted rounded-md p-2">
                <span className="text-muted-foreground">AI Analysis Rate</span>
                <span className="text-lg font-medium">94%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Threat Assessment</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              Medium
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on recent activity and AI analysis
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="flex flex-col rounded-md p-1">
                <span className="text-muted-foreground">Low</span>
                <div className="h-1.5 bg-muted rounded mt-1">
                  <div className="h-full bg-blue-500 rounded w-1/3"></div>
                </div>
              </div>
              <div className="flex flex-col rounded-md p-1">
                <span className="text-muted-foreground">Medium</span>
                <div className="h-1.5 bg-muted rounded mt-1">
                  <div className="h-full bg-amber-500 rounded w-3/4"></div>
                </div>
              </div>
              <div className="flex flex-col rounded-md p-1">
                <span className="text-muted-foreground">High</span>
                <div className="h-1.5 bg-muted rounded mt-1">
                  <div className="h-full bg-destructive rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">AI Security Features</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="p-3 text-center">
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">Features Enabled</p>
              </div>
              <div className="p-3 text-center">
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Features Disabled</p>
              </div>
            </div>
            <div className="p-3 border-t">
              <Button variant="outline" size="sm" className="w-full">
                Configure Features
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={selectedTabValue} onValueChange={setSelectedTabValue} className="w-full">
        <TabsList className="grid grid-cols-8 mb-4">
          <TabsTrigger value="anomalies" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Anomalies
          </TabsTrigger>
          <TabsTrigger value="classification" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" /> Classification
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Search className="h-4 w-4" /> Threat Intel
          </TabsTrigger>
          <TabsTrigger value="correlation" className="flex items-center gap-2">
            <Network className="h-4 w-4" /> Correlation
          </TabsTrigger>
          <TabsTrigger value="zeroday" className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4" /> Zero-Day
          </TabsTrigger>
          <TabsTrigger value="response" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Response
          </TabsTrigger>
          <TabsTrigger value="playbooks" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Playbooks
          </TabsTrigger>
          <TabsTrigger value="briefing" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Security Briefing
          </TabsTrigger>
          <TabsTrigger value="rootcause" className="flex items-center gap-2">
            <Network className="h-4 w-4" /> Root Cause
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="anomalies" className="space-y-4">
          <AnomalyInsightsContainer onInvestigate={handleInvestigateAnomaly} />
        </TabsContent>
        
        <TabsContent value="classification">
          <AnomalyClassificationContainer />
        </TabsContent>
        
        <TabsContent value="intelligence">
          <ThreatIntelligenceContainer />
        </TabsContent>
        
        <TabsContent value="briefing" className="space-y-4">
          <SecurityBriefingsContainer />
        </TabsContent>
        
        <TabsContent value="correlation">
          <EventCorrelationContainer />
        </TabsContent>
        
        <TabsContent value="zeroday">
          <ZeroDayDetectionContainer />
        </TabsContent>
        
        <TabsContent value="response">
          <ResponseRecommendationsContainer />
        </TabsContent>
        
        <TabsContent value="playbooks">
          <IncidentPlaybooksContainer />
        </TabsContent>
        
        <TabsContent value="rootcause">
          <RootCauseAnalysisContainer selectedAnomalyId={selectedAnomaly?.id} anomaly={selectedAnomaly} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AISecurityDashboard;
