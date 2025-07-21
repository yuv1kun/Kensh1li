/**
 * AI-Powered Security Analysis Service
 * 
 * This service integrates Ollama Llama 3 with the neuromorphic anomaly detection system
 * to provide advanced AI capabilities for security analysis, including:
 * - Anomaly analysis and context enrichment
 * - Root cause investigation
 * - Threat intelligence correlation
 * - Response recommendation generation
 */

import { getOllamaService, OllamaService } from '../ollama-service';
import { Anomaly, ThreatDetection, ResponseAction, FeatureVector } from '../../neuromorphic/types';
import { nanoid } from '../../neuromorphic/mock-dependencies';

// Constants for system prompts
const SECURITY_SYSTEM_PROMPT = `You are KenshiBrain, an advanced AI security analyst specializing in network security and threat intelligence.
Your task is to analyze network anomalies, identify potential threats, and provide detailed security insights.
Focus on being precise, technical, and actionable in your analysis. Provide severity assessments and clear recommendations.`;

// Types specific to the AI analysis service
export interface AnomalyAnalysisResult {
  anomalyId: string;
  summary: string;
  rootCause: string;
  confidence: number;
  technicalDetails: string;
  recommendedActions: string[];
  relatedThreats: string[];
  possibleImpact: string;
  isZeroDay: boolean;
}

export interface ThreatIntelligenceResult {
  threatId: string;
  threatName: string | null;
  description: string;
  technicalDetails: string;
  indicators: string[];
  attackPatterns: string[];
  mitigationSteps: string[];
  externalReferences: string[];
}

export interface RootCauseAnalysisResult {
  rootCause: string;
  confidence: number;
  affectedSystems: string[];
  vulnerabilities: string[];
  exploitMethods: string[];
}

export interface SecurityBriefing {
  id: string;
  timestamp: number;
  title: string;
  summary: string;
  details: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  affectedSystems: string[];
  recommendedActions: string[];
}

export interface PlaybookStep {
  stepNumber: number;
  title: string;
  description: string;
  commands?: string[];
  expectedOutcome: string;
  verificationMethod: string;
}

export interface ResponsePlaybook {
  id: string;
  title: string;
  threatType: string;
  severity: string;
  description: string;
  prerequisites: string[];
  steps: PlaybookStep[];
  postIncidentActions: string[];
}

/**
 * Service for AI-powered security analysis using Llama 3
 */
export class SecurityAnalysisService {
  private ollamaService: OllamaService;
  private defaultModel: string;
  
  constructor(ollamaService?: OllamaService, defaultModel: string = 'llama3') {
    this.ollamaService = ollamaService || getOllamaService();
    this.defaultModel = defaultModel;
  }
  
  /**
   * Analyze an anomaly using Llama 3 for enhanced context and understanding
   */
  async analyzeAnomaly(anomaly: Anomaly): Promise<AnomalyAnalysisResult> {
    // Build a detailed prompt for the AI to analyze the anomaly
    const featureVector = anomaly.featureVector;
    const prompt = this.buildAnomalyAnalysisPrompt(anomaly, featureVector);
    
    try {
      const response = await this.ollamaService.generate({
        model: this.defaultModel,
        prompt,
        system: SECURITY_SYSTEM_PROMPT,
        options: {
          temperature: 0.3, // Lower temperature for more factual responses
        }
      });
      
      return this.parseAnomalyAnalysisResponse(anomaly.id, response.response);
    } catch (error) {
      console.error('Error analyzing anomaly with AI:', error);
      // Return a fallback analysis
      return this.createFallbackAnomalyAnalysis(anomaly);
    }
  }

