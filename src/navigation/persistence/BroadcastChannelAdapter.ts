import type { NavigableTransportAdapter, TransportMessage } from '../transport/types';

export interface BroadcastChannelOptions {
  channel?: string;
}

export class BroadcastChannelAdapter implements NavigableTransportAdapter {
  private bc: BroadcastChannel | null = null;
  private handlers = new Set<(msg: TransportMessage) => void>();
  private connected = false;
  private channelName: string;

  constructor(options: BroadcastChannelOptions = {}) {
    this.channelName = options.channel ?? 'sk-navigable';
  }

  connect(): Promise<void> {
    this.bc = new BroadcastChannel(this.channelName);
    this.bc.onmessage = (event) => {
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
    this.connected = true;
    return Promise.resolve();
  }

  send(message: TransportMessage): void {
    if (this.bc && this.connected) {
      this.bc.postMessage(message);
    }
  }

  onMessage(handler: (msg: TransportMessage) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect(): void {
    if (this.bc) {
      this.bc.close();
      this.bc = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
