/**
 * Security Briefings Component
 * 
 * This component uses Llama 3 to generate executive security briefings that 
 * summarize threat intelligence, incidents, and trends for leadership.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";
import { 
  FileText, 
  BarChart,
  PieChart,
  Loader2,
  CheckCircle2,
  Clock,
  Users,
  Copy,
  Check,
  AlertCircle,
  Briefcase,
  TrendingUp,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  Download
} from "lucide-react";
import { getSecurityAnalysisService } from '../../lib/ai/analysis/security-analysis-service';
import { ThreatDetection } from '../../lib/neuromorphic/types';

// Basic types for the security briefing component
interface SecurityMetric {
  id: string;
  name: string;
  value: number | string;
  trend: 'up' | 'down' | 'neutral';
  changePercent?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityIncident {
  id: string;
  title: string;
  summary: string;
  date: number; // timestamp
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'ongoing' | 'contained' | 'resolved';
  affectedSystems: string[];
  businessImpact?: string;
}

interface RecommendationPoint {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

interface SecurityBriefing {
  id: string;
  title: string;
  generatedAt: number;
  period: string; // e.g., "Last 7 days", "June 2025"
  executiveSummary: string;
  metrics: SecurityMetric[];
  topIncidents: SecurityIncident[];
  trendAnalysis: string;
  recommendations: RecommendationPoint[];
}

interface SecurityBriefingsProps {
  timeframe?: 'daily' | 'weekly' | 'monthly';
  includedSeverity?: ('low' | 'medium' | 'high' | 'critical')[];
}

/**
 * Component that generates executive security briefings using AI
 */
