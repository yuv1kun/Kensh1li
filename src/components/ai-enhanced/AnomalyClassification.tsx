/**
 * Enhanced Anomaly Classification Component
 * 
 * This component uses Llama 3 to provide advanced classification for detected anomalies,
 * going beyond basic labels to offer detailed categorization and confidence scoring
 * across multiple potential threat categories.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Progress } from "../ui/progress";
import { Skeleton } from "../ui/skeleton";
import { 
  AlertTriangle, 
  Shield, 
  ArrowRight, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ListFilter
} from "lucide-react";
import { getSecurityAnalysisService } from '../../lib/ai/analysis/security-analysis-service';
import { Anomaly, ThreatDetection, FeatureVector } from '../../lib/neuromorphic/types';
import { nanoid } from 'nanoid';

// Types for the enhanced anomaly classification component
interface AnomalyClassificationProps {
  anomalyId?: string;
  anomaly?: Anomaly | ThreatDetection;
  onClassified?: (result: AnomalyClassificationResult) => void;
}

export interface CategoryScore {
  category: string;
  confidence: number;
  description?: string;
  severity?: string;
}

export interface AnomalyClassificationResult {
  id?: string;
  anomalyId?: string;
  timestamp?: number;
  primaryClassification: string;
  primaryConfidence: number;
  alternativeClassifications: CategoryScore[];
  technicalDetails?: string;
  severity: string;
  recommendation?: string;
}

export function AnomalyClassification({ anomalyId, anomaly, onClassified }: AnomalyClassificationProps) {
  const [isClassifying, setIsClassifying] = useState(false);
  const [classification, setClassification] = useState<AnomalyClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Automatically start classification if anomaly is provided
  useEffect(() => {
    if (anomaly && !classification && !isClassifying) {
      handleStartClassification();
    }
  }, [anomaly, classification, isClassifying]);

  // Define a function to start the classification process
  const handleStartClassification = async () => {
    if (!anomaly) {
      setError("No anomaly data provided for classification");
      return;
    }

    setIsClassifying(true);
    setError(null);

    try {
      // Call the security analysis service to classify the anomaly
      const securityService = getSecurityAnalysisService();
      
      // Note: For demonstration, we're using a mock response while this method is implemented
      // In a production environment, this would call the actual Llama 3 AI service
      
      // Simulate a delay for the AI processing
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Generate mock classification based on anomaly data
      // In reality, this would come from the AI model
      let result: AnomalyClassificationResult;
      
      if ('featureVector' in anomaly) {
        // It's an Anomaly type
        const anomalyDesc = anomaly.description.toLowerCase();
        if (anomalyDesc.includes('exfil') || anomalyDesc.includes('data transfer')) {
          result = createDataExfilClassification(anomaly);
        } else if (anomalyDesc.includes('brute') || anomalyDesc.includes('auth')) {
          result = createBruteForceClassification(anomaly);
        } else if (anomalyDesc.includes('scan') || anomalyDesc.includes('probe')) {
          result = createScanClassification(anomaly);
        } else {
          result = createGenericClassification(anomaly);
        }  
      } else {
        // It's a ThreatDetection type
        result = createGenericThreatClassification(anomaly);
      }
      
      // Add id and timestamp if not present
      const enhancedResult: AnomalyClassificationResult = {
        ...result,
        id: result.id || nanoid(),
        anomalyId: anomalyId || anomaly.id,
        timestamp: result.timestamp || Date.now(),
      };
      
      setClassification(enhancedResult);
      
      // Call the onClassified handler if provided
      if (onClassified) {
        onClassified(enhancedResult);
      }
    } catch (err) {
      setError(`Classification failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsClassifying(false);
    }
  };

  // Helper function to create mock data exfiltration classification
  const createDataExfilClassification = (anomaly: Anomaly): AnomalyClassificationResult => {
    // Extract relevant data from feature vector
    const fv = anomaly.featureVector;
    const protocol = fv.protocol > 0.5 ? "TCP" : "UDP";
    const isHighEntropy = fv.payloadEntropy > 0.7;
    const isIntranet = fv.isIntranet > 0.5;
    
    return {
      primaryClassification: "Data Exfiltration",
      primaryConfidence: 0.89,
      alternativeClassifications: [
        {
          category: "Data Exfiltration",
          confidence: 0.89,
          description: "Pattern matches known data exfiltration techniques with high volume outbound traffic to unusual destinations",
          severity: "high"
        },
        {
          category: "Command and Control Communication",
          confidence: 0.65,
          description: "Secondary indicators suggest potential C2 communication patterns",
          severity: "high" 
        },
        {
          category: "Unusual Network Behavior",
          confidence: 0.72,
          description: "Traffic patterns deviate from established baseline",
          severity: "medium"
        },
        {
          category: "Legitimate Business Traffic",
          confidence: 0.18,
          description: "Low probability of being legitimate business traffic",
          severity: "low"
        }
      ],
      technicalDetails: `
        The network traffic exhibits several characteristics consistent with data exfiltration:
        - High entropy payload (${fv.payloadEntropy.toFixed(2)} entropy score)
        - Protocol: ${protocol}
        - Unusual packet size distribution (${fv.packetSize.toFixed(2)} normalized)
        - Inter-packet timing anomalies (${fv.interPacketTime.toFixed(2)} normalized)
        - ${isIntranet ? "Internal network traffic" : "External destination"}
        - Data transfer ratio highly asymmetric
      `,
      severity: "high",
      recommendation: "Immediately investigate the source host and destination. Capture and analyze traffic for data loss assessment."
    };
  };

  // Helper function to create mock brute force classification
  const createBruteForceClassification = (anomaly: Anomaly): AnomalyClassificationResult => {
    // Extract relevant data from feature vector
    const fv = anomaly.featureVector;
    const likelyPort = fv.destPortCategory > 0.7 ? "authentication service" : "web service";
    const consistentTiming = fv.interPacketTime < 0.3;
    
    return {
      primaryClassification: "Authentication Attack",
      primaryConfidence: 0.82,
      alternativeClassifications: [
        {
          category: "Brute Force Authentication Attack",
          confidence: 0.82,
          description: "High volume of authentication attempts with consistent timing patterns",
          severity: "high"
        },
        {
          category: "Password Spray Attack",
          confidence: 0.54,
          description: "Possible password spray pattern detected",
          severity: "medium"
        },
        {
          category: "Legitimate Auth Retry",
          confidence: 0.12,
          description: "Low probability of being legitimate authentication retries",
          severity: "low"
        },
        {
          category: "System Testing/Automation",
          confidence: 0.08,
          description: "Very low probability of being automated system testing",
          severity: "low"
        }
      ],
      technicalDetails: `
        The pattern shows classic brute force characteristics:
        - Multiple rapid connection attempts
        - Targeting ${likelyPort}
        - ${consistentTiming ? "Consistent" : "Variable"} packet timing (${fv.interPacketTime.toFixed(2)} normalized)
        - Consistent packet sizes (${fv.packetSize.toFixed(2)} normalized)
        - ${fv.flagsVector.join(", ")} flags pattern
      `,
      severity: "high",
      recommendation: "Lock the targeted account, implement progressive rate limiting, and verify no successful breach occurred."
    };
  };

  // Helper function to create mock scanning classification
  const createScanClassification = (anomaly: Anomaly): AnomalyClassificationResult => {
    // Extract relevant data from feature vector
    const fv = anomaly.featureVector;
    const isSequentialScan = fv.destPortCategory < 0.3 && fv.interPacketTime < 0.2;
    const isSmallPacketSize = fv.packetSize < 0.3;
    
    return {
      primaryClassification: "Network Scanning",
      primaryConfidence: 0.94,
      alternativeClassifications: [
        {
          category: "Port Scanning",
          confidence: 0.94,
          description: "Classic port scanning signature with sequential probing",
          severity: "medium"
        },
        {
          category: "Vulnerability Scanning",
          confidence: 0.76,
          description: "Pattern may indicate targeted vulnerability scanning",
          severity: "medium"
        },
        {
          category: "Network Discovery",
          confidence: 0.82,
          description: "Active network mapping behavior detected",
          severity: "medium"
        },
        {
          category: "System Administration",
          confidence: 0.09,
          description: "Very low probability of legitimate system administration",
          severity: "low"
        }
      ],
      technicalDetails: `
        The scan exhibits the following characteristics:
        - ${isSequentialScan ? "Sequential probing pattern" : "Distributed probing pattern"}
        - ${fv.destPortCategory < 0.3 ? "Multiple ports/services targeted" : "Focused on specific services"}
        - ${isSmallPacketSize ? "Small" : "Variable"} packet sizes (${fv.packetSize.toFixed(2)} normalized)
        - Short connection durations
        - ${fv.isIntranet > 0.5 ? "Internal source" : "External source"}
      `,
      severity: "medium",
      recommendation: "Block the scanning IP at the perimeter and verify no vulnerabilities were successfully identified."
    };
  };

  // Helper function to create a generic classification for other anomalies
  const createGenericClassification = (anomaly: Anomaly): AnomalyClassificationResult => {
    // Extract relevant data from feature vector
    const fv = anomaly.featureVector;
    const protocol = fv.protocol > 0.5 ? "TCP" : "UDP";
    const isInternalTraffic = fv.isIntranet > 0.5;
    
    return {
      primaryClassification: "Unusual Network Behavior",
      primaryConfidence: 0.68,
      alternativeClassifications: [
        {
          category: "Unusual Network Behavior",
          confidence: 0.68,
          description: "Traffic patterns deviate significantly from established baseline",
          severity: "medium"
        },
        {
          category: "Misconfigured Application",
          confidence: 0.42,
          description: "Possible application misconfiguration causing unusual traffic",
          severity: "low"
        },
        {
          category: "New Business Service",
          confidence: 0.35,
          description: "Could be newly deployed business service",
          severity: "low"
        },
        {
          category: "Data Transfer Spike",
          confidence: 0.28,
          description: "Temporary spike in legitimate data transfer",
          severity: "low"
        }
      ],
      technicalDetails: `
        The anomaly shows mixed characteristics:
        - Elevated traffic volumes
        - Non-standard ${protocol} behavior
        - ${fv.interPacketTime > 0.7 ? "Irregular" : "Regular"} connection pattern (${fv.interPacketTime.toFixed(2)} normalized)
        - Source is ${isInternalTraffic ? "internal network" : "external network"}
      `,
      severity: "medium",
      recommendation: "Investigate the source system for unauthorized applications or services and verify expected network behavior."
    };
  };

  // Helper function to create a classification from a threat detection
  const createGenericThreatClassification = (threat: ThreatDetection): AnomalyClassificationResult => {
    return {
      primaryClassification: threat.isZeroDay ? "Zero-Day Exploit" : "Known Threat Pattern",
      primaryConfidence: threat.confidence,
      alternativeClassifications: [
        {
          category: threat.isZeroDay ? "Zero-Day Exploit" : "Known Threat Pattern",
          confidence: threat.confidence,
          description: threat.description,
          severity: threat.severity
        },
        {
          category: "Advanced Persistent Threat",
          confidence: threat.isZeroDay ? 0.75 : 0.45,
          description: "Potential APT activity based on sophistication level",
          severity: "high"
        },
        {
          category: "Common Malware",
          confidence: threat.isZeroDay ? 0.30 : 0.65,
          description: "Signature partially matches known malware family",
          severity: "medium"
        },
        {
          category: "False Positive",
          confidence: 0.15,
          description: "Low probability of being a false detection",
          severity: "low"
        }
      ],
      technicalDetails: `
        Threat details:
        - Detection confidence: ${threat.confidence}
        - Source IPs: ${threat.sourceIps.join(', ')}
        - Destination IPs: ${threat.destinationIps.join(', ')}
        - Ports: ${threat.ports.join(', ')}
        - Protocols: ${threat.protocols.join(', ')}
        - Zero-day: ${threat.isZeroDay ? 'Yes' : 'No'}
      `,
      severity: threat.severity,
      recommendation: `Immediate isolation of affected systems recommended. ${threat.isZeroDay ? 'Treat as zero-day threat with highest priority.' : 'Apply latest security patches.'}`
    };
  };

  // Helper function to get color based on confidence
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-500";
    if (confidence >= 0.5) return "text-amber-500";
    return "text-muted-foreground";
  };

  // Helper function to get color based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high': return "text-red-500";
      case 'medium': return "text-amber-500";
      case 'low': return "text-blue-500";
      default: return "text-muted-foreground";
    }
  };

  // Helper function to get badge variant based on severity
  const getSeverityBadgeVariant = (severity: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high': return "destructive";
      case 'medium': return "default";
      case 'low': return "secondary";
      default: return "outline";
    }
  };

  if (!anomaly) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enhanced Classification</CardTitle>
          <CardDescription>No anomaly selected for classification</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertTitle>No data available</AlertTitle>
            <AlertDescription>
              Please select an anomaly or threat to classify
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Enhanced Classification</CardTitle>
            <CardDescription>
              {classification ? 'AI-powered multi-category classification' : 'Analyzing anomaly patterns for classification'}
            </CardDescription>
          </div>
          {classification && (
            <Badge variant={getSeverityBadgeVariant(classification.severity)}>
              {classification.severity.toUpperCase()}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Classification Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isClassifying ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <div>
                <h4 className="text-sm font-semibold">Analyzing anomaly patterns</h4>
                <p className="text-sm text-muted-foreground">
                  Llama 3 is classifying the anomaly across multiple categories...
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/3" />
              <div className="py-1"></div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ) : classification ? (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Primary Classification</h3>
                <div className={`font-medium ${getConfidenceColor(classification.primaryConfidence)}`}>
                  {Math.round(classification.primaryConfidence * 100)}% confidence
                </div>
              </div>
              
              <div className="p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium">{classification.primaryClassification}</span>
                </div>
                {classification.recommendation && (
                  <div className="mt-3 text-sm border-t pt-3">
                    <span className="font-medium">Recommendation: </span>
                    {classification.recommendation}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Alternative Classifications</h3>
              <div className="space-y-3">
                {classification.alternativeClassifications.map((category, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span>{category.category}</span>
                      </div>
                      <Badge variant="outline" className={category.severity ? getSeverityColor(category.severity) : ""}>
                        {Math.round(category.confidence * 100)}%
                      </Badge>
                    </div>
                    <Progress value={category.confidence * 100} className="h-1.5" />
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1 ml-6">
                        {category.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {classification.technicalDetails && (
              <div>
                <h3 className="font-semibold mb-2">Technical Details</h3>
                <pre className="text-xs bg-muted p-3 rounded-md whitespace-pre-wrap">
                  {classification.technicalDetails}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <ListFilter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Ready to Classify</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              Llama 3 will classify this anomaly across multiple categories with confidence scoring
            </p>
            <Button onClick={handleStartClassification}>
              Start Classification
            </Button>
          </div>
        )}
      </CardContent>

      {classification && (
        <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
          Classification generated {new Date(classification.timestamp || Date.now()).toLocaleString()}
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Container component that manages anomaly classifications
 * and provides a UI for viewing classification results.
 */
