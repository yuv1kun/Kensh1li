/**
 * Response Recommendations Component
 * 
 * This component uses Llama 3 to generate AI-powered response recommendations
 * for detected security threats to help security teams respond quickly and effectively.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Shield, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  Terminal,
  FileText,
  ClipboardCheck,
  Clock,
  User,
  UserCog,
  Copy,
  Check
} from "lucide-react";
import { getSecurityAnalysisService } from '../../lib/ai/analysis/security-analysis-service';
import { ThreatDetection, ResponseAction } from '../../lib/neuromorphic/types';

interface ResponseRecommendationsProps {
  threat?: ThreatDetection;
  onRecommendationSelected?: (action: ResponseAction) => void;
}

/**
 * Component that generates AI-powered response recommendations for security threats
 */
export function ResponseRecommendations({
  threat,
  onRecommendationSelected
}: ResponseRecommendationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<ResponseAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate recommendations when a threat is selected
  useEffect(() => {
    if (threat) {
      generateRecommendations();
    } else {
      setRecommendations([]);
    }
  }, [threat]);

  // Generate recommendations using the AI service
  const generateRecommendations = async () => {
    if (!threat) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const securityService = getSecurityAnalysisService();
      
      // In a real implementation, we would use the security service to get recommendations
      // For now, we'll simulate this with mock data based on the threat
      setTimeout(() => {
        const mockRecommendations: ResponseAction[] = [
          {
            id: `action-${Date.now()}-1`,
            threatId: threat.id,
            action: 'monitor',
            target: threat.sourceIps.length > 0 ? threat.sourceIps[0] : 'unknown',
            parameters: {
              duration: '24h',
              alertThreshold: 'medium',
              captureTraffic: true
            },
            automatedExecutionAllowed: true,
            description: `Enhanced monitoring of traffic from ${threat.sourceIps.join(', ')} for the next 24 hours with packet capture enabled.`
          },
          {
            id: `action-${Date.now()}-2`,
            threatId: threat.id,
            action: threat.severity === 'critical' ? 'block' : 'alert',
            target: threat.sourceIps.length > 0 ? threat.sourceIps[0] : 'unknown',
            parameters: {
              duration: threat.severity === 'critical' ? '1h' : 'indefinite',
              notifyTeam: true,
              logEvidence: true
            },
            automatedExecutionAllowed: threat.severity !== 'critical',
            description: threat.severity === 'critical' 
              ? `Temporarily block traffic from ${threat.sourceIps.join(', ')} for 1 hour while investigating.` 
              : `Set up alerts for any further activity from ${threat.sourceIps.join(', ')}.`
          },
          {
            id: `action-${Date.now()}-3`,
            threatId: threat.id,
            action: 'analyze',
            target: 'traffic_pattern',
            parameters: {
              tool: 'packet_analyzer',
              focusOn: 'protocol_anomalies',
              depth: 'forensic'
            },
            automatedExecutionAllowed: true,
            description: `Perform deep packet analysis focusing on protocol anomalies related to ${threat.protocols.map(p => `protocol ${p}`).join(', ')}.`
          }
        ];
        
        // For critical threats, add an isolation recommendation
        if (threat.severity === 'critical' || threat.severity === 'high') {
          mockRecommendations.push({
            id: `action-${Date.now()}-4`,
            threatId: threat.id,
            action: 'isolate',
            target: threat.destinationIps.length > 0 ? threat.destinationIps[0] : 'affected_system',
            parameters: {
              method: 'network_isolation',
              allowList: ['security_team_subnet'],
              duration: '2h'
            },
            automatedExecutionAllowed: false,
            description: `Isolate ${threat.destinationIps.join(', ')} on the network to prevent lateral movement while maintaining security team access.`
          });
        }
        
        setRecommendations(mockRecommendations);
        if (mockRecommendations.length > 0) {
          setSelectedAction(mockRecommendations[0].id);
        }
        setIsLoading(false);
      }, 1200); // Simulate API delay
      
    } catch (err) {
      setError(`Failed to generate recommendations: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error("Recommendation generation failed:", err);
      setIsLoading(false);
    }
  };

  // Handle selecting a recommendation
  const handleSelectAction = (actionId: string) => {
    setSelectedAction(actionId);
    const action = recommendations.find(rec => rec.id === actionId);
    if (action && onRecommendationSelected) {
      onRecommendationSelected(action);
    }
  };

  // Handle copying text to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Get the selected action
  const selectedRecommendation = selectedAction 
    ? recommendations.find(rec => rec.id === selectedAction) 
    : null;

  // Get the action icon
  const getActionIcon = (action: ResponseAction['action']) => {
    switch (action) {
      case 'monitor': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'alert': return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'block': return <Shield className="h-5 w-5 text-red-500" />;
      case 'isolate': return <UserCog className="h-5 w-5 text-purple-500" />;
      case 'analyze': return <Terminal className="h-5 w-5 text-green-500" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  // Get action color
  const getActionColor = (action: ResponseAction['action']) => {
    switch (action) {
      case 'monitor': return 'bg-blue-500/10 text-blue-500 border-blue-500/50';
      case 'alert': return 'bg-amber-500/10 text-amber-500 border-amber-500/50';
      case 'block': return 'bg-red-500/10 text-red-500 border-red-500/50';
      case 'isolate': return 'bg-purple-500/10 text-purple-500 border-purple-500/50';
      case 'analyze': return 'bg-green-500/10 text-green-500 border-green-500/50';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/50';
    }
  };

  // Format parameters into a readable string
  const formatParameters = (params: Record<string, any>): string => {
    return Object.entries(params)
      .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value === true ? 'yes' : value === false ? 'no' : value}`)
      .join('\n');
  };

  if (!threat) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response Recommendations</CardTitle>
          <CardDescription>Select a threat to view AI-powered response recommendations</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Threat Selected</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Select a security threat to generate AI-powered response recommendations
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
              AI-Powered Response Recommendations
              <Badge variant={threat.severity === 'critical' ? 'destructive' : threat.severity === 'high' ? 'default' : 'secondary'} className="ml-2">
                {threat.severity.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>
              {isLoading 
                ? 'Generating response recommendations...' 
                : `Intelligent response options for threat: ${threat.description.substring(0, 60)}${threat.description.length > 60 ? '...' : ''}`}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateRecommendations}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
            {isLoading ? 'Generating...' : 'Regenerate'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex items-center gap-4">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <div>
              <h4 className="text-sm font-semibold">Generating Response Recommendations</h4>
              <p className="text-sm text-muted-foreground">
                Analyzing threat characteristics and generating optimal response strategies...
              </p>
            </div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recommendations sidebar */}
            <div>
              <h3 className="font-semibold mb-3">Available Actions</h3>
              <div className="space-y-2">
                {recommendations.map(rec => (
                  <div 
                    key={rec.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedAction === rec.id ? 'bg-muted border-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleSelectAction(rec.id)}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      {getActionIcon(rec.action)}
                      <span className="font-medium capitalize">{rec.action}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {rec.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main recommendation details */}
            <div className="lg:col-span-2">
              {selectedRecommendation ? (
                <div className="space-y-4">
                  <div className={`p-4 border rounded-md ${getActionColor(selectedRecommendation.action)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {getActionIcon(selectedRecommendation.action)}
                      <h3 className="font-semibold capitalize text-lg">
                        {selectedRecommendation.action} Action
                      </h3>
                      {selectedRecommendation.automatedExecutionAllowed && (
                        <Badge variant="secondary" className="ml-auto">
                          Auto-Executable
                        </Badge>
                      )}
                    </div>
                    <p>{selectedRecommendation.description}</p>
                  </div>
                  
                  <Tabs defaultValue="details">
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="details">
                        <ClipboardCheck className="h-4 w-4 mr-2" /> Details
                      </TabsTrigger>
                      <TabsTrigger value="commands">
                        <Terminal className="h-4 w-4 mr-2" /> Commands
                      </TabsTrigger>
                      <TabsTrigger value="playbook">
                        <FileText className="h-4 w-4 mr-2" /> Playbook
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details" className="space-y-4 pt-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Target</h4>
                        <div className="p-2 bg-muted rounded-md">
                          <code>{selectedRecommendation.target}</code>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Parameters</h4>
                        <div className="p-2 bg-muted rounded-md font-mono text-sm whitespace-pre">
                          {formatParameters(selectedRecommendation.parameters)}
                        </div>
                      </div>
                      
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertTitle>Response Timing</AlertTitle>
                        <AlertDescription>
                          {selectedRecommendation.action === 'block' || selectedRecommendation.action === 'isolate'
                            ? "Immediate action recommended to prevent further impact"
                            : "This action can be performed as part of standard incident response procedures"}
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                    
                    <TabsContent value="commands" className="space-y-4 pt-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold">Implementation Commands</h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-xs"
                            onClick={() => handleCopy(getExampleCommand(selectedRecommendation), 'cmd')}
                          >
                            {copied === 'cmd' ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                            {copied === 'cmd' ? 'Copied' : 'Copy'}
                          </Button>
                        </div>
                        <div className="p-3 bg-black text-gray-300 rounded-md font-mono text-sm overflow-x-auto">
                          {getExampleCommand(selectedRecommendation)}
                        </div>
                      </div>
                      
                      <Alert variant="default">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Execution Note</AlertTitle>
                        <AlertDescription>
                          {selectedRecommendation.automatedExecutionAllowed
                            ? "This command can be executed automatically by the system if configured to do so."
                            : "Manual review required before executing this command due to potential business impact."}
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                    
                    <TabsContent value="playbook" className="space-y-4 pt-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Response Playbook Steps</h4>
                        <ol className="space-y-3">
                          {getPlaybookSteps(selectedRecommendation).map((step, index) => (
                            <li key={index} className="flex gap-3 p-3 border rounded-md">
                              <span className="font-bold text-primary">{index + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {getRolesToNotify(selectedRecommendation).join(', ')}
                          </span>
                        </div>
                        <Button size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Export Playbook
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">
                      Modify
                    </Button>
                    <Button>
                      <Shield className="h-4 w-4 mr-2" />
                      Execute Response
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Response Action</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Choose a response action from the list to view detailed implementation steps
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2">Generating Recommendations</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
              Analyzing threat details to generate optimal response recommendations
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          AI-powered recommendations based on threat characteristics and security best practices
        </div>
        <Button variant="outline" size="sm" className="text-xs" onClick={generateRecommendations} disabled={isLoading}>
          <CheckCircle2 className="h-3 w-3 mr-1" /> Refresh Analysis
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper function to generate example commands based on the recommendation
function getExampleCommand(recommendation: ResponseAction): string {
  switch (recommendation.action) {
    case 'monitor':
      return `sudo tcpdump -i any host ${recommendation.target} -w capture_${new Date().toISOString().slice(0,10)}.pcap`;
    case 'block':
      return `iptables -A INPUT -s ${recommendation.target} -j DROP`;
    case 'alert':
      return `echo "alert tcp ${recommendation.target} any -> $HOME_NET any (msg:\\"Potential threat from ${recommendation.target}\\"; sid:1000001; rev:1;)" >> /etc/snort/rules/local.rules`;
    case 'isolate':
      return `# Network isolation for ${recommendation.target}\n# Via network controls:\nvlan-isolate --host ${recommendation.target} --allow-subnet 192.168.10.0/24 --duration 2h`;
    case 'analyze':
      return `# Deep packet analysis\npacket_analyzer --focus=${recommendation.parameters.focusOn} --target=${recommendation.target} --depth=${recommendation.parameters.depth} --output=analysis_report.json`;
    default:
      return `# Custom response action\n# See documentation for specific implementation details`;
  }
}

// Helper function to generate playbook steps
function getPlaybookSteps(recommendation: ResponseAction): string[] {
  const commonSteps = [
    "Document the initial threat detection details including timestamps, affected systems, and indicators",
    "Verify the threat detection is not a false positive by cross-referencing with other security tools"
  ];
  
  let actionSpecificSteps: string[] = [];
  
  switch (recommendation.action) {
    case 'monitor':
      actionSpecificSteps = [
        `Set up enhanced monitoring for ${recommendation.target} using network monitoring tools`,
        "Configure alerts for any suspicious activity matching the threat pattern",
        "Maintain monitoring for the specified duration and document any findings",
        "Analyze collected data for patterns that could indicate larger security issues"
      ];
      break;
    case 'block':
      actionSpecificSteps = [
        `Implement temporary blocking rules for traffic from ${recommendation.target}`,
        "Notify relevant stakeholders about the blocking action",
        "Monitor for any business impact resulting from the block",
        "Develop a plan for removing the block or transitioning to permanent controls"
      ];
      break;
    case 'alert':
      actionSpecificSteps = [
        `Configure alerting rules for activity from ${recommendation.target}`,
        "Set up notification channels for the security team",
        "Create escalation procedures for detected events",
        "Document alert patterns for future reference and training"
      ];
      break;
    case 'isolate':
      actionSpecificSteps = [
        `Isolate ${recommendation.target} on the network to prevent lateral movement`,
        "Establish secure channel for forensic investigation",
        "Perform forensic data collection while system is isolated",
        "Develop remediation plan before removing isolation"
      ];
      break;
    case 'analyze':
      actionSpecificSteps = [
        `Perform deep packet analysis focusing on ${recommendation.parameters.focusOn}`,
        "Extract indicators of compromise (IOCs) from the analysis",
        "Correlate findings with threat intelligence",
        "Document findings and update detection rules based on analysis"
      ];
      break;
    default:
      actionSpecificSteps = [
        "Implement the custom response action as specified",
        "Document the process and outcomes",
        "Evaluate effectiveness and adjust as needed"
      ];
  }
  
  const closingSteps = [
    "Document all actions taken, their timestamps, and responsible personnel",
    "Conduct a post-incident review to improve future response capabilities"
  ];
  
  return [...commonSteps, ...actionSpecificSteps, ...closingSteps];
}

// Helper function to determine which roles to notify
function getRolesToNotify(recommendation: ResponseAction): string[] {
  const alwaysNotify = ["Security Analyst"];
  
  switch (recommendation.action) {
    case 'block':
      return [...alwaysNotify, "Network Administrator", "Security Manager"];
    case 'isolate':
      return [...alwaysNotify, "IT Operations", "Security Manager", "Incident Response Team"];
    case 'analyze':
      return [...alwaysNotify, "Forensic Specialist", "Threat Hunter"];
    case 'monitor':
      return [...alwaysNotify, "SOC Analyst"];
    case 'alert':
      return [...alwaysNotify, "SOC Team"];
    default:
      return alwaysNotify;
  }
}

/**
 * Container component for Response Recommendations that manages mock data
 * and handles recommendation selection
 */
export function ResponseRecommendationsContainer() {
  // Mock threat for demonstration - in a real implementation, this would be selected by the user
  const [selectedThreat, setSelectedThreat] = useState<ThreatDetection | undefined>();
  const [mockThreats] = useState<ThreatDetection[]>([
    {
      id: 'threat-1',
      timestamp: Date.now() - 1000 * 60 * 30,
      severity: 'critical',
      confidence: 0.92,
      anomalies: ['anomaly-1', 'anomaly-3'],
      sourceIps: ['45.32.144.15', '45.32.144.16'],
      destinationIps: ['10.0.0.15', '10.0.0.23'],
      ports: [22, 3389],
      protocols: [6], // TCP
      description: 'Critical remote access attempt with potential credential compromise targeting multiple internal systems',
      recommendedAction: 'Block source IPs and reset affected credentials',
      isZeroDay: false
    },
    {
      id: 'threat-2',
      timestamp: Date.now() - 1000 * 60 * 120,
      severity: 'high',
      confidence: 0.87,
      anomalies: ['anomaly-2'],
      sourceIps: ['192.168.1.34'],
      destinationIps: ['192.168.1.25'],
      ports: [445, 139],
      protocols: [6], // TCP
      description: 'Lateral movement attempt using SMB protocol between internal systems',
      recommendedAction: 'Isolate source system and investigate for compromise',
      isZeroDay: false
    },
    {
      id: 'threat-3',
      timestamp: Date.now() - 1000 * 60 * 15,
      severity: 'medium',
      confidence: 0.78,
      anomalies: ['anomaly-4'],
      sourceIps: ['23.64.102.91'],
      destinationIps: ['10.0.0.50'],
      ports: [80, 443],
      protocols: [6], // TCP
      description: 'Unusual web traffic pattern potentially indicating data exfiltration attempt',
      recommendedAction: 'Monitor and analyze traffic for data leakage',
      isZeroDay: true
    }
  ]);

  // Handle recommendation selection
  const handleRecommendationSelected = (action: ResponseAction) => {
    console.log('Selected response action:', action);
    // In a real application, this might trigger further actions or update state
  };

  return (
    <div className="space-y-6">
      <Card className="border-muted-foreground/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Select a Threat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {mockThreats.map(threat => (
              <Button
                key={threat.id}
                variant={selectedThreat?.id === threat.id ? "default" : "outline"}
                className="justify-start h-auto py-2 px-3"
                onClick={() => setSelectedThreat(threat)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Badge 
                    variant={
                      threat.severity === 'critical' ? 'destructive' : 
                      threat.severity === 'high' ? 'default' : 
                      'secondary'
                    }
                    className="shrink-0"
                  >
                    {threat.severity}
                  </Badge>
                  <span className="truncate text-xs">
                    {threat.description.substring(0, 30)}...
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <ResponseRecommendations 
        threat={selectedThreat}
        onRecommendationSelected={handleRecommendationSelected}
      />
    </div>
  );
}

export default ResponseRecommendationsContainer;
