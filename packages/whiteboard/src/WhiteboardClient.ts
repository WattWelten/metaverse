import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export class WhiteboardClient {
  private doc: Y.Doc;
  private provider: WebsocketProvider | null = null;
  private awareness: any;

  constructor() {
    this.doc = new Y.Doc();
  }

  connect(wsUrl: string, docId: string): void {
    this.provider = new WebsocketProvider(wsUrl, docId, this.doc);
    this.awareness = this.provider.awareness;
    console.log(`[Whiteboard] Connected to ${wsUrl} (doc: ${docId})`);
  }

  disconnect(): void {
    if (this.provider) {
      this.provider.destroy();
      this.provider = null;
    }
    console.log('[Whiteboard] Disconnected');
  }

  getDoc(): Y.Doc {
    return this.doc;
  }

  getAwareness(): any {
    return this.awareness;
  }

  isConnected(): boolean {
    return this.provider !== null;
  }
}