  /**
   * Generate a security briefing based on recent threats and anomalies
   */
  async generateSecurityBriefing(
    recentThreats: ThreatDetection[],
    recentAnomalies: Anomaly[]
  ): Promise<SecurityBriefing> {
    const prompt = this.buildSecurityBriefingPrompt(recentThreats, recentAnomalies);
    
    try {
      const response = await this.ollamaService.generate({
        model: this.defaultModel,
        prompt,
        system: SECURITY_SYSTEM_PROMPT,
        options: {
          temperature: 0.4,
        }
      });
      
      // Parse the generated briefing
      return this.parseSecurityBriefing(response.response);
    } catch (error) {
      console.error('Error generating security briefing with AI:', error);
      // Return a fallback briefing
      return this.createFallbackSecurityBriefing(recentThreats, recentAnomalies);
    }
  }
  
  /**
   * Perform root cause analysis on an anomaly or threat
   */
  async performRootCauseAnalysis(
    entity: Anomaly | ThreatDetection,
    relatedEntities: Array<Anomaly | ThreatDetection> = []
  ): Promise<RootCauseAnalysisResult> {
    const prompt = this.buildRootCauseAnalysisPrompt(entity, relatedEntities);
    
    try {
      const response = await this.ollamaService.generate({
        model: this.defaultModel,
        prompt,
        system: SECURITY_SYSTEM_PROMPT,
        options: {
          temperature: 0.2, // Very low temperature for factual analysis
        }
      });
      
      return this.parseRootCauseAnalysisResponse(response.response);
    } catch (error) {
      console.error('Error performing root cause analysis with AI:', error);
      // Return a fallback analysis
      return this.createFallbackRootCauseAnalysis();
    }
  }
  
  /**
   * Generate a response playbook for a specific threat
   */
  async generateResponsePlaybook(threat: ThreatDetection): Promise<ResponsePlaybook> {
    const prompt = this.buildResponsePlaybookPrompt(threat);
    
    try {
      const response = await this.ollamaService.generate({
        model: this.defaultModel,
        prompt,
        system: SECURITY_SYSTEM_PROMPT,
        options: {
          temperature: 0.4,
        }
      });
      
      return this.parseResponsePlaybook(response.response, threat);
    } catch (error) {
      console.error('Error generating response playbook with AI:', error);
      // Return a fallback playbook
      return this.createFallbackResponsePlaybook(threat);
    }
  }
  
  /**
   * Enhance threat intelligence by correlating with known patterns
   */
  async enhanceThreatIntelligence(threat: ThreatDetection): Promise<ThreatIntelligenceResult> {
    const prompt = this.buildThreatIntelligencePrompt(threat);
    
    try {
      const response = await this.ollamaService.generate({
        model: this.defaultModel,
        prompt,
        system: SECURITY_SYSTEM_PROMPT,
        options: {
          temperature: 0.3,
        }
      });
      
      return this.parseThreatIntelligenceResponse(threat.id, response.response);
    } catch (error) {
      console.error('Error enhancing threat intelligence with AI:', error);
      // Return fallback intelligence
      return this.createFallbackThreatIntelligence(threat);
    }
  }

  // ======== PRIVATE METHODS ========
  
  private buildAnomalyAnalysisPrompt(anomaly: Anomaly, features: FeatureVector): string {
    return `
Analyze this network anomaly and provide a detailed security assessment:

ANOMALY ID: ${anomaly.id}
TIMESTAMP: ${new Date(anomaly.timestamp).toISOString()}
CONFIDENCE: ${anomaly.confidence}
DESCRIPTION: ${anomaly.description}

NETWORK FEATURES:
- Protocol normalized value: ${features.protocol}
- Packet size: ${features.packetSize}
- Source port category: ${features.sourcePortCategory}
- Destination port category: ${features.destPortCategory}
- Payload entropy: ${features.payloadEntropy}
- Source IP entropy: ${features.srcIpEntropy}
- Destination IP entropy: ${features.dstIpEntropy}
- Intranet traffic: ${features.isIntranet === 1 ? 'Yes' : 'No'}
- Inter-packet time: ${features.interPacketTime}
- Packet ratio: ${features.packetRatio}

Based on these values, provide:
1. A technical summary of this anomaly
2. The most likely root cause
3. Potential security implications
4. Whether this might be a zero-day exploit and why
5. Recommended immediate actions
6. Related threat patterns this might match
7. Technical details for security specialists
`;
  }
  
