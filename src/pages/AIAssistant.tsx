import React, { useState, useRef, useEffect } from 'react';
import { useOllama } from '@/hooks/useOllama';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { AlertSystem } from '@/lib/neuromorphic/alert-system';
import { useNotifications } from '@/components/alerts/NotificationProvider';
import { Brain, Cpu, MessageSquare, AlertTriangle, Send, Wand2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

const systemPrompts = {
  security: 'You are a cybersecurity assistant. Focus on network security, threat detection, and defensive strategies. Keep answers precise and security-focused.',
  analysis: 'You are a network traffic analysis expert. Help analyze anomalies, patterns, and security concerns in network data. Provide technical, data-driven insights.',
  general: 'You are an assistant for the KenshiBrainWatch neuromorphic network security system. Provide helpful, accurate responses about network security, data analysis, and the system functionality.'
};

/**
 * AI Assistant page that integrates with local Ollama running Llama 3
 */
const AIAssistant: React.FC = () => {
  const { toast } = useToast();
  const { alertSystem } = useNotifications();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [assistantMode, setAssistantMode] = useState<'security' | 'analysis' | 'general'>('general');
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    isReady,
    isLoading,
    error,
    availableModels,
    selectedModel,
    streamingResponse,
    setSelectedModel,
    generateStreamingText,
    cancelGeneration
  } = useOllama({ defaultModel: 'llama3' });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingResponse]);
  
  // Show error notification if Ollama connection fails
  useEffect(() => {
    if (error) {
      toast({
        title: 'Ollama Error',
        description: error,
        variant: 'destructive'
      });
      
      // Only show toast notification for errors as we don't have direct access to create alerts
      toast({
        title: 'AI Assistant Error',
        description: `Failed to connect to Ollama: ${error}`,
        variant: 'destructive',
        duration: 5000
      });
    }
  }, [error, toast, alertSystem]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || !isReady || isLoading) {
      return;
    }
    
    const userMessage: Message = {
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    try {
      // Add temporary placeholder for assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      }]);
      
      const systemPrompt = useCustomPrompt 
        ? customSystemPrompt 
        : systemPrompts[assistantMode];
      
      await generateStreamingText(inputText, systemPrompt);
    } catch (err) {
      console.error('Error generating response:', err);
    }
  };
  
  // Update last assistant message with streaming response
  useEffect(() => {
    if (streamingResponse !== null) {
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
          newMessages[newMessages.length - 1].content = streamingResponse;
        }
        return newMessages;
      });
    }
  }, [streamingResponse]);
  
  // Clear the conversation
  const handleClearConversation = () => {
    setMessages([]);
  };
  
  // Render the markdown content with code highlighting
  const renderMarkdown = (content: string) => {
    // Define components for markdown rendering
    const components = {
      code: (props: any) => {
        const { className, children } = props;
        // Check if this is an inline code block or a code block with language
        const match = /language-(\w+)/.exec(className || '');
        const inline = !match;
        
        return !inline && match ? (
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
    };

    return (
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Chat Interface */}
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6" />
                <CardTitle>Llama 3 AI Assistant</CardTitle>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Cpu className="h-4 w-4" />
                {isReady ? 'Connected to Ollama' : 'Connecting...'}
              </Badge>
            </div>
            <CardDescription>
              Interact with locally running Llama 3 via Ollama
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="bg-muted/50 rounded-lg mb-4 p-2">
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">Current mode: {assistantMode}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
                  {isExpanded ? <X className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
                </Button>
              </div>
              
              {isExpanded && (
                <div className="p-2 border-t">
                  <Tabs defaultValue="preset" className="w-full">
                    <TabsList className="grid grid-cols-2 mb-2">
                      <TabsTrigger value="preset">Preset Modes</TabsTrigger>
                      <TabsTrigger value="custom">Custom Prompt</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="preset">
                      <Select value={assistantMode} onValueChange={(value: any) => setAssistantMode(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Assistant Modes</SelectLabel>
                            <SelectItem value="security">Security Expert</SelectItem>
                            <SelectItem value="analysis">Network Analyst</SelectItem>
                            <SelectItem value="general">General Assistant</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-2">
                        {systemPrompts[assistantMode]}
                      </p>
                    </TabsContent>
                    
                    <TabsContent value="custom">
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Enter a custom system prompt..."
                          value={customSystemPrompt}
                          onChange={(e) => setCustomSystemPrompt(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <div className="flex items-center">
                          <Button
                            variant={useCustomPrompt ? "default" : "outline"} 
                            size="sm"
                            onClick={() => setUseCustomPrompt(!useCustomPrompt)}
                          >
                            {useCustomPrompt ? "Using Custom" : "Use Custom"}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-4">
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Available Models</SelectLabel>
                          {availableModels.map(model => (
                            <SelectItem key={model.name} value={model.name}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-[400px] overflow-y-auto border rounded-lg p-4 mb-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Brain className="h-12 w-12 mb-2 opacity-50" />
                  <p>No messages yet. Start a conversation with the AI assistant.</p>
                  <p className="text-sm mt-2">Using local Llama 3 via Ollama</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <div>{message.content}</div>
                        ) : (
                          renderMarkdown(message.content || 'Thinking...')
                        )}
                        <div className={`text-xs mt-1 ${
                          message.role === 'user' 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message here..."
                disabled={!isReady || isLoading}
              />
              <Button 
                type="submit" 
                disabled={!isReady || isLoading || !inputText.trim()}
              >
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <span className="animate-pulse">Generating...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Send className="h-4 w-4" /> Send
                  </span>
                )}
              </Button>
              {isLoading && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={cancelGeneration}
                >
                  <X className="h-4 w-4 mr-1" /> Stop
                </Button>
              )}
            </form>
          </CardContent>
          
          <CardFooter className="border-t pt-4 flex justify-between">
            <div className="text-xs text-muted-foreground">
              {error ? (
                <div className="flex items-center text-destructive">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              ) : (
                <div>Using {selectedModel} model from local Ollama</div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearConversation}>
              Clear Conversation
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistant;
