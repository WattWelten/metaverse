import Peer from 'simple-peer';

export interface WebRTCAdapterConfig {
  userId: string;
  roomId: string;
  serverUrl?: string;
  netClient?: {
    on: (event: string, callback: (data: unknown) => void) => void;
  };
}

export class WebRTCAdapter {
  private config: WebRTCAdapterConfig;
  private peers = new Map<string, Peer.Instance>();
  private localStream: MediaStream | null = null;
  private netClient: WebRTCAdapterConfig['netClient'] | null = null;

  constructor(config: WebRTCAdapterConfig) {
    this.config = config;
    this.netClient = config.netClient || null;
  }

  async connect(localStream: MediaStream): Promise<void> {
    this.localStream = localStream;

    if (this.netClient) {
      // Set up signaling through network client (WebRTC Signalling Pattern)
      this.netClient.on('user-joined', (data: unknown) => {
        const userData = data as { userId: string; socketId?: string };
        if (userData.userId !== this.config.userId) {
          // Erstelle Peer-Verbindung für neuen User
          this.createPeer(userData.userId, true); // Initiator = true für neuen User
        }
      });

      // Empfange Signalisierungs-Daten vom Server
      this.netClient.on('webrtc-signal', (data: unknown) => {
        const signalData = data as { 
          from: string; 
          to: string; 
          signal: Peer.SignalData;
          type: 'offer' | 'answer' | 'candidate';
        };
        
        // Nur Signale für diesen User verarbeiten
        if (signalData.to !== this.config.userId) return;
        
        const peer = this.peers.get(signalData.from);
        if (peer) {
          peer.signal(signalData.signal);
        } else if (signalData.type === 'offer') {
          // Neuer Peer für eingehendes Offer
          this.createPeer(signalData.from, false);
          const newPeer = this.peers.get(signalData.from);
          if (newPeer) {
            newPeer.signal(signalData.signal);
          }
        }
      });
    }
  }

  private createPeer(userId: string, initiator: boolean): void {
    if (!this.localStream) return;

    const peer = new Peer({
      initiator,
      trickle: false,
      stream: this.localStream,
    });

    peer.on('signal', (signal: Peer.SignalData) => {
      if (this.netClient && 'emit' in this.netClient && typeof this.netClient.emit === 'function') {
        // Sende Signalisierungs-Daten über Socket.io
        // Pattern aus threejs-webrtc: Signal wird als Event gesendet
        this.netClient.emit('webrtc-signal', {
          from: this.config.userId,
          to: userId,
          signal,
          type: initiator ? 'offer' : 'answer',
        });
      }
    });

    peer.on('stream', (remoteStream) => {
      // Handle remote stream - will be processed by SpatialAudioManager
      this.handleRemoteStream(userId, remoteStream);
    });

    peer.on('error', (error) => {
      console.error(`Peer error for ${userId}:`, error);
    });

    this.peers.set(userId, peer);
  }

  private handleRemoteStream(userId: string, _stream: MediaStream): void {
    // This will be connected to SpatialAudioManager
    console.log(`Received stream from ${userId}`);
  }

  disconnect(): void {
    this.peers.forEach((peer) => {
      peer.destroy();
    });
    this.peers.clear();
  }

  getPeers(): Map<string, Peer.Instance> {
    return this.peers;
  }
}

