import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

export class WhiteboardClient {
  doc: Y.Doc;
  provider: WebsocketProvider;

  constructor(wsUrl: string, docId: string) {
    this.doc = new Y.Doc();
    this.provider = new WebsocketProvider(wsUrl, docId, this.doc, { connect: true });
  }

  destroy(): void {
    this.provider.disconnect();
    this.doc.destroy();
  }
}
