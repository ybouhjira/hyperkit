import type { NavigableTransportAdapter, TransportMessage } from './types';

export class MessagePortTransportAdapter implements NavigableTransportAdapter {
  private handlers = new Set<(msg: TransportMessage) => void>();
  private connected = false;
  private port: MessagePort;

  constructor(port: MessagePort) {
    this.port = port;
  }

  connect(): Promise<void> {
    this.port.onmessage = (event) => {
      if (event.data != null && typeof event.data === 'object' && 'type' in event.data) {
        const msg = event.data as TransportMessage;
        for (const handler of this.handlers) {
          try {
            handler(msg);
          } catch {
            /* swallow */
          }
        }
      }
    };
    this.port.start();
    this.connected = true;
    return Promise.resolve();
  }

  send(message: TransportMessage): void {
    if (this.connected) {
      this.port.postMessage(message);
    }
  }

  onMessage(handler: (msg: TransportMessage) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect(): void {
    this.port.close();
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
