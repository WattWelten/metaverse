import type { NetClientForVoice } from '@metaverse/net';
import Peer from 'simple-peer';

export interface WebRTCAdapterConfig {
  userId: string;
  roomId: string;
  serverUrl?: string;
  netClient?: NetClientForVoice;
}

export class WebRTCAdapter {
  private config: WebRTCAdapterConfig;
  private peers = new Map<string, Peer.Instance>();
  private localStream: MediaStream | null = null;
  private netClient: WebRTCAdapterConfig['netClient'] | null = null;
  private eventCleanups: Array<() => void> = [];

  constructor(config: WebRTCAdapterConfig) {
    this.config = config;
    this.netClient = config.netClient || null;
  }

  async connect(localStream: MediaStream): Promise<void> {
    this.localStream = localStream;

    if (this.netClient) {
      // Set up signaling through network client (WebRTC Signalling Pattern)
      const onUserJoined = async (data: unknown) => {
        const userData = data as { userId: string; socketId?: string };
        if (userData.userId !== this.config.userId) {
          // Erstelle Peer-Verbindung für neuen User
          try {
            await this.createPeer(userData.userId, true); // Initiator = true für neuen User
          } catch (error) {
            console.error(`Failed to create peer for ${userData.userId}:`, error);
          }
        }
      };

      // Empfange Signalisierungs-Daten vom Server
      const onWebRTCSignal = async (data: unknown) => {
        const signalData = data as {
          from: string;
          to: string;
          signal: Peer.SignalData;
          type: 'offer' | 'answer' | 'candidate';
        };

        // Nur Signale für diesen User verarbeiten
        if (signalData.to !== this.config.userId) return;

        let peer = this.peers.get(signalData.from);

        if (!peer && signalData.type === 'offer') {
          // Neuer Peer für eingehendes Offer - erstelle synchron
          try {
            peer = await this.createPeer(signalData.from, false);
          } catch (error) {
            console.error(
              `Failed to create peer for incoming offer from ${signalData.from}:`,
              error
            );
            return;
          }
        }

        if (peer) {
          peer.signal(signalData.signal);
        }
      };

      this.netClient.on('user-joined', onUserJoined);
      this.netClient.on('webrtc-signal', onWebRTCSignal);

      // Cleanup-Funktionen speichern
      this.eventCleanups.push(
        () => this.netClient?.off?.('user-joined', onUserJoined),
        () => this.netClient?.off?.('webrtc-signal', onWebRTCSignal)
      );
    }
  }

  private createPeer(userId: string, initiator: boolean): Promise<Peer.Instance> {
    return new Promise((resolve, reject) => {
      if (!this.localStream) {
        reject(new Error('No local stream available'));
        return;
      }

      // Check if peer already exists
      const existingPeer = this.peers.get(userId);
      if (existingPeer) {
        resolve(existingPeer);
        return;
      }

      const peer = new Peer({
        initiator,
        trickle: false,
        stream: this.localStream,
      });

      peer.on('signal', (signal: Peer.SignalData) => {
        if (this.netClient?.emit) {
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
        this.peers.delete(userId);
        reject(error);
      });

      peer.on('connect', () => {
        console.log(`Peer connected: ${userId}`);
      });

      this.peers.set(userId, peer);
      resolve(peer);
    });
  }

  private handleRemoteStream(userId: string, _stream: MediaStream): void {
    // This will be connected to SpatialAudioManager
    console.log(`Received stream from ${userId}`);
  }

  disconnect(): void {
    // Cleanup event listeners
    this.eventCleanups.forEach((cleanup) => cleanup());
    this.eventCleanups = [];

    // Destroy all peers
    this.peers.forEach((peer) => {
      peer.destroy();
    });
    this.peers.clear();

    // Stop local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.localStream = null;
    }
  }

  getPeers(): Map<string, Peer.Instance> {
    return this.peers;
  }
}