export function SecurityBriefings({ 
  timeframe = 'weekly',
  includedSeverity = ['medium', 'high', 'critical']
}: SecurityBriefingsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefing, setBriefing] = useState<SecurityBriefing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  
  // Generate a security briefing
  const generateBriefing = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // In a real implementation, we would use the SecurityAnalysisService to generate the briefing
      // Here we'll simulate this with mock data
      setTimeout(() => {
        // Generate a briefing based on the specified timeframe
        const mockBriefing: SecurityBriefing = {
          id: `briefing-${Date.now()}`,
          title: `Executive Security Briefing - ${getPeriodTitle(timeframe)}`,
          generatedAt: Date.now(),
          period: getPeriodTitle(timeframe),
          executiveSummary: getExecutiveSummary(timeframe),
          metrics: [
            {
              id: 'metric-1',
              name: 'Security Incidents',
              value: timeframe === 'daily' ? 4 : timeframe === 'weekly' ? 17 : 42,
              trend: 'down',
              changePercent: 12,
              severity: 'medium'
            },
            {
              id: 'metric-2',
              name: 'Critical Vulnerabilities',
              value: timeframe === 'daily' ? 1 : timeframe === 'weekly' ? 3 : 8,
              trend: 'up',
              changePercent: 33,
              severity: 'high'
            },
            {
              id: 'metric-3',
              name: 'Mean Time to Detect',
              value: timeframe === 'daily' ? '3h 12m' : timeframe === 'weekly' ? '4h 32m' : '4h 18m',
              trend: 'down',
              changePercent: 8,
              severity: 'low'
            },
            {
              id: 'metric-4',
              name: 'Mean Time to Respond',
              value: timeframe === 'daily' ? '6h 24m' : timeframe === 'weekly' ? '7h 15m' : '7h 52m',
              trend: 'neutral',
              changePercent: 2,
              severity: 'medium'
            }
          ],
          topIncidents: getTopIncidents(timeframe),
          trendAnalysis: getTrendAnalysis(timeframe),
          recommendations: [
            {
              id: 'rec-1',
              title: 'Enhance Network Segmentation',
              description: 'Given the recent lateral movement attempts, we recommend improving network segmentation to limit the potential impact of compromised systems.',
              priority: 'high'
            },
            {
              id: 'rec-2',
              title: 'Conduct Phishing Awareness Training',
              description: 'With an increase in phishing attempts targeting executives, a focused security awareness campaign is recommended for all leadership staff.',
              priority: 'medium'
            },
            {
              id: 'rec-3',
              title: 'Update Incident Response Plan',
              description: 'Current incident response timelines exceed industry benchmarks. We recommend revisiting the IR process to identify optimization opportunities.',
              priority: 'high'
            },
          ]
        };
        
        setBriefing(mockBriefing);
        setIsGenerating(false);
      }, 1500);
      
    } catch (err) {
      setError(`Failed to generate briefing: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsGenerating(false);
    }
  };

  // Handle copy to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Helper function to get period title based on timeframe
  const getPeriodTitle = (timeframe: 'daily' | 'weekly' | 'monthly'): string => {
    const now = new Date();
    switch (timeframe) {
      case 'daily':
        return `${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
      case 'weekly':
        return `Week of ${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'monthly':
        return `${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      default:
        return 'Custom Period';
    }
  };

  // Helper function to get executive summary based on timeframe
  const getExecutiveSummary = (timeframe: 'daily' | 'weekly' | 'monthly'): string => {
    switch (timeframe) {
      case 'daily':
        return 'Today saw a 12% decrease in security incidents compared to yesterday, with one critical vulnerability identified in our cloud infrastructure. The security team has contained all reported incidents, with no significant business impact. Enhanced monitoring has been implemented for the critical vulnerability until patching is complete.';
      case 'weekly':
        return 'This week recorded 17 security incidents, down 12% from last week, with 3 critical vulnerabilities discovered. Notable incidents included a potential data exfiltration attempt that was successfully contained and a series of reconnaissance activities from IP ranges associated with known threat actors. All critical systems remain secure, though some non-critical services experienced brief disruptions during remediation activities.';
      case 'monthly':
        return 'June 2025 security overview indicates a stabilizing threat landscape with 42 total incidents (down 8% from May) and 8 critical vulnerabilities addressed. Mean time to detect improved by 8%, though response times remain consistent with previous periods. Two significant campaigns were observed: (1) a targeted phishing operation affecting executive staff, and (2) repeated probing of cloud infrastructure. Business impact has been minimal due to swift containment actions. Key focus areas for July include improving network segmentation and enhancing executive-level security awareness.';
      default:
        return 'Security overview for the selected period';
    }
  };

  // Helper function to get top incidents based on timeframe
  const getTopIncidents = (timeframe: 'daily' | 'weekly' | 'monthly'): SecurityIncident[] => {
    const baseIncidents = [
      {
        id: 'incident-1',
        title: 'Potential Data Exfiltration Attempt',
        summary: 'Unusual outbound traffic patterns detected from finance department workstations to unrecognized external endpoints. Investigation revealed potential data exfiltration attempt targeting financial records.',
        date: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
        severity: 'high',
        status: 'contained',
        affectedSystems: ['Finance Workstations', 'File Server'],
        businessImpact: 'No confirmed data loss, temporary disruption to finance department operations during investigation.'
      } as SecurityIncident,
      {
        id: 'incident-2',
        title: 'Unauthorized Access Attempt',
        summary: 'Multiple failed login attempts detected against administrative accounts from external IP addresses. Pattern suggests credential stuffing attack targeting privileged users.',
        date: Date.now() - 1000 * 60 * 60 * 36, // 36 hours ago
        severity: 'medium',
        status: 'resolved',
        affectedSystems: ['Identity Provider', 'Administrative Portal'],
        businessImpact: 'No successful access achieved, no business impact.'
      } as SecurityIncident,
      {
        id: 'incident-3',
        title: 'Cloud Infrastructure Vulnerability',
        summary: 'Critical vulnerability identified in container orchestration platform allowing potential privilege escalation. Vulnerability affects production Kubernetes clusters.',
        date: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
        severity: 'critical',
        status: 'ongoing',
        affectedSystems: ['Production Kubernetes', 'Container Registry'],
        businessImpact: 'No exploitation detected, patch deployment in progress with minimal service disruption expected.'
      } as SecurityIncident,
    ];
    
    // For monthly, add more historical incidents
    if (timeframe === 'monthly') {
      baseIncidents.push(
        {
          id: 'incident-4',
          title: 'Executive Phishing Campaign',
          summary: 'Sophisticated phishing campaign targeting C-level executives with tailored emails impersonating board members. One executive interaction recorded but no credential compromise occurred.',
          date: Date.now() - 1000 * 60 * 60 * 24 * 12, // 12 days ago
          severity: 'high',
          status: 'resolved',
          affectedSystems: ['Email Security', 'Executive Workstations'],
          businessImpact: 'No successful compromise, increased awareness and monitoring implemented.'
        } as SecurityIncident,
        {
          id: 'incident-5',
          title: 'Supply Chain Software Compromise',
          summary: 'Third-party code library used in development identified as compromised. Audit confirmed the compromised version was not incorporated into production systems.',
          date: Date.now() - 1000 * 60 * 60 * 24 * 18, // 18 days ago
          severity: 'medium',
          status: 'resolved',
          affectedSystems: ['Development Environment'],
          businessImpact: 'No production impact, development delayed by 2 days for package verification.'
        } as SecurityIncident
      );
    }
    
    // For daily, only return the most recent
    if (timeframe === 'daily') {
      return baseIncidents.slice(0, 1);
    }
    
    return baseIncidents;
  };

  // Helper function to get trend analysis based on timeframe
  const getTrendAnalysis = (timeframe: 'daily' | 'weekly' | 'monthly'): string => {
    switch (timeframe) {
      case 'daily':
        return 'Today\'s security landscape shows a notable shift toward more targeted reconnaissance activities compared to previous days\' opportunistic scanning. Credential-based attacks continue to be the predominant vector, consistent with the past week\'s patterns. The critical vulnerability discovered today fits the profile of recent cloud infrastructure exploits trending in the threat intelligence community.';
      case 'weekly':
        return 'This week\'s security data reveals three significant trends: (1) A 27% increase in reconnaissance activities targeting our cloud infrastructure compared to the previous four weeks, (2) A shift from general credential stuffing to more targeted spear-phishing attempts directed at finance and executive staff, and (3) Decreased exploitation attempts against previously patched vulnerabilities, suggesting adversaries are updating their targeting strategies. These patterns align with industry observations of increased sophistication in financially-motivated threat actors.';
      case 'monthly':
        return 'The June 2025 threat landscape demonstrates an evolution in adversary tactics compared to Q1 2025. Key trends include: (1) A sustained pivot toward social engineering as perimeter security measures prove effective, with a 32% increase in targeted phishing campaigns, (2) More sophisticated evasion techniques being employed to avoid detection, increasing mean dwell time by 18% for successful compromises, (3) Increased focus on cloud infrastructure and supply chain vectors over traditional network entry points, and (4) Heightened activity from threat actors associated with two prominent ransomware groups, though no successful ransomware deployments occurred. These trends suggest a need to prioritize identity protection, cloud security architecture reviews, and supply chain risk management in the coming quarter.';
      default:
        return 'Analysis of security trends for the selected period';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              Executive Security Briefing
              <Badge variant="outline" className="ml-2">
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </Badge>
            </CardTitle>
            <CardDescription>
              {isGenerating 
                ? 'Generating executive security briefing...' 
                : briefing 
                  ? `Security overview for ${briefing.period}` 
                  : `Generate a comprehensive security briefing for executive leadership`}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateBriefing}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            {isGenerating ? 'Generating...' : briefing ? 'Regenerate' : 'Generate Briefing'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
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
                <h4 className="text-sm font-semibold">Generating Executive Security Briefing</h4>
                <p className="text-sm text-muted-foreground">
                  Analyzing security incidents and trends for executive presentation...
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        ) : briefing ? (
          <div className="space-y-8">
            {/* Executive Summary */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" /> Executive Summary
              </h2>
              <div className="p-4 border rounded-md bg-muted/20">
                <p className="text-sm">{briefing.executiveSummary}</p>
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" /> Key Security Metrics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {briefing.metrics.map(metric => (
                  <Card key={metric.id} className={`border ${
                    metric.severity === 'critical' ? 'border-red-500/50' :
                    metric.severity === 'high' ? 'border-orange-500/50' :
                    metric.severity === 'medium' ? 'border-yellow-500/50' :
                    'border-green-500/50'
                  }`}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                        {metric.trend === 'up' ? (
                          <Badge variant={metric.severity === 'critical' || metric.severity === 'high' ? "destructive" : "outline"} className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {metric.changePercent}%
                          </Badge>
                        ) : metric.trend === 'down' ? (
                          <Badge variant={metric.severity === 'critical' || metric.severity === 'high' ? "outline" : "secondary"} className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 transform rotate-180" />
                            {metric.changePercent}%
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1">
                            —
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold">{metric.value}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Top Incidents */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" /> Top Security Incidents
              </h2>
              <div className="space-y-4">
                {briefing.topIncidents.map(incident => (
                  <Card key={incident.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {incident.title}
                            <Badge variant={
                              incident.severity === 'critical' ? "destructive" :
                              incident.severity === 'high' ? "default" :
                              "secondary"
                            }>
                              {incident.severity}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {new Date(incident.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </CardDescription>
                        </div>
                        <Badge variant={
                          incident.status === 'ongoing' ? "outline" :
                          incident.status === 'contained' ? "secondary" :
                          "default"
                        }>
                          {incident.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 space-y-2">
                      <p className="text-sm">{incident.summary}</p>
                      <div className="flex flex-wrap gap-1 pt-2">
                        {incident.affectedSystems.map(system => (
                          <Badge key={system} variant="outline" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                      </div>
                      {incident.businessImpact && (
                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            <span>Business Impact:</span> {incident.businessImpact}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Trend Analysis */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Trend Analysis
              </h2>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm">{briefing.trendAnalysis}</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Recommendations */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" /> Key Recommendations
              </h2>
              <div className="space-y-3">
                {briefing.recommendations.map(rec => (
                  <Card key={rec.id}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className={`w-2 self-stretch rounded-full ${
                        rec.priority === 'high' ? 'bg-red-500' :
                        rec.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                      <div className="space-y-1">
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Generate Executive Briefing</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
              Create a comprehensive security briefing for executive leadership
            </p>
            <Button onClick={generateBriefing}>
              Generate Executive Security Briefing
            </Button>
          </div>
        )}
      </CardContent>
      
      {briefing && (
        <CardFooter className="border-t pt-4 flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Generated {new Date(briefing.generatedAt).toLocaleString()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => handleCopy(briefing.executiveSummary, 'summary')}>
              {copied === 'summary' ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              {copied === 'summary' ? 'Copied' : 'Copy Summary'}
            </Button>
            <Button variant="default" size="sm" className="text-xs">
              <Download className="h-3 w-3 mr-1" /> Export Report
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Container component for Security Briefings that provides timeframe controls
 */
export function SecurityBriefingsContainer() {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Tabs defaultValue="weekly" onValueChange={(value) => setTimeframe(value as 'daily' | 'weekly' | 'monthly')}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <SecurityBriefings timeframe={timeframe} />
    </div>
  );
}

export default SecurityBriefingsContainer;
