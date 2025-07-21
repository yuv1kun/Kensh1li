/**
 * Root Cause Analysis Component
 * 
 * This component provides AI-powered deep analysis of security anomalies,
 * identifying root causes, vulnerabilities, and affected systems.
 * It's integrated with the SecurityAnalysisService to leverage Llama 3's
 * advanced capabilities for technical security investigation.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Skeleton } from "../ui/skeleton";
import { Search, ArrowRight, AlertTriangle, Shield, Server, Network, Code, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { getSecurityAnalysisService, RootCauseAnalysisResult as ServiceRootCauseAnalysisResult } from '../../lib/ai/analysis/security-analysis-service';
import { Anomaly, ThreatDetection } from '../../lib/neuromorphic/types';
import { EnrichedAnomaly } from '../../lib/ai/analysis/anomaly-analysis-integration';
import { nanoid } from 'nanoid';

// Types for the root cause analysis component
interface RootCauseAnalysisProps {
  anomalyId?: string;
  anomaly?: Anomaly | ThreatDetection | EnrichedAnomaly;
  onComplete?: (result: RootCauseAnalysisResult) => void;
}

// Enhanced mock anomaly type with additional fields used in our UI
interface MockAnomaly extends Anomaly {
  severity: string;
  label: string;
  sourceMetrics: {
    sourceIp: string;
    destinationIp: string;
    port: number;
    protocol: string;
    packetSize: number;
    packetRate: number;
    byteRate: number;
    connectionDuration: number;
    connectionCount: number;
    retransmissionRate: number;
    latency: number;
  };
}

// Extended version of the service's RootCauseAnalysisResult with UI-specific fields
export interface RootCauseAnalysisResult extends ServiceRootCauseAnalysisResult {
  id: string;
  anomalyId?: string;
  timestamp: number;
  recommendations?: string[];
  securityImpact?: string;
  mitigationSteps?: string[];
}

export function RootCauseAnalysis({ anomalyId, anomaly, onComplete }: RootCauseAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RootCauseAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Start analysis when component mounts if anomaly is provided
  useEffect(() => {
    if (anomaly && !analysisResult && !isAnalyzing) {
      handleStartAnalysis();
    }
  }, [anomaly, analysisResult, isAnalyzing]);

  const handleStartAnalysis = async () => {
    if (!anomaly) {
      setError("No anomaly data provided for analysis");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const securityService = getSecurityAnalysisService();
      
      // Generate a root cause analysis using the security service
      const result = await securityService.performRootCauseAnalysis(anomaly);
      
      // Add id and timestamp if not present
      const enhancedResult: RootCauseAnalysisResult = {
        ...result,
        id: nanoid(),
        anomalyId: anomalyId || anomaly.id,
        timestamp: Date.now(),
        recommendations: result.recommendations || [],
        securityImpact: result.securityImpact || '',
        mitigationSteps: result.mitigationSteps || []
      };
      
      setAnalysisResult(enhancedResult);
      
      // Call the completion handler if provided
      if (onComplete) {
        onComplete(enhancedResult);
      }
    } catch (err) {
      setError(`Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to render confidence level
  const renderConfidence = (confidence: number) => {
    let color = "text-amber-500";
    if (confidence >= 0.8) color = "text-green-500";
    else if (confidence <= 0.4) color = "text-red-500";
    
    return (
      <div className="flex items-center gap-1.5">
        <div className={`font-medium ${color}`}>{Math.round(confidence * 100)}%</div>
        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full ${confidence >= 0.8 ? 'bg-green-500' : confidence <= 0.4 ? 'bg-red-500' : 'bg-amber-500'}`} 
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>
    );
  };

  if (!anomaly) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Root Cause Analysis</CardTitle>
          <CardDescription>
            No anomaly selected for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <AlertTriangle className="mr-2" /> Select an anomaly to perform root cause analysis
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Root Cause Analysis</CardTitle>
            <CardDescription>
              Deep analysis of anomaly patterns and potential security implications
            </CardDescription>
          </div>
          {!isAnalyzing && !analysisResult && (
            <Button 
              onClick={handleStartAnalysis}
              variant="outline"
              size="sm"
              className="mt-1"
            >
              <Search className="h-4 w-4 mr-1" /> Start Analysis
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isAnalyzing && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <div>
                <div className="font-medium">Analyzing Anomaly</div>
                <div className="text-sm text-muted-foreground">
                  Investigating patterns and identifying potential root causes...
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!isAnalyzing && !error && !analysisResult && (
          <div className="p-8 text-center text-muted-foreground">
            <div className="mb-4">
              <Search className="h-8 w-8 mx-auto opacity-50" />
            </div>
            <p>Analysis has not been started yet</p>
            <p className="text-sm">Click the "Start Analysis" button to begin investigating this anomaly</p>
          </div>
        )}
        
        {analysisResult && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-500" /> 
                Root Cause
              </h3>
              <div className="bg-muted p-3 rounded-md">
                {analysisResult.rootCause}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1.5 text-blue-500" />
                <span className="font-medium mr-2">Confidence:</span>
              </div>
              {renderConfidence(analysisResult.confidence)}
            </div>
            
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <Server className="h-4 w-4 mr-1.5 text-purple-500" />
                Affected Systems
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.affectedSystems.map((system, i) => (
                  <Badge key={i} variant="outline">{system}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1.5 text-red-500" />
                Vulnerabilities Exploited
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.vulnerabilities.map((vuln, i) => (
                  <Badge key={i} variant="outline" className="bg-red-50">{vuln}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <Code className="h-4 w-4 mr-1.5 text-amber-500" />
                Exploit Methods
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.exploitMethods.map((method, i) => (
                  <Badge key={i} variant="outline" className="bg-amber-50">{method}</Badge>
                ))}
              </div>
            </div>
            
            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
                  Recommendations
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {analysisResult.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysisResult.securityImpact && (
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <Network className="h-4 w-4 mr-1.5 text-blue-500" />
                  Security Impact
                </h3>
                <p className="text-sm">{analysisResult.securityImpact}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {analysisResult && (
        <CardFooter className="bg-muted/30 gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Analysis completed {new Date(analysisResult.timestamp).toLocaleString()}
          </div>
          {analysisResult.id && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Hash className="h-3 w-3" />
              ID: {analysisResult.id.substring(0, 8)}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Container component that manages multiple root cause analyses
 * and provides a UI for selecting and displaying them.
 */
