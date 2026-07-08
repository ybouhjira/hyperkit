import type { NavigableTransportAdapter, TransportMessage } from './types';

export interface WebSocketTransportOptions {
  url: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class WebSocketTransportAdapter implements NavigableTransportAdapter {
  private ws: WebSocket | null = null;
  private handlers = new Set<(msg: TransportMessage) => void>();
  private connected = false;
  private options: Required<WebSocketTransportOptions>;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: WebSocketTransportOptions) {
    this.options = {
      reconnect: true,
      reconnectInterval: 1000,
      maxReconnectAttempts: 10,
      ...options,
    };
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.options.url);
        this.ws.onopen = () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          resolve();
        };
        this.ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data as string) as TransportMessage;
            for (const handler of this.handlers) {
              handler(msg);
            }
          } catch {
            /* ignore parse errors */
          }
        };
        this.ws.onclose = () => {
          this.connected = false;
          if (
            this.options.reconnect &&
            this.reconnectAttempts < this.options.maxReconnectAttempts
          ) {
            this.reconnectAttempts++;
            this.reconnectTimer = setTimeout(
              () => {
                void this.connect();
              },
              this.options.reconnectInterval * Math.min(this.reconnectAttempts, 5)
            );
          }
        };
        this.ws.onerror = () => {
          if (!this.connected) reject(new Error('WebSocket connection failed'));
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  send(message: TransportMessage): void {
    if (this.ws && this.connected) {
      this.ws.send(JSON.stringify(message));
    }
  }

  onMessage(handler: (msg: TransportMessage) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    // Disable reconnect on our internal copy — never mutate the caller's object
    this.options = { ...this.options, reconnect: false };
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
