import { AnomalyDetector } from './anomaly-detector';
import { SNNState, SpikingNeuralNetwork, NeuronState, SynapticConnection } from './snn-engine';
import { ThreatDetection, Anomaly, PipelineStatus } from './types';
import { Subject, BehaviorSubject } from './mock-dependencies';

// Types matching the existing visualization components
interface VisualNeuron {
  id: string;
  x: number;
  y: number;
  z: number;
  layer: string;
  size: number;
  connections: string[];
  state: 'inactive' | 'active' | 'refractory';
  activationLevel: number;
  anomalyLevel: number;
}

interface VisualConnection {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number;
  active: boolean;
  highlighted: boolean;
}

interface VisualState {
  neurons: VisualNeuron[];
  connections: VisualConnection[];
  anomalyScore: number;
  isAnalysisActive: boolean;
  activeThreats: number;
}

/**
 * VisualizationConnector - Adapts the neuromorphic SNN engine outputs
 * to work with the existing visualization components
 */
export class VisualizationConnector {
  private anomalyDetector: AnomalyDetector;
  private visualState: VisualState;
  private stateSubject = new BehaviorSubject<VisualState | null>(null);
  private anomalySubject = new Subject<Anomaly>();
  private threatSubject = new Subject<ThreatDetection>();
  private statusSubject = new Subject<PipelineStatus>();

  private neuronPositions: Map<string, { x: number, y: number, z: number }> = new Map();
  private layerConfig = {
    input: { minZ: -300, maxZ: -200, spread: 300 },
    hidden1: { minZ: -100, maxZ: 0, spread: 250 },
    hidden2: { minZ: 100, maxZ: 200, spread: 200 },
    output: { minZ: 300, maxZ: 400, spread: 150 }
  };

  constructor(anomalyDetector: AnomalyDetector) {
    this.anomalyDetector = anomalyDetector;
    
    // Initialize with empty state
    this.visualState = {
      neurons: [],
      connections: [],
      anomalyScore: 0,
      isAnalysisActive: false,
      activeThreats: 0
    };

    // Subscribe to SNN state updates
    this.anomalyDetector.subscribeToSNNState(this.onSNNStateUpdate.bind(this));
    
    // Subscribe to anomaly events
    this.anomalyDetector.subscribeToAnomalies(anomaly => {
      this.anomalySubject.next(anomaly);
    });
    
    // Subscribe to threat events
    this.anomalyDetector.subscribeToThreats(threat => {
      this.threatSubject.next(threat);
    });
    
    // Subscribe to status updates
    this.anomalyDetector.subscribeToStatus(status => {
      this.statusSubject.next(status);
    });
  }

  /**
   * Start the anomaly detection and visualization pipeline
   */
  startAnalysis(networkInterface?: string): boolean {
    return this.anomalyDetector.start(networkInterface);
  }

  /**
   * Stop the anomaly detection pipeline
   */
  stopAnalysis(): void {
    this.anomalyDetector.stop();
  }

  /**
   * Handle SNN state updates and transform them into visualization-compatible format
   */
  private onSNNStateUpdate(snnState: SNNState): void {
    // Update visual state from SNN state
    this.visualState = this.transformSNNtoVisualState(snnState);
    
    // Emit updated visual state
    this.stateSubject.next(this.visualState);
  }

  /**
   * Transform SNN state to visual state compatible with existing components
   */
  private transformSNNtoVisualState(snnState: SNNState): VisualState {
    // Transform neurons
    const visualNeurons = this.transformNeurons(snnState.neurons);
    
    // Extract connections from neurons
    const allConnections: SynapticConnection[] = [];
    snnState.neurons.forEach(neuron => {
      if (neuron.connections && Array.isArray(neuron.connections)) {
        allConnections.push(...neuron.connections);
      }
    });
    
    // Transform connections
    const visualConnections = this.transformConnections(allConnections);
    
    // Get other state information
    const visualState: VisualState = {
      neurons: visualNeurons,
      connections: visualConnections,
      anomalyScore: snnState.anomalyScore,
      isAnalysisActive: this.anomalyDetector.getStatus().isProcessing,
      activeThreats: this.anomalyDetector.getActiveThreatsCount()
    };
    
    return visualState;
  }

