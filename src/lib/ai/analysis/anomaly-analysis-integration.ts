/**
 * Anomaly Analysis Integration
 * 
 * This module connects the neuromorphic anomaly detection system with the AI-powered
 * security analysis service, enabling real-time anomaly analysis with Llama 3.
 */

import { AnomalyDetector } from '../../neuromorphic/anomaly-detector';
import { getSecurityAnalysisService, SecurityAnalysisService, AnomalyAnalysisResult } from './security-analysis-service';
import { Anomaly, ThreatDetection } from '../../neuromorphic/types';
import { Subject } from '../../neuromorphic/mock-dependencies';

/**
 * Interface for enriched anomaly data that includes AI analysis
 */
export interface EnrichedAnomaly extends Anomaly {
  aiAnalysis?: AnomalyAnalysisResult;
  analyzed: boolean;
  processingTime?: number;
}

/**
 * Service that integrates anomaly detection with AI-powered analysis
 */
export class AnomalyAnalysisIntegration {
  private anomalyDetector: AnomalyDetector;
  private securityAnalysisService: SecurityAnalysisService;
  private isEnabled: boolean = false;
  private analysisQueue: Anomaly[] = [];
  private processingPromise: Promise<void> | null = null;
  private enrichedAnomalySubject = new Subject<EnrichedAnomaly>();
  private analysisThreshold: number = 0.6; // Only analyze anomalies with confidence above this threshold
  private analyzeAll: boolean = false; // When true, analyze all anomalies regardless of threshold
  private maxQueueSize: number = 50; // Maximum size of the analysis queue

  /**
   * Creates a new instance of the AnomalyAnalysisIntegration
   */
  constructor(
    anomalyDetector?: AnomalyDetector,
    securityAnalysisService?: SecurityAnalysisService
  ) {
    this.anomalyDetector = anomalyDetector || new AnomalyDetector();
    this.securityAnalysisService = securityAnalysisService || getSecurityAnalysisService();
  }

  /**
   * Enable AI analysis of anomalies in real time
   */
  enable(): boolean {
    if (this.isEnabled) {
      return true; // Already enabled
    }

    try {
      // Subscribe to anomaly events from the detector
      const subscription = this.anomalyDetector.subscribeToAnomalies(
        this.handleNewAnomaly.bind(this)
      );

      if (!subscription) {
        console.error('Failed to subscribe to anomaly events');
        return false;
      }

      this.isEnabled = true;
      console.log('Anomaly analysis integration enabled');
      
      // Start processing any queued anomalies
      this.processQueue();
      
      return true;
    } catch (error) {
      console.error('Failed to enable anomaly analysis integration:', error);
      return false;
    }
  }

  /**
   * Disable AI analysis of anomalies
   */
  disable(): void {
    this.isEnabled = false;
    console.log('Anomaly analysis integration disabled');
  }

  /**
   * Configure the analysis settings
   */
  configure(options: {
    analysisThreshold?: number;
    analyzeAll?: boolean;
    maxQueueSize?: number;
  }): void {
    if (options.analysisThreshold !== undefined) {
      this.analysisThreshold = options.analysisThreshold;
    }
    
    if (options.analyzeAll !== undefined) {
      this.analyzeAll = options.analyzeAll;
    }
    
    if (options.maxQueueSize !== undefined) {
      this.maxQueueSize = options.maxQueueSize;
    }
  }

  /**
   * Subscribe to enriched anomalies (with AI analysis)
   */
  subscribeToEnrichedAnomalies(callback: (enrichedAnomaly: EnrichedAnomaly) => void): {
    unsubscribe: () => void;
  } {
    const subscription = this.enrichedAnomalySubject.subscribe(callback);
    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }

  /**
   * Manually submit an anomaly for analysis
   */
  analyzeAnomaly(anomaly: Anomaly): Promise<EnrichedAnomaly> {
    return this.performAnalysis(anomaly);
  }

  /**
   * Get the current queue status
   */
  getQueueStatus(): {
    queueLength: number;
    isProcessing: boolean;
    isEnabled: boolean;
  } {
    return {
      queueLength: this.analysisQueue.length,
      isProcessing: !!this.processingPromise,
      isEnabled: this.isEnabled,
    };
  }

  // ======== PRIVATE METHODS ========

  /**
   * Handle a new anomaly from the detector
   */
  private handleNewAnomaly(anomaly: Anomaly): void {
    if (!this.isEnabled) {
      return;
    }

    // Check if we should analyze this anomaly based on confidence threshold
    if (this.analyzeAll || anomaly.confidence >= this.analysisThreshold) {
      this.queueAnalysis(anomaly);
    } else {
      // For anomalies below threshold, we still emit them but without AI analysis
      const enrichedAnomaly: EnrichedAnomaly = {
        ...anomaly,
        analyzed: false,
      };
      
      this.enrichedAnomalySubject.next(enrichedAnomaly);
    }
  }

  /**
   * Queue an anomaly for analysis
   */
  private queueAnalysis(anomaly: Anomaly): void {
    // Add to queue
    this.analysisQueue.push(anomaly);
    
    // Keep queue size under control
    if (this.analysisQueue.length > this.maxQueueSize) {
      // Remove oldest anomaly
      this.analysisQueue.shift();
    }
    
    // Process queue if not already processing
    if (!this.processingPromise) {
      this.processQueue();
    }
  }

  /**
   * Process the queue of anomalies awaiting analysis
   */
  private processQueue(): void {
    if (this.analysisQueue.length === 0 || !this.isEnabled) {
      this.processingPromise = null;
      return;
    }

    // Get the next anomaly to analyze
    const anomaly = this.analysisQueue.shift()!;
    
    // Create processing promise
    this.processingPromise = this.performAnalysis(anomaly)
      .then((enrichedAnomaly) => {
        // Emit the enriched anomaly
        this.enrichedAnomalySubject.next(enrichedAnomaly);
        
        // Continue processing queue
        this.processQueue();
      })
      .catch((error) => {
        console.error('Error during anomaly analysis:', error);
        
        // Continue processing queue despite error
        this.processQueue();
      });
  }

  /**
   * Perform AI analysis on an anomaly
   */
  private async performAnalysis(anomaly: Anomaly): Promise<EnrichedAnomaly> {
    const startTime = Date.now();
    
    try {
      // Perform AI analysis
      const aiAnalysis = await this.securityAnalysisService.analyzeAnomaly(anomaly);
      
      const processingTime = Date.now() - startTime;
      
      // Create enriched anomaly with AI analysis
      const enrichedAnomaly: EnrichedAnomaly = {
        ...anomaly,
        aiAnalysis,
        analyzed: true,
        processingTime
      };
      
      return enrichedAnomaly;
    } catch (error) {
      console.error('Error analyzing anomaly:', error);
      
      // Return anomaly without AI analysis
      return {
        ...anomaly,
        analyzed: false,
        processingTime: Date.now() - startTime
      };
    }
  }
}

// Singleton instance
let instance: AnomalyAnalysisIntegration | null = null;

/**
 * Get the global instance of AnomalyAnalysisIntegration
 */
export function getAnomalyAnalysisIntegration(
  anomalyDetector?: AnomalyDetector,
  securityAnalysisService?: SecurityAnalysisService
): AnomalyAnalysisIntegration {
  if (!instance) {
    instance = new AnomalyAnalysisIntegration(anomalyDetector, securityAnalysisService);
  }
  return instance;
}
