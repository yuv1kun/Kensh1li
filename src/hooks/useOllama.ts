import { useState, useEffect, useCallback } from 'react';
import { getOllamaService, OllamaResponse, OllamaModelInfo } from '@/lib/ai/ollama-service';

interface UseOllamaProps {
  defaultModel?: string;
}

interface UseOllamaReturn {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  availableModels: OllamaModelInfo[];
  selectedModel: string;
  response: string | null;
  streamingResponse: string | null;
  setSelectedModel: (model: string) => void;
  generateText: (prompt: string, systemPrompt?: string) => Promise<string>;
  generateStreamingText: (prompt: string, systemPrompt?: string) => Promise<void>;
  cancelGeneration: () => void;
}

/**
 * React hook for interacting with the Ollama service
 */
export function useOllama({ defaultModel = 'llama3' }: UseOllamaProps = {}): UseOllamaReturn {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<OllamaModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(defaultModel);
  const [response, setResponse] = useState<string | null>(null);
  const [streamingResponse, setStreamingResponse] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Initialize and check Ollama service
  useEffect(() => {
    async function initOllama() {
      try {
        const ollamaService = getOllamaService();
        const isHealthy = await ollamaService.checkHealth();
        
        if (isHealthy) {
          const modelsResponse = await ollamaService.listModels();
          setAvailableModels(modelsResponse.models || []);
          
          // Set the default model if it exists, otherwise use the first available model
          if (modelsResponse.models && modelsResponse.models.length > 0) {
            const modelExists = modelsResponse.models.some(
              model => model.name === defaultModel
            );
            
            if (!modelExists && modelsResponse.models.length > 0) {
              setSelectedModel(modelsResponse.models[0].name);
            }
          }
          
          setIsReady(true);
          setError(null);
        } else {
          setError('Ollama service is not available. Make sure Ollama is running locally.');
          setIsReady(false);
        }
      } catch (err) {
        console.error('Failed to initialize Ollama:', err);
        setError('Failed to connect to Ollama. Check if it\'s running on localhost:11434.');
        setIsReady(false);
      }
    }

    initOllama();
  }, [defaultModel]);

  // Generate text with the selected model
  const generateText = useCallback(async (
    prompt: string,
    systemPrompt?: string
  ): Promise<string> => {
    if (!isReady) {
      throw new Error('Ollama service is not ready');
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const ollamaService = getOllamaService();
      const result = await ollamaService.generate({
        model: selectedModel,
        prompt,
        system: systemPrompt,
        options: {
          temperature: 0.7,
        }
      });

      setResponse(result.response);
      setIsLoading(false);
      return result.response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate text with Ollama';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  }, [isReady, selectedModel]);

  // Generate streaming text with the selected model
  const generateStreamingText = useCallback(async (
    prompt: string,
    systemPrompt?: string
  ): Promise<void> => {
    if (!isReady) {
      throw new Error('Ollama service is not ready');
    }

    setIsLoading(true);
    setError(null);
    setStreamingResponse('');

    try {
      const controller = new AbortController();
      setAbortController(controller);

      const ollamaService = getOllamaService();
      
      let fullResponse = '';
      
      await ollamaService.generateStream(
        {
          model: selectedModel,
          prompt,
          system: systemPrompt,
          options: {
            temperature: 0.7,
          }
        },
        (chunk: OllamaResponse) => {
          if (controller.signal.aborted) {
            return;
          }
          
          fullResponse += chunk.response;
          setStreamingResponse(fullResponse);
          
          if (chunk.done) {
            setIsLoading(false);
          }
        }
      );
      
      setAbortController(null);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Text generation was cancelled');
      } else {
        const errorMessage = err.message || 'Failed to generate streaming text with Ollama';
        setError(errorMessage);
      }
      setIsLoading(false);
      setAbortController(null);
    }
  }, [isReady, selectedModel]);

  // Cancel an ongoing generation
  const cancelGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      setError('Text generation was cancelled');
    }
  }, [abortController]);

  return {
    isReady,
    isLoading,
    error,
    availableModels,
    selectedModel,
    response,
    streamingResponse,
    setSelectedModel,
    generateText,
    generateStreamingText,
    cancelGeneration
  };
}
