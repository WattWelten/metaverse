import { Reconnector } from './ws/Reconnector.js';
import { ToolApi } from './tools/ToolApi.js';

export interface AgentBridgeConfig {
  baseUrl: string;
  wsUrl: string;
  apiKey: string;
  tenant?: string;
  sessionId?: string;
  userId?: string;
}

export type AgentEvent =
  | 'user_speech'
  | 'agent_speech'
  | 'tool_call'
  | 'tool_result'
  | 'error'
  | 'connected'
  | 'disconnected';

export interface AgentMessage {
  type: AgentEvent;
  data: unknown;
  timestamp: Date;
}

export class AgentBridge {
  private config: AgentBridgeConfig;
  private reconnector: Reconnector;
  private toolApi: ToolApi;
  private ws: WebSocket | null = null;
  private eventHandlers = new Map<AgentEvent, Set<(data: unknown) => void>>();
  private enabled = false;

  constructor(config: AgentBridgeConfig) {
    this.config = config;
    this.reconnector = new Reconnector(() => this.connect());
    this.toolApi = new ToolApi(config.baseUrl, config.apiKey);
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = new URL(this.config.wsUrl);
      wsUrl.searchParams.set('apiKey', this.config.apiKey);
      if (this.config.sessionId) {
        wsUrl.searchParams.set('sessionId', this.config.sessionId);
      }
      if (this.config.userId) {
        wsUrl.searchParams.set('userId', this.config.userId);
      }
      if (this.config.tenant) {
        wsUrl.searchParams.set('tenant', this.config.tenant);
      }

      this.ws = new WebSocket(wsUrl.toString());

      this.ws.onopen = () => {
        this.enabled = true;
        this.emit('connected', null);
        this.reconnector.onConnect();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: AgentMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        this.enabled = false;
        this.emit('disconnected', null);
        this.reconnector.onDisconnect();
      };
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }

  private handleMessage(message: AgentMessage): void {
    this.emit(message.type, message.data);
  }

  disconnect(): void {
    this.reconnector.stop();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.enabled = false;
  }

  async sendText(text: string): Promise<void> {
    if (!this.enabled || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('AgentBridge is not connected');
    }

    const message: AgentMessage = {
      type: 'user_speech',
      data: { text },
      timestamp: new Date(),
    };

    this.ws.send(JSON.stringify(message));
  }

  async startAudioStream(stream: MediaStream): Promise<void> {
    // Audio stream handling would go here
    // For MVP, we'll use text-based communication
    console.log('Audio stream started (not yet implemented)');
  }

  stopAudioStream(): void {
    // Stop audio stream
    console.log('Audio stream stopped');
  }

  async inference(messages: Array<{ role: string; content: string }>): Promise<unknown> {
    const response = await fetch(`${this.config.baseUrl}/inference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`Inference failed: ${response.statusText}`);
    }

    return response.json();
  }

  async invokeTool(toolId: string, params: Record<string, unknown>): Promise<unknown> {
    return this.toolApi.invoke(toolId, params);
  }

  on(event: AgentEvent, callback: (data: unknown) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(callback);

    return () => {
      this.eventHandlers.get(event)?.delete(callback);
    };
  }

  private emit(event: AgentEvent, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // No-Op implementation when AI_ENABLED=false
  static createNoOp(): AgentBridge {
    const bridge = new AgentBridge({
      baseUrl: '',
      wsUrl: '',
      apiKey: '',
    });
    bridge.enabled = false;
    return bridge;
  }
}

