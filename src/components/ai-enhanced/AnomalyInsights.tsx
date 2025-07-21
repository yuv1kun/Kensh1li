/**
 * AI-Enhanced Anomaly Insights Component
 * 
 * This component displays detailed insights about network anomalies,
 * enhanced with AI analysis from Llama 3 via Ollama.
 */

import React, { useState, useEffect } from 'react';
import { EnrichedAnomaly } from '../../lib/ai/analysis/anomaly-analysis-integration';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  AlertTriangle, 
  ChevronRight, 
  FileSearch, 
  Shield, 
  Zap, 
  Terminal, 
  Clock,
  Download
} from 'lucide-react';
import { AnomalyDetector } from '../../lib/neuromorphic/anomaly-detector';

interface AnomalyInsightsProps {
  anomaly: EnrichedAnomaly;
  onInvestigate?: (anomaly: EnrichedAnomaly) => void;
  onDismiss?: (anomaly: EnrichedAnomaly) => void;
  fullWidth?: boolean;
  showActions?: boolean;
}

/**
 * Component for displaying AI-enhanced anomaly insights
 */
export function AnomalyInsights({
  anomaly,
  onInvestigate,
  onDismiss,
  fullWidth = false,
  showActions = true,
}: AnomalyInsightsProps) {
  // Format timestamp
  const formattedTime = new Date(anomaly.timestamp).toLocaleString();
  
  // Determine severity color based on AI analysis or fallback to confidence
  const getSeverityColor = () => {
    if (anomaly.analyzed && anomaly.aiAnalysis) {
      if (anomaly.aiAnalysis.isZeroDay) return 'bg-destructive text-destructive-foreground';
      
      const threatCount = anomaly.aiAnalysis.relatedThreats.length;
      if (threatCount > 2) return 'bg-destructive text-destructive-foreground';
      if (threatCount > 0) return 'bg-amber-500 text-amber-950';
      return 'bg-blue-500 text-blue-950';
    }
    
    // Fallback based on confidence
    if (anomaly.confidence > 0.8) return 'bg-destructive text-destructive-foreground';
    if (anomaly.confidence > 0.6) return 'bg-amber-500 text-amber-950';
    return 'bg-blue-500 text-blue-950';
  };

  // Generate status message
  const getStatusMessage = () => {
    if (!anomaly.analyzed) {
      return 'Detected (no AI analysis)';
    }
    
    if (!anomaly.aiAnalysis) {
      return 'AI analysis failed';
    }
    
    if (anomaly.aiAnalysis.isZeroDay) {
      return 'Possible zero-day exploit';
    }
    
    return `AI analyzed (${Math.round(anomaly.aiAnalysis.confidence * 100)}% confidence)`;
  };

  return (
    <Card className={`${fullWidth ? 'w-full' : 'w-[450px]'} shadow-lg bg-background border-muted-foreground/20`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <Badge variant="outline" className={`${getSeverityColor()} mb-2`}>
              {anomaly.analyzed && anomaly.aiAnalysis 
                ? (anomaly.aiAnalysis.isZeroDay ? 'CRITICAL' : `Confidence: ${Math.round(anomaly.confidence * 100)}%`) 
                : `Confidence: ${Math.round(anomaly.confidence * 100)}%`}
            </Badge>
            <CardTitle className="text-lg">
              {anomaly.analyzed && anomaly.aiAnalysis 
                ? `${anomaly.aiAnalysis.summary.split('.')[0]}`
                : `Anomaly Detected (ID: ${anomaly.id.substring(0, 8)})`}
            </CardTitle>
          </div>
          {anomaly.analyzed && anomaly.aiAnalysis?.isZeroDay && (
            <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
          )}
        </div>
        <CardDescription className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" /> {formattedTime} • {getStatusMessage()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        {anomaly.analyzed && anomaly.aiAnalysis ? (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-2">
              <div className="text-sm space-y-2">
                <div className="font-medium">Root Cause:</div>
                <div className="pl-2 text-muted-foreground">{anomaly.aiAnalysis.rootCause}</div>
                
                <div className="font-medium mt-2">Potential Impact:</div>
                <div className="pl-2 text-muted-foreground">{anomaly.aiAnalysis.possibleImpact}</div>
                
                {anomaly.aiAnalysis.relatedThreats.length > 0 && (
                  <>
                    <div className="font-medium mt-2">Related Threat Patterns:</div>
                    <ul className="list-disc pl-6 text-muted-foreground">
                      {anomaly.aiAnalysis.relatedThreats.map((threat, index) => (
                        <li key={index}>{threat}</li>
                      ))}
                    </ul>
                  </>
                )}
                
                {anomaly.aiAnalysis.isZeroDay && (
                  <div className="mt-2 p-2 bg-destructive/10 border border-destructive rounded-md text-destructive">
                    <span className="font-bold">ZERO-DAY ALERT:</span> This anomaly exhibits characteristics of a 
                    previously unknown attack pattern.
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="technical">
              <div className="text-sm max-h-[300px] overflow-y-auto">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-sm font-medium py-2">
                      Technical Analysis
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {anomaly.aiAnalysis.technicalDetails}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="features">
                    <AccordionTrigger className="text-sm font-medium py-2">
                      Feature Vector
                    </AccordionTrigger>
                    <AccordionContent className="text-xs">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="text-muted-foreground">Protocol:</div>
                        <div>{anomaly.featureVector.protocol}</div>
                        <div className="text-muted-foreground">Packet Size:</div>
                        <div>{anomaly.featureVector.packetSize}</div>
                        <div className="text-muted-foreground">Source Port:</div>
                        <div>{anomaly.featureVector.sourcePortCategory}</div>
                        <div className="text-muted-foreground">Dest Port:</div>
                        <div>{anomaly.featureVector.destPortCategory}</div>
                        <div className="text-muted-foreground">Payload Entropy:</div>
                        <div>{anomaly.featureVector.payloadEntropy.toFixed(3)}</div>
                        <div className="text-muted-foreground">Src IP Entropy:</div>
                        <div>{anomaly.featureVector.srcIpEntropy.toFixed(3)}</div>
                        <div className="text-muted-foreground">Intranet:</div>
                        <div>{anomaly.featureVector.isIntranet ? 'Yes' : 'No'}</div>
                        <div className="text-muted-foreground">Processing Time:</div>
                        <div>{anomaly.processingTime ? `${anomaly.processingTime}ms` : 'N/A'}</div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>
            
            <TabsContent value="actions">
              <div className="text-sm">
                <div className="font-medium mb-1">Recommended Actions:</div>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {anomaly.aiAnalysis.recommendedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
                
                {anomaly.aiAnalysis.isZeroDay && (
                  <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500 rounded-md">
                    <span className="font-bold">IMPORTANT:</span> Consider isolation procedures 
                    for affected systems until this potential zero-day is fully investigated.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-sm text-muted-foreground">
            {anomaly.description || 'Network anomaly detected. No AI analysis available.'}
            
            <div className="grid grid-cols-2 gap-1 mt-3 text-xs">
              <div className="text-muted-foreground">Protocol:</div>
              <div>{anomaly.featureVector.protocol}</div>
              <div className="text-muted-foreground">Packet Size:</div>
              <div>{anomaly.featureVector.packetSize}</div>
              <div className="text-muted-foreground">Source Port:</div>
              <div>{anomaly.featureVector.sourcePortCategory}</div>
              <div className="text-muted-foreground">Dest Port:</div>
              <div>{anomaly.featureVector.destPortCategory}</div>
            </div>
          </div>
        )}
      </CardContent>
      
      {showActions && (
        <CardFooter className="p-4 pt-2 flex justify-between gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onDismiss && onDismiss(anomaly)}
          >
            Dismiss
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 gap-1"
            onClick={() => onInvestigate && onInvestigate(anomaly)}
          >
            <FileSearch className="h-4 w-4" /> Investigate
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Container component that fetches and displays recent anomalies with AI insights
 */
interface AnomalyInsightsContainerProps {
  onInvestigate?: (anomaly: EnrichedAnomaly) => void;
}

export function AnomalyInsightsContainer({ onInvestigate }: AnomalyInsightsContainerProps = {}) {
  const [anomalies, setAnomalies] = useState<EnrichedAnomaly[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // This would be replaced with real data from the AnomalyAnalysisIntegration
  useEffect(() => {
    // In a real implementation, this would subscribe to the AnomalyAnalysisIntegration
    // to get real-time enriched anomalies
    const fetchAnomalies = async () => {
      try {
        setLoading(true);
        // Simulate fetching data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real implementation, this would be:
        // const integration = getAnomalyAnalysisIntegration();
        // integration.subscribeToEnrichedAnomalies((anomaly) => {
        //   setAnomalies(prev => [anomaly, ...prev].slice(0, 10));
        // });
        
        // For now, use mock data
        setAnomalies([
          {
            id: '1234567890',
            timestamp: Date.now() - 120000,
            confidence: 0.92,
            relatedFeatures: ['payload', 'port'],
            featureVector: {
              timestamp: Date.now() - 120000,
              protocol: 6,
              packetSize: 1420,
              sourcePortCategory: 3,
              destPortCategory: 8,
              flagsVector: [1, 0, 1],
              payloadEntropy: 7.2,
              srcIpEntropy: 5.4,
              dstIpEntropy: 3.8,
              isIntranet: 0,
              headerFields: [1, 0, 1, 0],
              interPacketTime: 0.02,
              packetRatio: 1.5
            },
            description: 'Unusual outbound traffic pattern detected',
            analyzed: true,
            processingTime: 430,
            aiAnalysis: {
              anomalyId: '1234567890',
              summary: 'Possible data exfiltration attempt. Suspicious outbound traffic with high payload entropy.',
              rootCause: 'Anomalous data transfer pattern that matches known exfiltration techniques.',
              confidence: 0.89,
              technicalDetails: 'The payload entropy of 7.2 indicates potentially encrypted or compressed data. Combined with the destination port category and packet timing, this matches patterns used in covert data exfiltration channels.',
              recommendedActions: [
                'Block the connection and investigate the source IP',
                'Check endpoint for signs of compromise',
                'Review recent logins to the source system'
              ],
              relatedThreats: [
                'Data Exfiltration',
                'Command & Control Channel'
              ],
              possibleImpact: 'Potential data breach or unauthorized data access',
              isZeroDay: false
            }
          },
          {
            id: '0987654321',
            timestamp: Date.now() - 300000,
            confidence: 0.78,
            relatedFeatures: ['protocol', 'flags'],
            featureVector: {
              timestamp: Date.now() - 300000,
              protocol: 17,
              packetSize: 68,
              sourcePortCategory: 9,
              destPortCategory: 7,
              flagsVector: [0, 1, 0],
              payloadEntropy: 3.2,
              srcIpEntropy: 4.1,
              dstIpEntropy: 4.5,
              isIntranet: 0,
              headerFields: [0, 1, 0, 1],
              interPacketTime: 0.5,
              packetRatio: 0.8
            },
            description: 'Unusual UDP traffic pattern',
            analyzed: true,
            processingTime: 380,
            aiAnalysis: {
              anomalyId: '0987654321',
              summary: 'DNS tunneling attempt detected.',
              rootCause: 'Potential DNS tunneling used to bypass security controls.',
              confidence: 0.75,
              technicalDetails: 'The traffic displays characteristics consistent with DNS tunneling techniques. The low payload entropy combined with the specific port and protocol pattern suggests command and control communications over DNS.',
              recommendedActions: [
                'Implement DNS query monitoring',
                'Block suspicious DNS requests',
                'Update DNS filtering rules'
              ],
              relatedThreats: [
                'Command & Control',
                'DNS Tunneling'
              ],
              possibleImpact: 'Potential command and control communications',
              isZeroDay: false
            }
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching anomalies:', error);
        setLoading(false);
      }
    };

    fetchAnomalies();
    
    // Clean up function would unsubscribe in real implementation
    return () => {
      // Unsubscribe would go here
    };
  }, []);

  const handleInvestigate = (anomaly: EnrichedAnomaly) => {
    console.log('Investigating anomaly:', anomaly.id);
    // If an external handler is provided, use it
    if (onInvestigate) {
      onInvestigate(anomaly);
      return;
    }
    // Otherwise, in a real implementation, this would navigate to a detailed investigation page
  };

  const handleDismiss = (anomaly: EnrichedAnomaly) => {
    console.log('Dismissing anomaly:', anomaly.id);
    // In a real implementation, this would mark the anomaly as reviewed
    setAnomalies(anomalies.filter(a => a.id !== anomaly.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">AI-Enhanced Anomaly Insights</h3>
        <Button variant="outline" size="sm" className="gap-1">
          <Shield className="h-4 w-4" /> View All
        </Button>
      </div>
      
      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading anomalies...</div>
        </div>
      ) : anomalies.length === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Shield className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-center text-muted-foreground">No anomalies detected</p>
            <p className="text-center text-xs text-muted-foreground/80">
              The network is currently operating within normal parameters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {anomalies.map((anomaly) => (
            <AnomalyInsights
              key={anomaly.id}
              anomaly={anomaly}
              onInvestigate={handleInvestigate}
              onDismiss={handleDismiss}
              fullWidth
            />
          ))}
        </div>
      )}
    </div>
  );
}