  /**
   * Transform SNN neurons to visual neurons
   */
  private transformNeurons(neurons: NeuronState[]): VisualNeuron[] {
    return neurons.map(neuron => {
      // Determine the layer based on neuron layer property
      let layer = '';
      if (neuron.layer === 'output') {
        layer = 'output';
      } else if (neuron.layer === 'hidden') {
        // Split hidden layers into hidden1 and hidden2 based on position
        const hiddenDepth = neuron.position[0]; // Using the X position to determine layer depth
        layer = hiddenDepth < 0 ? 'hidden1' : 'hidden2';
      } else {
        layer = 'input';
      }
      
      // Get or generate a position for this neuron
      const parsedId = neuron.id.split('-');
      const index = parsedId.length > 1 ? parseInt(parsedId[parsedId.length - 1]) || 0 : 0;
      const position = this.getNeuronPosition(neuron.id, layer, index);
      
      // Determine neuron state
      let state: 'inactive' | 'active' | 'refractory' = 'inactive';
      const now = Date.now();
      const isRefractory = (now - neuron.lastSpikeTime) < neuron.refractoryPeriod;
      if (isRefractory) {
        state = 'refractory';
      } else if (neuron.potential > neuron.threshold * 0.6) {
        state = 'active';
      }

      // Map connection IDs to strings for the visual component
      const connectionIds = neuron.connections.map(conn => conn.id);
      
      // Calculate anomaly level based on spike history
      const recentSpikes = neuron.spikeHistory.filter(t => now - t < 500).length;
      const anomalyLevel = recentSpikes > 3 ? recentSpikes / 10 : 0;

      return {
        id: neuron.id,
        x: position.x,
        y: position.y,
        z: position.z,
        layer,
        size: anomalyLevel > 0.5 ? 1.5 : 1.0,
        connections: connectionIds,
        state,
        activationLevel: neuron.potential / neuron.threshold,
        anomalyLevel: anomalyLevel
      };
    });
  }

  /**
   * Transform SNN connections to visual connections
   */
  private transformConnections(connections: SynapticConnection[]): VisualConnection[] {
    return connections.map(connection => {
      const now = Date.now();
      return {
        id: connection.id,
        sourceId: connection.sourceId,
        targetId: connection.targetId,
        strength: connection.weight,
        active: connection.lastActivity > now - 200, // Active if fired within 200ms
        highlighted: connection.plasticityEnabled  // Highlight connections with plasticity enabled
      };
    });
  }

  /**
   * Get or generate a position for a neuron
   */
  private getNeuronPosition(id: string, layer: string, index: number): { x: number, y: number, z: number } {
    // Return cached position if available
    if (this.neuronPositions.has(id)) {
      return this.neuronPositions.get(id)!;
    }
    
    // Generate position based on layer and index
    const config = this.layerConfig[layer as keyof typeof this.layerConfig];
    const z = config.minZ + Math.random() * (config.maxZ - config.minZ);
    
    // Calculate x and y based on layer spread
    // This distributes neurons in a circular pattern within each layer
    const radius = config.spread;
    const angle = (index / 10) * Math.PI * 2; // Distribute neurons around the circle
    const x = Math.cos(angle) * radius + (Math.random() * 40 - 20); // Add some randomness
    const y = Math.sin(angle) * radius + (Math.random() * 40 - 20); // Add some randomness
    
    // Cache and return position
    const position = { x, y, z };
    this.neuronPositions.set(id, position);
    return position;
  }

  /**
   * Subscribe to visual state updates
   */
  subscribeToVisualState(callback: (state: VisualState) => void): { unsubscribe: () => void } {
    // Skip null values (initial state)
    const subscription = this.stateSubject.subscribe(state => {
      if (state !== null) {
        callback(state);
      }
    });
    return { unsubscribe: () => subscription.unsubscribe() };
  }

  /**
   * Subscribe to anomaly events
   */
  subscribeToAnomalies(callback: (anomaly: Anomaly) => void): { unsubscribe: () => void } {
    const subscription = this.anomalySubject.subscribe(callback);
    return { unsubscribe: () => subscription.unsubscribe() };
  }

  /**
   * Subscribe to threat events
   */
  subscribeToThreats(callback: (threat: ThreatDetection) => void): { unsubscribe: () => void } {
    const subscription = this.threatSubject.subscribe(callback);
    return { unsubscribe: () => subscription.unsubscribe() };
  }

  /**
   * Subscribe to status updates
   */
  subscribeToStatus(callback: (status: PipelineStatus) => void): { unsubscribe: () => void } {
    const subscription = this.statusSubject.subscribe(callback);
    return { unsubscribe: () => subscription.unsubscribe() };
  }

  /**
   * Get current visual state
   */
  getVisualState(): VisualState {
    return { ...this.visualState };
  }

  /**
   * Get a simplified representation of the current state for the neural activity indicator
   */
  getNeuralActivityState() {
    return {
      anomalyScore: this.visualState.anomalyScore,
      activeNeurons: this.visualState.neurons.filter(n => n.state === 'active').length,
      totalNeurons: this.visualState.neurons.length,
      isAnalysisActive: this.visualState.isAnalysisActive,
      activeThreats: this.visualState.activeThreats
    };
  }
}
