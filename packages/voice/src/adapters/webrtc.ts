import Peer from 'simple-peer';
import type { NetClient } from '@metaverse/net';

export interface WebRTCAdapterConfig {
  userId: string;
  roomId: string;
  serverUrl?: string;
  netClient?: NetClient;
}

export class WebRTCAdapter {
  private config: WebRTCAdapterConfig;
  private peers = new Map<string, Peer.Instance>();
  private localStream: MediaStream | null = null;
  private netClient: NetClient | null = null;

  constructor(config: WebRTCAdapterConfig) {
    this.config = config;
    this.netClient = config.netClient || null;
  }

  async connect(localStream: MediaStream): Promise<void> {
    this.localStream = localStream;

    if (this.netClient) {
      // Set up signaling through network client
      this.netClient.on('user-joined', (data: { userId: string }) => {
        if (data.userId !== this.config.userId) {
          this.createPeer(data.userId, false);
        }
      });

      this.netClient.on('signal', (data: { userId: string; signal: unknown }) => {
        const peer = this.peers.get(data.userId);
        if (peer) {
          peer.signal(data.signal);
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

    peer.on('signal', (signal) => {
      if (this.netClient) {
        this.netClient.on('signal', { userId, signal });
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

  private handleRemoteStream(userId: string, stream: MediaStream): void {
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

