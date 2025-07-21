/**
 * Service for interacting with the local Ollama instance running Llama 3
 */

// Default Ollama API URL
const OLLAMA_API_URL = 'http://localhost:11434/api';

export interface OllamaGenerateParams {
  model: string;
  prompt: string;
  system?: string;
  template?: string;
  context?: number[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    stop?: string[];
    num_ctx?: number;
  };
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaEmbeddingParams {
  model: string;
  prompt: string;
}

export interface OllamaEmbeddingResponse {
  embedding: number[];
}

export interface OllamaModelInfo {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

export interface OllamaModelsResponse {
  models: OllamaModelInfo[];
}

/**
 * Service for interacting with a local Ollama instance
 */
export class OllamaService {
  private baseUrl: string;
  private defaultModel: string;
  
  constructor(baseUrl: string = OLLAMA_API_URL, defaultModel: string = 'llama3') {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }
  
  /**
   * Generate a response from the model
   */
  async generate(params: Partial<OllamaGenerateParams>): Promise<OllamaResponse> {
    const url = `${this.baseUrl}/generate`;
    
    const requestBody: OllamaGenerateParams = {
      model: params.model || this.defaultModel,
      prompt: params.prompt || '',
      system: params.system,
      template: params.template,
      context: params.context,
      stream: params.stream,
      options: params.options,
    };
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error generating from Ollama:', error);
      throw error;
    }
  }
  
  /**
   * Generate a response from the model with streaming
   */
  async generateStream(params: Partial<OllamaGenerateParams>, onChunk: (chunk: OllamaResponse) => void): Promise<void> {
    const url = `${this.baseUrl}/generate`;
    
    const requestBody: OllamaGenerateParams = {
      model: params.model || this.defaultModel,
      prompt: params.prompt || '',
      stream: true, // Force streaming to be true
      system: params.system,
      template: params.template,
      context: params.context,
      options: params.options,
    };
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate: ${response.status} ${response.statusText}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get reader from response');
      }
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Decode the chunk and add it to the buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete JSON objects in the buffer
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const jsonStr = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          if (jsonStr.trim()) {
            try {
              const chunk = JSON.parse(jsonStr) as OllamaResponse;
              onChunk(chunk);
              
              if (chunk.done) {
                // Last chunk received
                return;
              }
            } catch (error) {
              console.error('Error parsing JSON chunk:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating stream from Ollama:', error);
      throw error;
    }
  }
  
  /**
   * Create embedding vectors from text
   */
  async createEmbedding(params: OllamaEmbeddingParams): Promise<OllamaEmbeddingResponse> {
    const url = `${this.baseUrl}/embeddings`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create embedding: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating embedding from Ollama:', error);
      throw error;
    }
  }
  
  /**
   * List available models
   */
  async listModels(): Promise<OllamaModelsResponse> {
    const url = `${this.baseUrl}/tags`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to list models: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error listing models from Ollama:', error);
      throw error;
    }
  }
  
  /**
   * Check if the Ollama server is running
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.listModels();
      return Array.isArray(response.models);
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
let instance: OllamaService | null = null;

/**
 * Get the global instance of OllamaService
 */
export function getOllamaService(
  baseUrl: string = OLLAMA_API_URL, 
  defaultModel: string = 'llama3'
): OllamaService {
  if (!instance) {
    instance = new OllamaService(baseUrl, defaultModel);
  }
  return instance;
}
