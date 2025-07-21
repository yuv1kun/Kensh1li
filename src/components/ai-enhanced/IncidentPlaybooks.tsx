/**
 * Incident Response Playbooks Component
 * 
 * This component uses Llama 3 to generate comprehensive incident response
 * playbooks for various security threats and scenarios.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Skeleton } from "../ui/skeleton";
import { 
  FileText, 
  FileCheck,
  Loader2,
  CheckCircle2,
  Clock,
  Users,
  Copy,
  Check,
  ClipboardList,
  ArrowUpRight,
  AlertCircle
} from "lucide-react";
import { getSecurityAnalysisService } from '../../lib/ai/analysis/security-analysis-service';
import { ThreatDetection } from '../../lib/neuromorphic/types';

// Basic types for the playbook component
interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  timeEstimate: string; // e.g. "5-10 minutes"
  assignedRole: string; // e.g. "Security Analyst"
  requiredTools: string[];
  verificationMethod: string;
}

interface PlaybookSection {
  id: string;
  title: string;
  description: string;
  steps: PlaybookStep[];
}

interface IncidentPlaybook {
  id: string;
  title: string;
  description: string;
  threatId?: string;
  threatSeverity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: number;
  sections: PlaybookSection[];
  assignedTeams: string[];
  estimatedTime: string;
  status: 'draft' | 'active' | 'archived';
}

interface IncidentPlaybooksProps {
  threat?: ThreatDetection;
}

/**
 * Core component for generating and displaying incident response playbooks
 */
