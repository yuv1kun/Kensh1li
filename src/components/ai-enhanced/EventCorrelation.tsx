/**
 * Event Correlation Component
 * 
 * This component uses Llama 3 to correlate security events and find patterns,
 * relationships, and potential attack sequences across multiple detected anomalies.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { Skeleton } from "../ui/skeleton";
import { 
  Network, 
  AlertTriangle, 
  Share2, 
  Loader2,
  ArrowRight,
  Clock,
  Activity,
  Zap,
  FileText
} from "lucide-react";
import { getSecurityAnalysisService } from '../../lib/ai/analysis/security-analysis-service';
import { Anomaly, ThreatDetection } from '../../lib/neuromorphic/types';

// Types specific to event correlation
interface CorrelationNode {
  id: string;
  type: 'anomaly' | 'threat';
  timestamp: number;
  description: string;
  severity: string;
  confidence: number;
}

interface CorrelationLink {
  source: string;
  target: string;
  relationship: string;
  confidence: number;
}

interface CorrelationPattern {
  id: string;
  name: string;
  description: string;
  nodes: string[]; // IDs of involved nodes
  confidence: number;
  attackPhase?: string;
  techniques?: string[];
}

interface CorrelationResult {
  nodes: CorrelationNode[];
  links: CorrelationLink[];
  patterns: CorrelationPattern[];
  summary: string;
  recommendations: string[];
}

interface EventCorrelationProps {
  anomalies?: Anomaly[];
  threats?: ThreatDetection[];
  timespan?: number; // In milliseconds
  onCorrelationGenerated?: (result: CorrelationResult) => void;
}

/**
 * Component for correlating security events and identifying patterns using AI
 */
