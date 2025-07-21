/**
 * Threat Intelligence Enrichment Component
 * 
 * This component leverages Llama 3 to provide enhanced threat intelligence, 
 * including context generation, event correlation, and pattern analysis.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Skeleton } from "../ui/skeleton";
import { 
  AlertTriangle, 
  Search, 
  Network, 
  Shield, 
  Info,
  Loader2,
  ExternalLink,
  Fingerprint,
  Flame,
  ShieldAlert,
  Code,
  FileText
} from "lucide-react";
import { getSecurityAnalysisService, ThreatIntelligenceResult } from '../../lib/ai/analysis/security-analysis-service';
import { ThreatDetection } from '../../lib/neuromorphic/types';

// Types for the component
interface ThreatIntelligenceProps {
  threatId?: string;
  threat?: ThreatDetection;
  onIntelligenceGenerated?: (result: ThreatIntelligenceResult) => void;
}

/**
 * Component for displaying and generating enhanced threat intelligence using Llama 3
 */
export function ThreatIntelligence({ threatId, threat, onIntelligenceGenerated }: ThreatIntelligenceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [intelligence, setIntelligence] = useState<ThreatIntelligenceResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [error, setError] = useState<string | null>(null);
  
  // Generate threat intelligence when the threat changes or on manual trigger
  const generateIntelligence = async () => {
    if (!threat) {
      setError("No threat data available for intelligence generation");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const securityService = getSecurityAnalysisService();
      const result = await securityService.enhanceThreatIntelligence(threat);
      
      setIntelligence(result);
      
      // Call the callback if provided
      if (onIntelligenceGenerated) {
        onIntelligenceGenerated(result);
      }
    } catch (err) {
      setError(`Failed to generate threat intelligence: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error("Threat intelligence generation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-generate intelligence when a threat is provided
  useEffect(() => {
    if (threat && !intelligence && !isLoading) {
      generateIntelligence();
    }
  }, [threat]);

  if (!threat) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Threat Intelligence</CardTitle>
          <CardDescription>Select a threat to view enhanced intelligence</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Threat Selected</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
            Select a threat to view Llama 3-enhanced intelligence including context, patterns, and mitigation strategies.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              Threat Intelligence
              {intelligence?.threatName && (
                <Badge variant="outline" className="ml-2">
                  {intelligence.threatName}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isLoading ? 'Generating enhanced threat context...' : 'AI-enhanced threat intelligence'}
            </CardDescription>
          </div>
          <Badge variant={threat.severity === 'critical' ? 'destructive' : 
                          threat.severity === 'high' ? 'destructive' : 
                          threat.severity === 'medium' ? 'default' : 'secondary'}>
            {threat.severity.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <div>
                <h4 className="text-sm font-semibold">Generating Threat Intelligence</h4>
                <p className="text-sm text-muted-foreground">
                  Llama 3 is enriching threat data with context, patterns, and recommendations...
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ) : intelligence ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Info className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="indicators" className="flex items-center gap-1">
                <Fingerprint className="h-4 w-4" /> Indicators
              </TabsTrigger>
              <TabsTrigger value="patterns" className="flex items-center gap-1">
                <Flame className="h-4 w-4" /> Attack Patterns
              </TabsTrigger>
              <TabsTrigger value="mitigation" className="flex items-center gap-1">
                <ShieldAlert className="h-4 w-4" /> Mitigation
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <div className="p-3 border rounded-md bg-muted/50">
                  <p>{intelligence.description}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Technical Details</h3>
                <div className="p-3 border rounded-md bg-muted/50 whitespace-pre-wrap font-mono text-xs">
                  {intelligence.technicalDetails}
                </div>
              </div>
              
              {intelligence.externalReferences && intelligence.externalReferences.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">External References</h3>
                  <ul className="space-y-1">
                    {intelligence.externalReferences.map((reference, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <span>{reference}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="indicators" className="space-y-4">
              <h3 className="font-semibold mb-2">Indicators of Compromise (IoCs)</h3>
              {intelligence.indicators && intelligence.indicators.length > 0 ? (
                <ul className="space-y-2">
                  {intelligence.indicators.map((indicator, i) => (
                    <li key={i} className="flex items-start gap-2 p-2 border rounded-md">
                      <Fingerprint className="h-4 w-4 mt-0.5 text-primary" />
                      <span>{indicator}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-4">No specific indicators available</p>
              )}
            </TabsContent>
            
            <TabsContent value="patterns" className="space-y-4">
              <h3 className="font-semibold mb-2">Attack Patterns</h3>
              {intelligence.attackPatterns && intelligence.attackPatterns.length > 0 ? (
                <ul className="space-y-2">
                  {intelligence.attackPatterns.map((pattern, i) => (
                    <li key={i} className="flex items-start gap-2 p-2 border rounded-md">
                      <Code className="h-4 w-4 mt-0.5 text-primary" />
                      <span>{pattern}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-4">No attack patterns available</p>
              )}
            </TabsContent>
            
            <TabsContent value="mitigation" className="space-y-4">
              <h3 className="font-semibold mb-2">Mitigation Steps</h3>
              {intelligence.mitigationSteps && intelligence.mitigationSteps.length > 0 ? (
                <ul className="space-y-2">
                  {intelligence.mitigationSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 p-2 border rounded-md">
                      <Shield className="h-4 w-4 mt-0.5 text-primary" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-4">No mitigation steps available</p>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Generate Intelligence</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
              Click the button below to generate enhanced threat intelligence using Llama 3
            </p>
            <Button onClick={generateIntelligence}>
              Generate Intelligence
            </Button>
          </div>
        )}
      </CardContent>
      
      {intelligence && (
        <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
          Intelligence generated for threat ID: {threat.id}
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Container component that manages the threat selection and
 * intelligence display for multiple threats
 */
export function ThreatIntelligenceContainer() {
  const [selectedThreatId, setSelectedThreatId] = useState<string | null>(null);
  const [generatedResults, setGeneratedResults] = useState<{[key: string]: ThreatIntelligenceResult}>({});
  
  // Mock threats for demonstration - in a real implementation, these would come from the threat detection system
  const [mockThreats] = useState<ThreatDetection[]>([
    {
      id: 'threat-1',
      timestamp: Date.now() - 1000 * 60 * 30,
      severity: 'high',
      confidence: 0.89,
      anomalies: ['anomaly-1', 'anomaly-4'],
      sourceIps: ['192.168.1.245'],
      destinationIps: ['45.33.32.156', '107.182.131.117'],
      ports: [443, 8443],
      protocols: [6], // TCP
      description: 'Data exfiltration activity with encrypted channel to suspicious external hosts',
      recommendedAction: 'Block outbound connections to destination IPs and investigate source host',
      isZeroDay: false
    },
    {
      id: 'threat-2',
      timestamp: Date.now() - 1000 * 60 * 120,
      severity: 'critical',
      confidence: 0.95,
      anomalies: ['anomaly-3', 'anomaly-7'],
      sourceIps: ['209.58.176.33', '217.138.211.53'],
      destinationIps: ['10.0.0.15', '10.0.0.23'],
      ports: [22, 3389, 445],
      protocols: [6], // TCP
      description: 'Potential ransomware precursor activity with lateral movement attempts',
      recommendedAction: 'Isolate affected systems, block external IPs, and initiate incident response',
      isZeroDay: true
    },
    {
      id: 'threat-3',
      timestamp: Date.now() - 1000 * 60 * 240,
      severity: 'medium',
      confidence: 0.78,
      anomalies: ['anomaly-2'],
      sourceIps: ['10.0.0.5'],
      destinationIps: ['10.0.0.1'],
      ports: [22],
      protocols: [6], // TCP
      description: 'Internal brute force authentication attempt against administrative systems',
      recommendedAction: 'Lock affected accounts, implement additional authentication controls, and investigate source',
      isZeroDay: false
    }
  ]);

  const handleIntelligenceGenerated = (result: ThreatIntelligenceResult) => {
    setGeneratedResults(prev => ({
      ...prev,
      [result.threatId]: result
    }));
  };

  const getSelectedThreat = (): ThreatDetection | undefined => {
    return mockThreats.find(t => t.id === selectedThreatId);
  };
  
  const selectedThreat = getSelectedThreat();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ThreatIntelligence 
            threat={selectedThreat} 
            onIntelligenceGenerated={handleIntelligenceGenerated}
          />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Threat</CardTitle>
              <CardDescription>Choose a threat for intelligence analysis</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockThreats.map(threat => (
                  <div 
                    key={threat.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 ${selectedThreatId === threat.id ? 'bg-muted' : ''}`}
                    onClick={() => setSelectedThreatId(threat.id)}
                  >
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={threat.severity === 'critical' ? 'destructive' : 
                                threat.severity === 'high' ? 'destructive' : 
                                threat.severity === 'medium' ? 'default' : 'secondary'}
                      >
                        {threat.severity}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {threat.isZeroDay && <Badge variant="outline" className="bg-amber-100">Zero-Day</Badge>}
                        {generatedResults[threat.id] && (
                          <Badge variant="outline" className="bg-green-100">Analyzed</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 font-medium">
                      {threat.description.length > 60 
                        ? `${threat.description.substring(0, 60)}...` 
                        : threat.description}
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <div>
                        Sources: {threat.sourceIps.length}
                      </div>
                      <div>
                        Targets: {threat.destinationIps.length}
                      </div>
                      <div>
                        Confidence: {Math.round(threat.confidence * 100)}%
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

export default ThreatIntelligenceContainer;