export function IncidentPlaybooks({ threat }: IncidentPlaybooksProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [playbook, setPlaybook] = useState<IncidentPlaybook | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  
  // Generate a playbook based on the provided threat
  const generatePlaybook = async () => {
    if (!threat) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // In a real implementation, we would use the SecurityAnalysisService to generate the playbook
      // Here we'll simulate this with mock data
      setTimeout(() => {
        // Generate a playbook based on the threat details
        const mockPlaybook: IncidentPlaybook = {
          id: `playbook-${Date.now()}`,
          title: `${threat.severity.toUpperCase()} - ${getThreatType(threat)}`,
          description: `Incident response playbook for ${threat.description}`,
          threatId: threat.id,
          threatSeverity: threat.severity,
          createdAt: Date.now(),
          sections: [
            {
              id: 'section-1',
              title: 'Initial Response',
              description: 'Steps for the initial triage and containment phase',
              steps: [
                {
                  id: 'step-1-1',
                  title: 'Assess and Verify Threat',
                  description: 'Confirm the threat is valid by analyzing relevant logs and alerts. Determine if this is a false positive by checking for related events.',
                  timeEstimate: '15-30 minutes',
                  assignedRole: 'Security Analyst',
                  requiredTools: ['SIEM', 'Log Analyzer'],
                  verificationMethod: 'Document findings in incident tracking system'
                },
                {
                  id: 'step-1-2',
                  title: 'Initial Containment',
                  description: `${threat.severity === 'critical' || threat.severity === 'high' ? 'Isolate affected systems' : 'Monitor affected systems'} to prevent further spread of the threat.`,
                  timeEstimate: threat.severity === 'critical' ? '5-15 minutes' : '30-60 minutes',
                  assignedRole: threat.severity === 'critical' ? 'Incident Response Lead' : 'Security Analyst',
                  requiredTools: ['Network Controls', 'Firewall Management Console'],
                  verificationMethod: 'Confirm isolation and document actions taken'
                },
                {
                  id: 'step-1-3',
                  title: 'Notify Stakeholders',
                  description: `Inform appropriate team members and stakeholders about the incident according to ${threat.severity} severity protocols.`,
                  timeEstimate: '15 minutes',
                  assignedRole: 'Incident Response Lead',
                  requiredTools: ['Communication Platform', 'Contact List'],
                  verificationMethod: 'Record of notifications sent and acknowledgements received'
                }
              ]
            },
            {
              id: 'section-2',
              title: 'Investigation and Analysis',
              description: 'Steps to investigate the threat and analyze its impact',
              steps: [
                {
                  id: 'step-2-1',
                  title: 'Collect Evidence',
                  description: `Gather logs, memory dumps, and other relevant data from affected systems. Focus on ${threat.sourceIps.join(', ')} as potential sources.`,
                  timeEstimate: '1-2 hours',
                  assignedRole: 'Forensic Analyst',
                  requiredTools: ['Forensic Tools', 'Data Collection Scripts'],
                  verificationMethod: 'Evidence properly preserved with chain of custody'
                },
                {
                  id: 'step-2-2',
                  title: 'Identify Indicators of Compromise (IoCs)',
                  description: 'Extract and document IoCs including IP addresses, file hashes, and unusual process activities.',
                  timeEstimate: '45-60 minutes',
                  assignedRole: 'Security Analyst',
                  requiredTools: ['Threat Intelligence Platform', 'IoC Extractor'],
                  verificationMethod: 'IoC list created and validated'
                },
                {
                  id: 'step-2-3',
                  title: 'Determine Scope and Impact',
                  description: 'Assess the extent of the compromise and its potential impact on operations, data, and systems.',
                  timeEstimate: '2-3 hours',
                  assignedRole: 'Incident Response Team',
                  requiredTools: ['Asset Management System', 'Impact Assessment Framework'],
                  verificationMethod: 'Documented scope and impact analysis'
                }
              ]
            },
            {
              id: 'section-3',
              title: 'Remediation',
              description: 'Steps to contain, eradicate, and recover from the threat',
              steps: [
                {
                  id: 'step-3-1',
                  title: 'Develop Remediation Plan',
                  description: 'Create a detailed plan to remove the threat and restore systems to normal operation.',
                  timeEstimate: '1 hour',
                  assignedRole: 'Incident Response Lead',
                  requiredTools: ['Remediation Template', 'Planning Tools'],
                  verificationMethod: 'Approved remediation plan document'
                },
                {
                  id: 'step-3-2',
                  title: 'Execute Remediation Actions',
                  description: `${getRemediationActions(threat)}`,
                  timeEstimate: '2-8 hours',
                  assignedRole: 'System Administrators and Security Team',
                  requiredTools: ['System Management Tools', 'Security Software'],
                  verificationMethod: 'All remediation actions completed and verified'
                },
                {
                  id: 'step-3-3',
                  title: 'Verify Threat Removal',
                  description: 'Confirm that all traces of the threat have been removed and systems are secure.',
                  timeEstimate: '1-2 hours',
                  assignedRole: 'Security Analyst',
                  requiredTools: ['Vulnerability Scanner', 'Security Testing Tools'],
                  verificationMethod: 'Clean scan results and security verification report'
                }
              ]
            }
          ],
          assignedTeams: getThreatTeams(threat),
          estimatedTime: getEstimatedTime(threat),
          status: 'draft'
        };
        
        setPlaybook(mockPlaybook);
        setIsGenerating(false);
      }, 1500);
      
    } catch (err) {
      setError(`Failed to generate playbook: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsGenerating(false);
    }
  };

  // Handle copy to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Helper function to determine the type of threat
  const getThreatType = (threat: ThreatDetection): string => {
    if (threat.description.toLowerCase().includes('malware')) {
      return 'Malware Incident';
    } else if (threat.description.toLowerCase().includes('access') || threat.sourceIps.length > 0) {
      return 'Unauthorized Access';
    } else if (threat.description.toLowerCase().includes('data') || threat.description.toLowerCase().includes('exfil')) {
      return 'Data Breach';
    } else if (threat.isZeroDay) {
      return 'Zero-Day Exploit';
    } else {
      return 'Security Incident';
    }
  };

  // Helper function to get appropriate remediation actions based on threat
  const getRemediationActions = (threat: ThreatDetection): string => {
    const actions = [];
    
    if (threat.sourceIps.length > 0) {
      actions.push(`Block malicious IPs: ${threat.sourceIps.join(', ')}`);
    }
    
    if (threat.severity === 'critical' || threat.severity === 'high') {
      actions.push('Patch vulnerable systems');
      actions.push('Reset compromised credentials');
    }
    
    actions.push('Remove malicious artifacts');
    actions.push('Update security rules to prevent similar incidents');
    
    return actions.join('. ');
  };

  // Helper function to estimate time based on threat severity
  const getEstimatedTime = (threat: ThreatDetection): string => {
    switch (threat.severity) {
      case 'critical': return '4-8 hours';
      case 'high': return '6-12 hours';
      case 'medium': return '8-24 hours';
      case 'low': return '24-48 hours';
      default: return '12-24 hours';
    }
  };

  // Helper function to determine which teams should be involved
  const getThreatTeams = (threat: ThreatDetection): string[] => {
    const teams = ['Security Operations'];
    
    if (threat.severity === 'critical' || threat.severity === 'high') {
      teams.push('Incident Response');
      teams.push('Executive Leadership');
    }
    
    if (threat.description.toLowerCase().includes('data') || threat.description.toLowerCase().includes('breach')) {
      teams.push('Legal & Compliance');
      teams.push('Data Privacy');
    }
    
    if (threat.isZeroDay) {
      teams.push('Threat Research');
    }
    
    return teams;
  };

  if (!threat) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Incident Response Playbooks</CardTitle>
          <CardDescription>Select a threat to generate an incident response playbook</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Threat Selected</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Select a security threat to generate an AI-powered incident response playbook
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
              Incident Response Playbook
              <Badge variant={threat.severity === 'critical' ? 'destructive' : threat.severity === 'high' ? 'default' : 'secondary'} className="ml-2">
                {threat.severity.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>
              {isGenerating 
                ? 'Generating incident response playbook...' 
                : playbook 
                  ? `Playbook for ${playbook.title}` 
                  : `Generate a comprehensive response plan for ${threat.description.substring(0, 60)}${threat.description.length > 60 ? '...' : ''}`}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generatePlaybook}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            {isGenerating ? 'Generating...' : playbook ? 'Regenerate' : 'Generate Playbook'}
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
        
        {isGenerating ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <div>
                <h4 className="text-sm font-semibold">Generating Incident Response Playbook</h4>
                <p className="text-sm text-muted-foreground">
                  Creating detailed response procedures based on threat characteristics...
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        ) : playbook ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">{playbook.title}</h2>
                <p className="text-muted-foreground">{playbook.description}</p>
              </div>
              
              <div className="flex gap-2 flex-wrap md:flex-nowrap">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {playbook.estimatedTime}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {playbook.assignedTeams.length} teams
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ClipboardList className="h-3 w-3" /> {getTotalSteps(playbook)} steps
                </Badge>
              </div>
            </div>
            
            {/* Playbook content tabs */}
            <Tabs defaultValue="sections">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sections">Sections & Steps</TabsTrigger>
                <TabsTrigger value="teams">Team Responsibilities</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              
              {/* Playbook sections and steps */}
              <TabsContent value="sections">
                <div className="space-y-6 py-4">
                  {playbook.sections.map((section) => (
                    <Card key={section.id} className="border border-muted">
                      <CardHeader className="bg-muted/50">
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {section.steps.map((step, index) => (
                            <div key={step.id} className="border rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium shrink-0">
                                  {index + 1}
                                </div>
                                <div className="space-y-2 w-full">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-base">{step.title}</h4>
                                    <Badge variant="outline" className="ml-auto">
                                      {step.timeEstimate}
                                    </Badge>
                                  </div>
                                  <p className="text-sm">{step.description}</p>
                                  <div className="flex flex-wrap gap-2 pt-2">
                                    <div className="text-xs text-muted-foreground border px-2 py-1 rounded-md">
                                      Role: {step.assignedRole}
                                    </div>
                                    <div className="text-xs text-muted-foreground border px-2 py-1 rounded-md">
                                      Tools: {step.requiredTools.join(', ')}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              {/* Team responsibilities tab */}
              <TabsContent value="teams">
                <div className="space-y-4 py-4">
                  {playbook.assignedTeams.map(team => (
                    <Card key={team} className="border border-muted">
                      <CardHeader>
                        <CardTitle className="text-base">{team}</CardTitle>
                        <CardDescription>Assigned responsibilities</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {getTeamResponsibilities(playbook, team).map((resp, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                              {resp}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              {/* Timeline tab - simplified for the basic version */}
              <TabsContent value="timeline">
                <div className="space-y-4 py-4">
                  <div className="relative">
                    {/* Simplified timeline for the basic version */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted"></div>
                    
                    {playbook.sections.map((section, sectionIndex) => (
                      <div key={section.id} className="ml-6 mb-8 relative">
                        <div className="absolute -left-7 mt-1.5 w-3 h-3 rounded-full bg-primary"></div>
                        <h4 className="font-medium mb-2">{section.title}</h4>
                        
                        <div className="space-y-4">
                          {section.steps.map((step, stepIndex) => (
                            <div key={step.id} className="ml-4 relative">
                              <div className="absolute -left-6 mt-1.5 w-2 h-2 rounded-full bg-muted-foreground"></div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{step.title}</span>
                                <span className="text-xs text-muted-foreground">{step.timeEstimate}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{step.assignedRole}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Generate Playbook</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
              Create a comprehensive incident response playbook for the selected threat
            </p>
            <Button onClick={generatePlaybook}>
              Generate Incident Response Playbook
            </Button>
          </div>
        )}
      </CardContent>
      
      {playbook && (
        <CardFooter className="border-t pt-4 flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Created {new Date(playbook.createdAt).toLocaleString()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => handleCopy(JSON.stringify(playbook, null, 2), 'playbook')}>
              {copied === 'playbook' ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              {copied === 'playbook' ? 'Copied' : 'Export'}
            </Button>
            <Button variant="default" size="sm" className="text-xs">
              <ArrowUpRight className="h-3 w-3 mr-1" /> Share Playbook
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

// Helper function to count total steps in a playbook
function getTotalSteps(playbook: IncidentPlaybook): number {
  return playbook.sections.reduce((total, section) => total + section.steps.length, 0);
}

// Helper function to get team responsibilities
function getTeamResponsibilities(playbook: IncidentPlaybook, team: string): string[] {
  const responsibilities: string[] = [];
  
  // Basic responsibilities based on team name
  switch (team) {
    case 'Security Operations':
      responsibilities.push('Monitor security alerts and events during the incident');
      responsibilities.push('Implement security controls and countermeasures');
      responsibilities.push('Verify threat containment and eradication');
      break;
    case 'Incident Response':
      responsibilities.push('Coordinate the overall incident response process');
      responsibilities.push('Lead the investigation and evidence collection');
      responsibilities.push('Develop and execute the remediation plan');
      break;
    case 'Executive Leadership':
      responsibilities.push('Make critical business decisions related to the incident');
      responsibilities.push('Approve resources required for incident response');
      responsibilities.push('Communicate with board members and key stakeholders');
      break;
    case 'Legal & Compliance':
      responsibilities.push('Assess legal and regulatory reporting requirements');
      responsibilities.push('Guide the organization on compliance obligations');
      responsibilities.push('Prepare necessary legal documentation');
      break;
    case 'Data Privacy':
      responsibilities.push('Assess potential data exposure and privacy impacts');
      responsibilities.push('Guide on data subject notification requirements');
      responsibilities.push('Document data privacy aspects of the incident');
      break;
    case 'Threat Research':
      responsibilities.push('Analyze the technical aspects of the threat');
      responsibilities.push('Research similar threats and attack patterns');
      responsibilities.push('Develop detection strategies for related threats');
      break;
    default:
      responsibilities.push('Support the incident response process as needed');
      responsibilities.push('Follow direction from the incident response lead');
  }
  
  return responsibilities;
}

/**
 * Container component for Incident Playbooks that manages mock data
 */
export function IncidentPlaybooksContainer() {
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

      <IncidentPlaybooks threat={selectedThreat} />
    </div>
  );
}

export default IncidentPlaybooksContainer;