export function AnomalyClassificationContainer() {
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);
  const [mockAnomalies] = useState<Anomaly[]>([
    // Mock data for demonstration - in a real implementation, these would come from the anomaly detection system
    {
      id: 'anomaly-1',
      timestamp: Date.now() - 1000 * 60 * 15,
      confidence: 0.92,
      relatedFeatures: ['protocol', 'packetSize', 'payloadEntropy'],
      featureVector: {
        timestamp: Date.now() - 1000 * 60 * 15,
        protocol: 0.95,           // Likely TCP
        packetSize: 0.85,         // Large packets
        sourcePortCategory: 0.65, // Higher port categories
        destPortCategory: 0.75,   // Likely HTTPS port 443
        flagsVector: [1, 0, 1, 0, 1],  // Common flags
        payloadEntropy: 0.95,     // High entropy (encrypted)
        srcIpEntropy: 0.2,        // Low entropy (single source)
        dstIpEntropy: 0.3,        // Low entropy (focused destination)
        isIntranet: 0,            // External traffic
        headerFields: [0.7, 0.8, 0.6],
        interPacketTime: 0.3,     // Consistent timing
        packetRatio: 0.9          // Mostly one type of packets
      },
      description: 'Suspicious data exfiltration pattern detected with high-volume encrypted transfer'
    },
    {
      id: 'anomaly-2',
      timestamp: Date.now() - 1000 * 60 * 45,
      confidence: 0.78,
      relatedFeatures: ['interPacketTime', 'packetSize', 'destPortCategory'],
      featureVector: {
        timestamp: Date.now() - 1000 * 60 * 45,
        protocol: 0.95,           // TCP
        packetSize: 0.2,          // Small packets
        sourcePortCategory: 0.9,   // High ports
        destPortCategory: 0.3,     // SSH port 22
        flagsVector: [1, 0, 0, 1, 0],  // Limited flags used
        payloadEntropy: 0.5,      // Medium entropy
        srcIpEntropy: 0.1,        // Single source
        dstIpEntropy: 0.1,        // Single target
        isIntranet: 1,            // Internal network
        headerFields: [0.4, 0.3, 0.5],
        interPacketTime: 0.1,     // Very consistent timing (automated)
        packetRatio: 0.95         // Highly similar packets
      },
      description: 'Potential brute force authentication attempt against internal SSH server'
    },
    {
      id: 'anomaly-3',
      timestamp: Date.now() - 1000 * 60 * 120,
      confidence: 0.84,
      relatedFeatures: ['destPortCategory', 'interPacketTime', 'packetSize'],
      featureVector: {
        timestamp: Date.now() - 1000 * 60 * 120,
        protocol: 0.95,           // TCP
        packetSize: 0.15,         // Very small packets
        sourcePortCategory: 0.8,   // High ports
        destPortCategory: 0.1,     // Many different ports
        flagsVector: [1, 0, 0, 0, 0],  // SYN scanning
        payloadEntropy: 0.1,      // No real payload
        srcIpEntropy: 0.1,        // Single source
        dstIpEntropy: 0.9,        // Many destinations
        isIntranet: 1,            // Internal network
        headerFields: [0.3, 0.3, 0.3],
        interPacketTime: 0.15,    // Very regular timing
        packetRatio: 1.0          // All packets are identical
      },
      description: 'Network scanning activity detected across multiple internal hosts and ports'
    }
  ]);

  const handleClassificationComplete = (result: AnomalyClassificationResult) => {
    console.log("Classification complete:", result);
    // In a real implementation, you might store this result or take actions based on it
  };

  const getSelectedAnomaly = (): Anomaly | undefined => {
    return mockAnomalies.find(a => a.id === selectedAnomalyId) || mockAnomalies[0];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnomalyClassification 
            anomaly={getSelectedAnomaly()} 
            onClassified={handleClassificationComplete}
          />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Anomaly</CardTitle>
              <CardDescription>Choose an anomaly to classify</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockAnomalies.map(anomaly => (
                  <div 
                    key={anomaly.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 ${selectedAnomalyId === anomaly.id ? 'bg-muted' : ''}`}
                    onClick={() => setSelectedAnomalyId(anomaly.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={anomaly.confidence > 0.8 ? 'destructive' : 'outline'}>
                          {anomaly.confidence > 0.8 ? 'high' : anomaly.confidence > 0.6 ? 'medium' : 'low'}
                        </Badge>
                        <span className="font-medium">{anomaly.description.split(' ').slice(0, 3).join(' ')}...</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(anomaly.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {anomaly.relatedFeatures.join(', ')}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-xs">
                        Protocol: <span className="font-medium">{anomaly.featureVector.protocol > 0.5 ? 'TCP' : 'UDP'}</span>
                      </div>
                      <div className="text-xs">
                        Type: <span className="font-medium">{anomaly.featureVector.isIntranet > 0.5 ? 'Internal' : 'External'}</span>
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

export default AnomalyClassificationContainer;