  private parseAnomalyAnalysisResponse(anomalyId: string, aiResponse: string): AnomalyAnalysisResult {
    // In a production system, we'd implement sophisticated parsing of the AI response
    // For now, we'll do some basic parsing for demonstration purposes
    
    const lines = aiResponse.split('\n');
    const summary = this.extractSection(lines, 'technical summary', 'root cause') || 'No summary provided';
    const rootCause = this.extractSection(lines, 'root cause', 'security implications') || 'Unknown';
    const possibleImpact = this.extractSection(lines, 'security implications', 'zero-day') || 'Unknown impact';
    const isZeroDay = this.extractSection(lines, 'zero-day', 'recommended').toLowerCase().includes('yes');
    
    // Extract recommended actions as bullet points
    const recommendedActionsText = this.extractSection(lines, 'recommended', 'related threat');
    const recommendedActions = recommendedActionsText
      ? recommendedActionsText
          .split(/[-•*]/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : ['Monitor the situation'];
    
    const relatedThreatsText = this.extractSection(lines, 'related threat', 'technical details');
    const relatedThreats = relatedThreatsText
      ? relatedThreatsText
          .split(/[-•*]/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : [];
    
    const technicalDetails = this.extractSection(lines, 'technical details', null) || 'No technical details available';
    
    return {
      anomalyId,
      summary,
      rootCause,
      confidence: 0.8, // This would be calculated based on AI certainty markers in production
      technicalDetails,
      recommendedActions,
      relatedThreats,
      possibleImpact,
      isZeroDay
    };
  }
  
  private extractSection(lines: string[], startMarker: string, endMarker: string | null): string {
    let collecting = false;
    const result: string[] = [];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (!collecting && lowerLine.includes(startMarker)) {
        collecting = true;
        // Skip the current line if it's just a header
        if (lowerLine.length < startMarker.length + 5) {
          continue;
        }
      } else if (collecting && endMarker && lowerLine.includes(endMarker)) {
        break;
      }
      
      if (collecting) {
        result.push(line.trim());
      }
    }
    
    return result.join('\n').trim();
  }
  
  private createFallbackAnomalyAnalysis(anomaly: Anomaly): AnomalyAnalysisResult {
    return {
      anomalyId: anomaly.id,
      summary: `Anomaly detected with confidence ${anomaly.confidence}`,
      rootCause: 'Unable to determine root cause due to analysis service error',
      confidence: 0.5,
      technicalDetails: 'Technical analysis unavailable',
      recommendedActions: ['Monitor the situation', 'Manually review the anomaly details'],
      relatedThreats: [],
      possibleImpact: 'Unknown - manual investigation required',
      isZeroDay: false
    };
  }
  
  // Other private implementation methods would go here
  // These are omitted for brevity but would include implementations for:
  // - buildSecurityBriefingPrompt
  // - parseSecurityBriefing
  // - createFallbackSecurityBriefing
  // - buildRootCauseAnalysisPrompt
  // - parseRootCauseAnalysisResponse
  // - createFallbackRootCauseAnalysis
  // - buildResponsePlaybookPrompt
  // - parseResponsePlaybook
  // - createFallbackResponsePlaybook
  // - buildThreatIntelligencePrompt
  // - parseThreatIntelligenceResponse
  // - createFallbackThreatIntelligence
  
  // Implementations for the remaining methods
  private buildSecurityBriefingPrompt(
    recentThreats: ThreatDetection[],
    recentAnomalies: Anomaly[]
  ): string {
    let threatsInfo = recentThreats.map((threat, i) => `
THREAT ${i + 1}:
- ID: ${threat.id}
- Timestamp: ${new Date(threat.timestamp).toISOString()}
- Severity: ${threat.severity}
- Confidence: ${threat.confidence}
- Description: ${threat.description}
- Source IPs: ${threat.sourceIps.join(', ')}
- Destination IPs: ${threat.destinationIps.join(', ')}
- Protocols: ${threat.protocols.join(', ')}
- Zero-day: ${threat.isZeroDay ? 'Yes' : 'No'}
`).join('\n');

    let anomaliesInfo = recentAnomalies.map((anomaly, i) => `
ANOMALY ${i + 1}:
- ID: ${anomaly.id}
- Timestamp: ${new Date(anomaly.timestamp).toISOString()}
- Confidence: ${anomaly.confidence}
- Description: ${anomaly.description}
`).join('\n');

    return `
Generate a comprehensive security briefing based on the following recent threats and anomalies:

${threatsInfo}

${anomaliesInfo}

Provide a structured security briefing including:
1. An executive summary of the current security situation
2. Detailed analysis of the most significant threats
3. Potential business impact
4. Recommended actions prioritized by urgency
5. Systems that require immediate attention
`;
  }
  
  private parseSecurityBriefing(aiResponse: string): SecurityBriefing {
    // Basic parsing logic - in production would be more sophisticated
    const lines = aiResponse.split('\n');
    const title = lines[0].trim() || 'Security Briefing';
    const summary = this.extractSection(lines, 'executive summary', 'detailed analysis') || 'No summary provided';
    const details = this.extractSection(lines, 'detailed analysis', 'business impact') || 'No details provided';
    
    // Determine threat level from content
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    const fullText = aiResponse.toLowerCase();
    if (fullText.includes('critical') || fullText.includes('severe') || fullText.includes('urgent')) {
      threatLevel = 'critical';
    } else if (fullText.includes('high risk') || fullText.includes('significant') || fullText.includes('major')) {
      threatLevel = 'high';
    } else if (fullText.includes('low risk') || fullText.includes('minor')) {
      threatLevel = 'low';
    }
    
    // Extract recommended actions
    const actionsText = this.extractSection(lines, 'recommended action', 'systems');
    const recommendedActions = actionsText
      ? actionsText
          .split(/\d+\.|\n[-•*]/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : ['Review security alerts'];
      
    // Extract affected systems
    const systemsText = this.extractSection(lines, 'systems', null);
    const affectedSystems = systemsText
      ? systemsText
          .split(/\n[-•*]/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : [];
    
    return {
      id: nanoid(),
      timestamp: Date.now(),
      title,
      summary,
      details,
      threatLevel,
      affectedSystems,
      recommendedActions
    };
  }

  private createFallbackSecurityBriefing(
    recentThreats: ThreatDetection[],
    recentAnomalies: Anomaly[]
  ): SecurityBriefing {
    // Count threats by severity
    const threatCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    recentThreats.forEach(threat => {
      threatCounts[threat.severity as keyof typeof threatCounts]++;
    });
    
    // Determine overall threat level
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (threatCounts.critical > 0) {
      threatLevel = 'critical';
    } else if (threatCounts.high > 0) {
      threatLevel = 'high';
    } else if (threatCounts.medium > 0) {
      threatLevel = 'medium';
    }
    
    return {
      id: nanoid(),
      timestamp: Date.now(),
      title: 'Security Status Report',
      summary: `Current security status: ${threatLevel.toUpperCase()}. ${recentThreats.length} threats and ${recentAnomalies.length} anomalies detected recently.`,
      details: `
Summary of threats:
- Critical: ${threatCounts.critical}
- High: ${threatCounts.high}
- Medium: ${threatCounts.medium}
- Low: ${threatCounts.low}

Please review the threats and anomalies in the dashboard for more information.
      `,
      threatLevel,
      affectedSystems: ['Unknown - manual review required'],
      recommendedActions: ['Review security dashboard', 'Investigate highest severity threats']
    };
  }

  private buildRootCauseAnalysisPrompt(
    entity: Anomaly | ThreatDetection,
    relatedEntities: Array<Anomaly | ThreatDetection>
  ): string {
    // Determine if this is an anomaly or threat
    const entityType = 'description' in entity ? 'THREAT' : 'ANOMALY';
    
    let entityInfo = '';
    if (entityType === 'THREAT') {
      const threat = entity as ThreatDetection;
      entityInfo = `
THREAT DETAILS:
- ID: ${threat.id}
- Timestamp: ${new Date(threat.timestamp).toISOString()}
- Severity: ${threat.severity}
- Confidence: ${threat.confidence}
- Description: ${threat.description}
- Source IPs: ${threat.sourceIps.join(', ')}
- Destination IPs: ${threat.destinationIps.join(', ')}
- Ports: ${threat.ports.join(', ')}
- Protocols: ${threat.protocols.join(', ')}
- Zero-day: ${threat.isZeroDay ? 'Yes' : 'No'}
`;
    } else {
      const anomaly = entity as Anomaly;
      entityInfo = `
ANOMALY DETAILS:
- ID: ${anomaly.id}
- Timestamp: ${new Date(anomaly.timestamp).toISOString()}
- Confidence: ${anomaly.confidence}
- Description: ${anomaly.description}
- Feature Vector: Protocol=${anomaly.featureVector.protocol}, PacketSize=${anomaly.featureVector.packetSize}, SourcePort=${anomaly.featureVector.sourcePortCategory}, DestPort=${anomaly.featureVector.destPortCategory}, PayloadEntropy=${anomaly.featureVector.payloadEntropy}
`;
    }
    
    let relatedInfo = '';
    if (relatedEntities.length > 0) {
      relatedInfo = '\nRELATED ENTITIES:\n';
      relatedEntities.forEach((related, i) => {
        const relatedType = 'description' in related ? 'THREAT' : 'ANOMALY';
        relatedInfo += `${relatedType} ${i+1}: ID=${related.id}, Timestamp=${new Date(related.timestamp).toISOString()}, Confidence=${related.confidence}\n`;
      });
    }
    
    return `
Perform an in-depth root cause analysis on this ${entityType.toLowerCase()}:

${entityInfo}
${relatedInfo}

Based on these details, provide:
1. The most probable root cause of this security issue
2. Confidence level in your analysis (as a percentage)
3. Specific affected systems or components
4. Potential vulnerabilities being exploited
5. Possible exploit methods or attack vectors
6. Technical recommendations for remediation
`;
  }
  
  private parseRootCauseAnalysisResponse(aiResponse: string): RootCauseAnalysisResult {
    const lines = aiResponse.split('\n');
    
    // Extract the root cause
    const rootCause = this.extractSection(lines, 'root cause', 'confidence') || 'Unable to determine root cause';
    
    // Extract confidence value
    let confidence = 0.7; // Default
    const confidenceSection = this.extractSection(lines, 'confidence', 'affected');
    if (confidenceSection) {
      const confidenceMatch = confidenceSection.match(/(\d+)%/);
      if (confidenceMatch && confidenceMatch[1]) {
        confidence = parseInt(confidenceMatch[1], 10) / 100;
      }
    }
    
    // Extract affected systems
    const affectedSystemsText = this.extractSection(lines, 'affected', 'vulnerabilities');
    const affectedSystems = affectedSystemsText
      ? affectedSystemsText
          .split(/[-•*]/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : ['Unknown system'];
      
    // Extract vulnerabilities
    const vulnerabilitiesText = this.extractSection(lines, 'vulnerabilities', 'exploit');
    const vulnerabilities = vulnerabilitiesText
      ? vulnerabilitiesText
          .split(/[-•*]/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : ['Unknown vulnerability'];
    
    // Extract exploit methods
    const exploitMethodsText = this.extractSection(lines, 'exploit', 'recommendation');
    const exploitMethods = exploitMethodsText
      ? exploitMethodsText
          .split(/[-•*]/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : ['Unknown method'];
    
    return {
      rootCause,
      confidence,
      affectedSystems,
      vulnerabilities,
      exploitMethods
    };
  }
  
  private createFallbackRootCauseAnalysis(): RootCauseAnalysisResult {
    return {
      rootCause: 'Unable to perform root cause analysis due to service error',
      confidence: 0.5,
      affectedSystems: ['Manual investigation required'],
      vulnerabilities: ['Unknown - security service unavailable'],
      exploitMethods: ['Unknown - manual analysis required']
    };
  }
  
  /**
   * Build prompt for response playbook generation
   */
  private buildResponsePlaybookPrompt(threat: ThreatDetection): string {
    return `
Generate a detailed incident response playbook for the following security threat:

THREAT DETAILS:
- ID: ${threat.id}
- Timestamp: ${new Date(threat.timestamp).toISOString()}
- Severity: ${threat.severity}
- Confidence: ${threat.confidence}
- Description: ${threat.description}
- Source IPs: ${threat.sourceIps.join(', ')}
- Destination IPs: ${threat.destinationIps.join(', ')}
- Ports: ${threat.ports.join(', ')}
- Protocols: ${threat.protocols.join(', ')}
- Zero-day: ${threat.isZeroDay ? 'Yes' : 'No'}

Create a comprehensive response playbook that includes:
1. Title and description of the playbook
2. Prerequisites and tools needed
3. Step-by-step response procedures with commands where applicable
4. Verification methods for each step
5. Post-incident actions
`;
  }
  
  /**
   * Parse the response playbook from AI response
   */
  private parseResponsePlaybook(aiResponse: string, threat: ThreatDetection): ResponsePlaybook {
    const lines = aiResponse.split('\n');
    const title = lines[0].trim() || `Response Playbook for ${threat.severity.toUpperCase()} Threat`;
    const description = this.extractSection(lines, 'description', 'prerequisites') || 'Standard incident response procedure';
    
    // Extract prerequisites
    const prerequisitesText = this.extractSection(lines, 'prerequisites', 'step');
    const prerequisites = prerequisitesText
      ? prerequisitesText
          .split(/\d+\.|-|\*|•/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : ['Security analysis toolkit'];
    
    // Extract steps
    const stepsText = this.extractSection(lines, 'step', 'post-incident');
    const steps: PlaybookStep[] = [];
    
    // Basic parsing for steps - in a production system would be more sophisticated
    const stepRegex = /step\s*(\d+)|\b(\d+)\.\s+/i;
    let currentStep = "";
    let stepNumber = 1;
    
    stepsText?.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      const stepMatch = trimmedLine.match(stepRegex);
      
      if (stepMatch) {
        // New step found
        if (currentStep) {
          // Process previous step
          steps.push(this.parsePlaybookStep(currentStep, stepNumber - 1));
        }
        currentStep = trimmedLine;
        stepNumber++;
      } else if (currentStep && trimmedLine) {
        currentStep += '\n' + trimmedLine;
      }
    });
    
    // Add the last step
    if (currentStep) {
      steps.push(this.parsePlaybookStep(currentStep, stepNumber - 1));
    }
    
    // If no steps were parsed, create a default step
    if (steps.length === 0) {
      steps.push({
        stepNumber: 1,
        title: 'Investigate the threat',
        description: 'Analyze the detected threat and gather additional information',
        commands: ['netstat -an | grep <suspicious_ip>'],
        expectedOutcome: 'Identification of affected systems',
        verificationMethod: 'Confirm connection details match threat indicators'
      });
    }
    
    // Extract post-incident actions
    const postIncidentText = this.extractSection(lines, 'post-incident', null);
    const postIncidentActions = postIncidentText
      ? postIncidentText
          .split(/\d+\.|-|\*|•/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : ['Document the incident', 'Update security controls'];
    
    return {
      id: nanoid(),
      title,
      threatType: this.determineThreatType(threat),
      severity: threat.severity,
      description,
      prerequisites,
      steps,
      postIncidentActions
    };
  }
  
  /**
   * Parse a single step from the playbook response
   */
  private parsePlaybookStep(stepText: string, stepNumber: number): PlaybookStep {
    const lines = stepText.split('\n').map(line => line.trim());
    const title = lines[0].replace(/step\s*\d+|\d+\.\s+/i, '').trim() || 'Investigation step';
    
    // Extract command lines (usually prefixed with $ or > or enclosed in backticks)
    const commandRegex = /[`$>]\s*([^`]+)[`]?|```([^`]+)```/g;
    const commands: string[] = [];
    let match;
    
    const fullText = lines.join('\n');
    while ((match = commandRegex.exec(fullText)) !== null) {
      commands.push((match[1] || match[2]).trim());
    }
    
    // Extract description (everything except title and commands)
    let description = lines.slice(1).join('\n');
    // Remove command lines from description
    commands.forEach(cmd => {
      description = description.replace(new RegExp(`[\`$>]\s*${cmd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\`]?`, 'g'), '');
    });
    description = description.trim() || 'Follow standard procedures for this step';
    
    // Extract expected outcome and verification (if present)
    let expectedOutcome = 'Successful completion of this step';
    let verificationMethod = 'Confirm expected results';
    
    if (description.toLowerCase().includes('expected') || description.toLowerCase().includes('outcome')) {
      const parts = description.split(/expected|outcome|verification|verify/i);
      if (parts.length > 1) {
        description = parts[0].trim();
        expectedOutcome = parts[1].trim();
      }
      
      if (parts.length > 2) {
        verificationMethod = parts[2].trim();
      }
    }
    
    return {
      stepNumber,
      title,
      description,
      commands: commands.length > 0 ? commands : undefined,
      expectedOutcome,
      verificationMethod
    };
  }
  
  /**
   * Determine the threat type based on the threat detection
   */
  private determineThreatType(threat: ThreatDetection): string {
    const description = threat.description.toLowerCase();
    
    if (description.includes('malware') || description.includes('virus')) {
      return 'Malware';
    }
    if (description.includes('ddos') || description.includes('denial of service')) {
      return 'DDoS';
    }
    if (description.includes('injection') || description.includes('xss') || description.includes('csrf')) {
      return 'Web Attack';
    }
    if (description.includes('brute force') || description.includes('credential')) {
      return 'Authentication Attack';
    }
    if (description.includes('scan') || description.includes('recon')) {
      return 'Reconnaissance';
    }
    if (description.includes('exfil') || description.includes('data leak')) {
      return 'Data Exfiltration';
    }
    
    // Default
    return 'Unknown Threat';
  }
  
  /**
   * Create a fallback response playbook when AI analysis fails
   */
  private createFallbackResponsePlaybook(threat: ThreatDetection): ResponsePlaybook {
    return {
      id: nanoid(),
      title: `Standard Response for ${threat.severity.toUpperCase()} Severity Threat`,
      threatType: this.determineThreatType(threat),
      severity: threat.severity,
      description: 'This is a generic response plan created due to AI service unavailability',
      prerequisites: [
        'Network analysis tools',
        'System access logs',
        'Firewall logs'
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Isolate affected systems',
          description: 'Disconnect affected systems from the network to prevent further damage',
          expectedOutcome: 'Affected systems are isolated',
          verificationMethod: 'Confirm network disconnection'
        },
        {
          stepNumber: 2,
          title: 'Gather evidence',
          description: 'Collect logs and relevant data from affected systems',
          commands: ['cp /var/log/* /forensics/'],
          expectedOutcome: 'Forensic data collected',
          verificationMethod: 'Verify log files are copied successfully'
        },
        {
          stepNumber: 3,
          title: 'Analyze and remediate',
          description: 'Investigate root cause and remove threat',
          expectedOutcome: 'Threat identified and removed',
          verificationMethod: 'Scan system and confirm clean state'
        }
      ],
      postIncidentActions: [
        'Document incident details',
        'Update security controls',
        'Conduct lessons learned session'
      ]
    };
  }
  
  /**
   * Build threat intelligence enrichment prompt
   */
  private buildThreatIntelligencePrompt(threat: ThreatDetection): string {
    return `
Enrich the following threat detection with additional threat intelligence:

THREAT DETAILS:
- ID: ${threat.id}
- Timestamp: ${new Date(threat.timestamp).toISOString()}
- Severity: ${threat.severity}
- Confidence: ${threat.confidence}
- Description: ${threat.description}
- Source IPs: ${threat.sourceIps.join(', ')}
- Destination IPs: ${threat.destinationIps.join(', ')}
- Ports: ${threat.ports.join(', ')}
- Protocols: ${threat.protocols.join(', ')}
- Zero-day: ${threat.isZeroDay ? 'Yes' : 'No'}

Provide the following enriched threat intelligence information:
1. Possible threat name or attribution if known
2. Detailed technical description of the threat
3. Common indicators of compromise (IoCs)
4. Known attack patterns associated with this type of threat
5. Recommended mitigation strategies
6. External references or similar known threats
`;
  }
  
  /**
   * Parse threat intelligence response from AI
   */
  private parseThreatIntelligenceResponse(threatId: string, aiResponse: string): ThreatIntelligenceResult {
    const lines = aiResponse.split('\n');
    
    // Extract threat name (if provided)
    let threatName: string | null = null;
    const threatNameMatch = aiResponse.match(/threat name:?\s*([^\n]+)/i);
    if (threatNameMatch && threatNameMatch[1]) {
      threatName = threatNameMatch[1].trim();
    }
    
    // Extract main sections
    const description = this.extractSection(lines, 'technical description', 'indicators') || 'No detailed description available';
    const technicalDetails = this.extractSection(lines, 'technical', 'indicators') || 'Technical details unavailable';
    
    // Extract indicators list
    const indicatorsText = this.extractSection(lines, 'indicators', 'attack patterns');
    const indicators = indicatorsText
      ? indicatorsText
          .split(/[-•*]|\d+\.\s+/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : ['No specific indicators provided'];
    
    // Extract attack patterns
    const attackPatternsText = this.extractSection(lines, 'attack patterns', 'mitigation');
    const attackPatterns = attackPatternsText
      ? attackPatternsText
          .split(/[-•*]|\d+\.\s+/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : ['Unknown attack pattern'];
    
    // Extract mitigation steps
    const mitigationText = this.extractSection(lines, 'mitigation', 'references');
    const mitigationSteps = mitigationText
      ? mitigationText
          .split(/[-•*]|\d+\.\s+/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : ['Standard security practices recommended'];
    
    // Extract external references
    const referencesText = this.extractSection(lines, 'references', null);
    const externalReferences = referencesText
      ? referencesText
          .split(/[-•*]|\d+\.\s+/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : [];
    
    return {
      threatId,
      threatName,
      description,
      technicalDetails,
      indicators,
      attackPatterns,
      mitigationSteps,
      externalReferences
    };
  }
  
  /**
   * Create fallback threat intelligence when AI analysis fails
   */
  private createFallbackThreatIntelligence(threat: ThreatDetection): ThreatIntelligenceResult {
    return {
      threatId: threat.id,
      threatName: null,
      description: 'Unable to retrieve enhanced threat intelligence due to service error',
      technicalDetails: 'Technical details unavailable - please consult standard threat databases',
      indicators: ['Manual investigation required'],
      attackPatterns: ['Unknown attack pattern'],
      mitigationSteps: [
        'Follow standard security procedures',
        'Update security controls',
        'Monitor for similar activity'
      ],
      externalReferences: []
    };
  }
}

// Singleton instance
let instance: SecurityAnalysisService | null = null;

/**
 * Get the global instance of SecurityAnalysisService
 */
export function getSecurityAnalysisService(
  ollamaService?: OllamaService,
  defaultModel: string = 'llama3'
): SecurityAnalysisService {
  if (!instance) {
    instance = new SecurityAnalysisService(ollamaService, defaultModel);
  }
  return instance;
}