interface RootCauseAnalysisContainerProps {
  selectedAnomalyId?: string;
  anomaly?: Anomaly | ThreatDetection | EnrichedAnomaly;
}

export function RootCauseAnalysisContainer({ selectedAnomalyId, anomaly }: RootCauseAnalysisContainerProps) {
  // Internal state for selected anomaly when not provided externally
  const [internalSelectedAnomalyId, setInternalSelectedAnomalyId] = useState<string>(
    selectedAnomalyId || 'anomaly-1'
  );

  // Track analyses that have been completed
  const [analyses, setAnalyses] = useState<RootCauseAnalysisResult[]>([]);
  
  // Mock anomalies for demonstration purposes
  const [mockAnomalies] = useState<MockAnomaly[]>([
    {
      id: 'anomaly-1',
      timestamp: Date.now() - 1000 * 60 * 15,
      confidence: 0.92,
      sourceIp: '192.168.1.5',
      type: 'network_anomaly', 
      status: 'active',
      featureVector: {},
      sourceMetrics: {
        sourceIp: '192.168.1.5',
        destinationIp: '45.33.49.2',
        port: 443,
        protocol: 'https',
        packetSize: 1500,
        packetRate: 450,
        byteRate: 675000,
        connectionDuration: 180,
        connectionCount: 12,
        retransmissionRate: 0.05,
        latency: 120
      },
      label: 'suspicious_data_exfiltration',
      severity: 'high'
    },
    {
      id: 'anomaly-2',
      timestamp: Date.now() - 1000 * 60 * 45,
      confidence: 0.78,
      sourceIp: '10.0.0.5',
      type: 'network_anomaly',
      status: 'active',
      featureVector: {},
      sourceMetrics: {
        sourceIp: '10.0.0.5',
        destinationIp: '10.0.0.1',
        port: 22,
        protocol: 'ssh',
        packetSize: 64,
        packetRate: 850,
        byteRate: 54400,
        connectionDuration: 120,
        connectionCount: 16,
        retransmissionRate: 0.02,
        latency: 4
      },
      label: 'brute_force_attempt',
      severity: 'medium'
    }
  ]);

  const handleAnalysisComplete = (result: RootCauseAnalysisResult) => {
    setAnalyses(prev => {
      const existing = prev.findIndex(a => a.anomalyId === result.anomalyId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = result;
        return updated;
      } else {
        return [...prev, result];
      }
    });
  };

  const getSelectedAnomaly = () => {
    // If an external anomaly is provided, use it
    if (anomaly) {
      return anomaly;
    }
    // Otherwise use the selected mock anomaly
    return mockAnomalies.find(a => a.id === internalSelectedAnomalyId) || 
      (mockAnomalies.length > 0 ? mockAnomalies[0] : undefined);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {getSelectedAnomaly() && (
            <RootCauseAnalysis 
              anomaly={getSelectedAnomaly()}
              onComplete={handleAnalysisComplete} 
            />
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Anomaly</CardTitle>
              <CardDescription>Choose an anomaly to investigate</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockAnomalies.map(anomaly => (
                  <div 
                    key={anomaly.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 ${internalSelectedAnomalyId === anomaly.id ? 'bg-muted' : ''}`}
                    onClick={() => setInternalSelectedAnomalyId(anomaly.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={anomaly.severity === 'high' ? 'destructive' : 'outline'}>
                          {anomaly.severity}
                        </Badge>
                        <span className="font-medium">{anomaly.label.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(anomaly.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {anomaly.sourceMetrics.sourceIp} → {anomaly.sourceMetrics.destinationIp}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-xs">
                        Protocol: <span className="font-medium">{anomaly.sourceMetrics.protocol}</span>
                      </div>
                      <div className="text-xs">
                        Port: <span className="font-medium">{anomaly.sourceMetrics.port}</span>
                      </div>
                      <div className="text-xs">
                        Confidence: <span className="font-medium">{Math.round(anomaly.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RootCauseAnalysisContainer;