export function EventCorrelation({
  anomalies = [],
  threats = [],
  timespan = 24 * 60 * 60 * 1000, // Default: 24 hours
  onCorrelationGenerated
}: EventCorrelationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CorrelationResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [error, setError] = useState<string | null>(null);

  // Generate event correlation analysis
  const correlateEvents = async () => {
    if (anomalies.length === 0 && threats.length === 0) {
      setError("No events available for correlation");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call the SecurityAnalysisService
      // For now we'll simulate the correlation using the available data
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create nodes from anomalies and threats
      const nodes: CorrelationNode[] = [
        ...anomalies.map(a => ({
          id: a.id,
          type: 'anomaly' as const,
          timestamp: a.timestamp,
          description: a.relatedFeatures.slice(0, 3).join(', '),
          severity: a.confidence > 0.8 ? 'high' : a.confidence > 0.6 ? 'medium' : 'low',
          confidence: a.confidence
        })),
        ...threats.map(t => ({
          id: t.id,
          type: 'threat' as const,
          timestamp: t.timestamp,
          description: t.description,
          severity: t.severity,
          confidence: t.confidence
        }))
      ];
      
      // Sort by timestamp
      nodes.sort((a, b) => a.timestamp - b.timestamp);
      
      // Generate links between events
      const links: CorrelationLink[] = [];
      
      // Create some example links between events close in time
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          // Only link events within a reasonable time window (1 hour)
          if (nodes[j].timestamp - nodes[i].timestamp <= 60 * 60 * 1000) {
            // Higher confidence if the events are closer in time
            const timeDistance = (nodes[j].timestamp - nodes[i].timestamp) / (60 * 60 * 1000);
            const confidenceFactor = Math.max(0.3, 1 - (timeDistance / 2));
            
            links.push({
              source: nodes[i].id,
              target: nodes[j].id,
              relationship: 'temporal_sequence',
              confidence: confidenceFactor
            });
          }
        }
      }
      
      // Generate example patterns
      const patterns: CorrelationPattern[] = [];
      
      if (nodes.length >= 3) {
        // Find subsequences of 3+ events as patterns
        for (let i = 0; i < nodes.length - 2; i++) {
          const patternNodes = nodes.slice(i, i + 3);
          const nodeIds = patternNodes.map(n => n.id);
          
          // Create a pattern if the events are within a reasonable timeframe (2 hours)
          const timeSpan = patternNodes[patternNodes.length - 1].timestamp - patternNodes[0].timestamp;
          if (timeSpan <= 2 * 60 * 60 * 1000) {
            patterns.push({
              id: `pattern-${i}`,
              name: `Sequential Pattern ${i + 1}`,
              description: `A sequence of ${patternNodes.length} events occurring within ${Math.round(timeSpan / (60 * 1000))} minutes`,
              nodes: nodeIds,
              confidence: 0.7 + (Math.random() * 0.2),
              attackPhase: Math.random() > 0.5 ? 'reconnaissance' : 'exploitation',
              techniques: ['T1046: Network Service Scanning', 'T1190: Exploit Public-Facing Application']
            });
          }
        }
      }
      
      // Create the result
      const mockResult: CorrelationResult = {
        nodes,
        links,
        patterns,
        summary: patterns.length > 0 
          ? `Identified ${patterns.length} potential attack patterns across ${nodes.length} security events within the analyzed timeframe. The most significant pattern suggests a potential ${patterns[0]?.attackPhase || 'unknown'} phase of an attack.`
          : `Analyzed ${nodes.length} security events but found no clear attack patterns. Events may be isolated incidents or require additional context.`,
        recommendations: [
          'Monitor source IPs involved in multiple events for additional suspicious activity',
          'Implement additional logging for affected systems to capture more context',
          'Review firewall rules to restrict traffic between affected systems'
        ]
      };
      
      setResult(mockResult);
      
      if (onCorrelationGenerated) {
        onCorrelationGenerated(mockResult);
      }
    } catch (err) {
      setError(`Failed to correlate events: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error("Event correlation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-correlate when events change
  useEffect(() => {
    if ((anomalies.length > 0 || threats.length > 0) && !result && !isLoading) {
      correlateEvents();
    }
  }, [anomalies, threats]);
  
  if (anomalies.length === 0 && threats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Correlation</CardTitle>
          <CardDescription>No events available for correlation analysis</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Events Available</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Select a time range with active security events to perform correlation analysis.
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
            <CardTitle>Event Correlation</CardTitle>
            <CardDescription>
              {isLoading 
                ? 'Correlating events and identifying patterns...' 
                : `Analysis of ${anomalies.length + threats.length} security events`}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={correlateEvents}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Share2 className="h-4 w-4 mr-2" />}
            {isLoading ? 'Correlating...' : 'Re-analyze'}
          </Button>
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
                <h4 className="text-sm font-semibold">Correlating Events</h4>
                <p className="text-sm text-muted-foreground">
                  Analyzing relationships between events and identifying patterns...
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ) : result ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="summary" className="flex items-center gap-1">
                <FileText className="h-4 w-4" /> Summary
              </TabsTrigger>
              <TabsTrigger value="patterns" className="flex items-center gap-1">
                <Zap className="h-4 w-4" /> Patterns
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> Timeline
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4">
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertTitle>Correlation Analysis</AlertTitle>
                <AlertDescription>{result.summary}</AlertDescription>
              </Alert>
              
              <div>
                <h3 className="font-semibold mb-2">Key Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-md p-3 text-center">
                    <div className="text-2xl font-bold mb-1">{result.nodes.length}</div>
                    <div className="text-xs text-muted-foreground">Total Events</div>
                  </div>
                  <div className="border rounded-md p-3 text-center">
                    <div className="text-2xl font-bold mb-1">{result.links.length}</div>
                    <div className="text-xs text-muted-foreground">Relationships</div>
                  </div>
                  <div className="border rounded-md p-3 text-center">
                    <div className="text-2xl font-bold mb-1">{result.patterns.length}</div>
                    <div className="text-xs text-muted-foreground">Patterns</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="patterns" className="space-y-4">
              {result.patterns.length > 0 ? (
                <div className="space-y-4">
                  {result.patterns.map(pattern => (
                    <Card key={pattern.id} className="shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">{pattern.name}</CardTitle>
                          <Badge>
                            {Math.round(pattern.confidence * 100)}% Confidence
                          </Badge>
                        </div>
                        <CardDescription>{pattern.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2 space-y-3">
                        {pattern.attackPhase && (
                          <div>
                            <div className="text-xs mb-1 font-medium">Attack Phase</div>
                            <Badge variant="outline" className="capitalize">
                              {pattern.attackPhase}
                            </Badge>
                          </div>
                        )}
                        
                        {pattern.techniques && pattern.techniques.length > 0 && (
                          <div>
                            <div className="text-xs mb-1 font-medium">MITRE ATT&CK Techniques</div>
                            <div className="flex flex-wrap gap-1">
                              {pattern.techniques.map((tech, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <div className="text-xs mb-1 font-medium">Involved Events ({pattern.nodes.length})</div>
                          <div className="space-y-2">
                            {pattern.nodes.map(nodeId => {
                              const node = result.nodes.find(n => n.id === nodeId);
                              return node ? (
                                <div key={nodeId} className="flex items-center justify-between text-sm border rounded-md p-2">
                                  <div className="flex items-center">
                                    <Badge 
                                      variant={node.type === 'threat' ? 'destructive' : 'default'} 
                                      className="mr-2"
                                    >
                                      {node.type}
                                    </Badge>
                                    <span className="truncate max-w-[200px]">{node.description}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(node.timestamp).toLocaleTimeString()}
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Patterns Detected</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    No significant correlation patterns were detected among the current events.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Event Timeline</h3>
                <div className="space-y-2">
                  {result.nodes.map((node, i) => {
                    const isConnected = result.links.some(
                      link => link.source === node.id || link.target === node.id
                    );
                    
                    return (
                      <div key={node.id} className={`relative`}>
                        {i > 0 && (
                          <div className="absolute left-[15px] -top-2 bottom-1/2 w-0.5 bg-muted-foreground/20" />
                        )}
                        {i < result.nodes.length - 1 && (
                          <div className="absolute left-[15px] top-1/2 -bottom-2 w-0.5 bg-muted-foreground/20" />
                        )}
                        <div className={`flex items-start p-3 border rounded-md ${isConnected ? 'border-primary/50 bg-primary/5' : ''}`}>
                          <div className={`rounded-full w-[30px] h-[30px] flex items-center justify-center mr-3 flex-shrink-0 ${
                            node.type === 'threat' 
                              ? 'bg-destructive/20 text-destructive' 
                              : 'bg-primary/20 text-primary'
                          }`}>
                            {node.type === 'threat' ? (
                              <AlertTriangle className="h-4 w-4" />
                            ) : (
                              <Activity className="h-4 w-4" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium truncate">
                                {node.description}
                              </div>
                              <Badge variant="outline" className="ml-2 shrink-0">
                                {node.severity}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div>
                                {new Date(node.timestamp).toLocaleString()}
                              </div>
                              <div>
                                Confidence: {Math.round(node.confidence * 100)}%
                              </div>
                            </div>
                            
                            {isConnected && (
                              <div className="mt-2">
                                <div className="text-xs font-medium mb-1">Related Events:</div>
                                <div className="flex flex-wrap gap-1">
                                  {result.links
                                    .filter(link => link.source === node.id || link.target === node.id)
                                    .map((link, j) => {
                                      const relatedNodeId = link.source === node.id ? link.target : link.source;
                                      const relatedNode = result.nodes.find(n => n.id === relatedNodeId);
                                      
                                      return relatedNode ? (
                                        <Badge key={j} variant="secondary" className="text-xs">
                                          {relatedNode.type} ({Math.round(link.confidence * 100)}%)
                                        </Badge>
                                      ) : null;
                                    })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <Share2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Correlate Events</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
              Analyze relationships between security events to identify patterns and attack sequences
            </p>
            <Button onClick={correlateEvents}>
              Start Correlation
            </Button>
          </div>
        )}
      </CardContent>
      
      {result && (
        <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
          Analysis based on {result.nodes.length} events over the past {Math.round(timespan / (1000 * 60 * 60))} hours
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Container component that manages data fetching and displays both the 
 * correlation analysis and list of available security events
 */
export function EventCorrelationContainer() {
  const [timeRange, setTimeRange] = useState<number>(24 * 60 * 60 * 1000); // Default: 24 hours
  const [correlationResult, setCorrelationResult] = useState<CorrelationResult | null>(null);
  
  // Mock data for demonstration
  const [mockAnomalies] = useState<Anomaly[]>([
    {
      id: 'anomaly-1',
      timestamp: Date.now() - 1000 * 60 * 15,
      confidence: 0.87,
      relatedFeatures: ['unusual_outbound_traffic', 'encrypted_channel', 'data_volume'],
      description: 'Unusual outbound encrypted traffic with high data volume',
      featureVector: {
        timestamp: Date.now() - 1000 * 60 * 15,
        protocol: 6, // TCP
        packetSize: 1420,
        sourcePortCategory: 3, // High port
        destPortCategory: 1, // HTTPS port
        flagsVector: [1, 0, 1, 0, 1],
        payloadEntropy: 0.87,
        srcIpEntropy: 0.33,
        dstIpEntropy: 0.92,
        isIntranet: 0,
        headerFields: [0.76, 0.45, 0.33],
        interPacketTime: 0.02,
        packetRatio: 0.85
      }
    },
    {
      id: 'anomaly-2',
      timestamp: Date.now() - 1000 * 60 * 180,
      confidence: 0.76,
      relatedFeatures: ['credential_access', 'failed_auth', 'brute_force'],
      description: 'Multiple failed authentication attempts indicating potential brute force',
      featureVector: {
        timestamp: Date.now() - 1000 * 60 * 180,
        protocol: 6, // TCP
        packetSize: 240,
        sourcePortCategory: 3, // High port
        destPortCategory: 2, // SSH port
        flagsVector: [1, 1, 0, 0, 1],
        payloadEntropy: 0.45,
        srcIpEntropy: 0.76,
        dstIpEntropy: 0.24,
        isIntranet: 1,
        headerFields: [0.82, 0.93, 0.11],
        interPacketTime: 0.5,
        packetRatio: 0.33
      }
    },
    {
      id: 'anomaly-3',
      timestamp: Date.now() - 1000 * 60 * 100,
      confidence: 0.92,
      relatedFeatures: ['lateral_movement', 'admin_access', 'script_execution'],
      description: 'Lateral movement with administrative access and script execution',
      featureVector: {
        timestamp: Date.now() - 1000 * 60 * 100,
        protocol: 6, // TCP
        packetSize: 890,
        sourcePortCategory: 2, // Admin port
        destPortCategory: 2, // Admin port
        flagsVector: [1, 1, 1, 0, 1],
        payloadEntropy: 0.92,
        srcIpEntropy: 0.79,
        dstIpEntropy: 0.88,
        isIntranet: 1,
        headerFields: [0.95, 0.81, 0.87],
        interPacketTime: 0.05,
        packetRatio: 0.95
      }
    }
  ]);
  
  const [mockThreats] = useState<ThreatDetection[]>([
    {
      id: 'threat-1',
      timestamp: Date.now() - 1000 * 60 * 30,
      severity: 'high',
      confidence: 0.89,
      anomalies: ['anomaly-1'],
      sourceIps: ['192.168.1.245'],
      destinationIps: ['45.33.32.156'],
      ports: [443],
      protocols: [6], // TCP
      description: 'Data exfiltration activity with encrypted channel',
      recommendedAction: 'Block outbound connections and investigate',
      isZeroDay: false
    },
    {
      id: 'threat-2',
      timestamp: Date.now() - 1000 * 60 * 120,
      severity: 'critical',
      confidence: 0.95,
      anomalies: ['anomaly-3'],
      sourceIps: ['209.58.176.33'],
      destinationIps: ['10.0.0.15'],
      ports: [22, 445],
      protocols: [6], // TCP
      description: 'Potential ransomware precursor activity',
      recommendedAction: 'Isolate systems and initiate incident response',
      isZeroDay: true
    }
  ]);

  const handleCorrelationGenerated = (result: CorrelationResult) => {
    setCorrelationResult(result);
  };
  
  return (
    <div className="space-y-6">
      <EventCorrelation
        anomalies={mockAnomalies}
        threats={mockThreats}
        timespan={timeRange}
        onCorrelationGenerated={handleCorrelationGenerated}
      />
    </div>
  );
}

export default EventCorrelationContainer;
