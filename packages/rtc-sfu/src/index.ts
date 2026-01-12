import {
  Room,
  RoomEvent,
  createLocalAudioTrack,
  LocalAudioTrack,
  RemoteTrackPublication,
  Track,
  Participant,
} from 'livekit-client';

export type ConnectOptions = {
  tokenEndpoint: string;
  roomId: string;
  userId: string;
  displayName: string;
  role?: 'host' | 'moderator' | 'speaker' | 'guest';
};

export type TrackSubscribedCallback = (
  track: MediaStreamTrack,
  publication: RemoteTrackPublication,
  participant: Participant
) => void;

export type TrackUnsubscribedCallback = (
  track: MediaStreamTrack,
  publication: RemoteTrackPublication,
  participant: Participant
) => void;

export class RTCClient {
  private room = new Room();
  private localAudio: LocalAudioTrack | null = null;
  private onTrackSubscribedCb?: TrackSubscribedCallback;
  private onTrackUnsubscribedCb?: TrackUnsubscribedCallback;
  private listenerPosition: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isReconnecting = false;
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' =
    'disconnected';

  async connect(opts: ConnectOptions): Promise<void> {
    this.connectionState = 'connecting';
    this.reconnectAttempts = 0;

    try {
      const response = await fetch(opts.tokenEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          roomId: opts.roomId,
          userId: opts.userId,
          displayName: opts.displayName,
          role: opts.role ?? 'guest',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.statusText}`);
      }

      const { url, token } = await response.json();
      await this.room.connect(url, token);

      this.connectionState = 'connected';
      this.reconnectAttempts = 0; // Reset on successful connection

      // Setup event listeners
      this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        this.onTrackSubscribedCb?.(track.mediaStreamTrack, publication, participant);
      });

      this.room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        this.onTrackUnsubscribedCb?.(track.mediaStreamTrack, publication, participant);
      });

      // Handle disconnection for reconnection logic
      this.room.on(RoomEvent.Disconnected, () => {
        this.connectionState = 'disconnected';
        this.handleDisconnection(opts);
      });

      this.room.on(RoomEvent.Reconnecting, () => {
        this.connectionState = 'reconnecting';
      });

      this.room.on(RoomEvent.Reconnected, () => {
        this.connectionState = 'connected';
        this.reconnectAttempts = 0;
      });
    } catch (error) {
      this.connectionState = 'disconnected';
      throw error;
    }
  }

  private handleDisconnection(opts: ConnectOptions): void {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 16000);

    console.log(
      `[RTCClient] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    this.reconnectTimeout = setTimeout(async () => {
      try {
        await this.connect(opts);
        this.isReconnecting = false;
      } catch (error) {
        console.error(`[RTCClient] Reconnection attempt ${this.reconnectAttempts} failed:`, error);
        this.isReconnecting = false;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.handleDisconnection(opts);
        } else {
          console.error('[RTCClient] Max reconnection attempts reached. Giving up.');
        }
      }
    }, delay);
  }

  async publishMic(deviceId?: string): Promise<void> {
    const track = await createLocalAudioTrack({
      deviceId,
    });
    this.localAudio = track;
    await this.room.localParticipant.publishTrack(track);
  }

  stopMic(): void {
    this.localAudio?.stop();
    this.room.localParticipant.audioTrackPublications.forEach((pub) => {
      if (pub.track) {
        this.room.localParticipant.unpublishTrack(pub.track);
      }
    });
    this.localAudio = null;
  }

  onTrackSubscribed(cb: TrackSubscribedCallback): void {
    this.onTrackSubscribedCb = cb;
  }

  onTrackUnsubscribed(cb: TrackUnsubscribedCallback): void {
    this.onTrackUnsubscribedCb = cb;
  }

  // Legacy aliases for backwards compatibility
  onTrackAdded(cb: TrackSubscribedCallback): void {
    this.onTrackSubscribedCb = cb;
  }

  onTrackRemoved(cb: TrackUnsubscribedCallback): void {
    this.onTrackUnsubscribedCb = cb;
  }

  setListenerPosition(pos: { x: number; y: number; z: number }): void {
    this.listenerPosition = pos;
    // Spatial-Audio wird clientseitig mit GainNodes implementiert
    // Position wird an Zone-Engine übergeben
  }

  getListenerPosition(): { x: number; y: number; z: number } {
    return this.listenerPosition;
  }

  async screenshare(start = true): Promise<MediaStream | null> {
    if (!start) {
      // Stop screenshare
      this.room.localParticipant.videoTrackPublications.forEach((pub) => {
        if (pub.source === Track.Source.ScreenShare && pub.track) {
          this.room.localParticipant.unpublishTrack(pub.track);
        }
      });
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true, // Enable audio for screenshare
      });

      // Publish all tracks (video + audio)
      for (const track of stream.getTracks()) {
        await this.room.localParticipant.publishTrack(track, {
          source: track.kind === 'video' ? Track.Source.ScreenShare : Track.Source.Unknown,
        });
      }

      return stream;
    } catch (error) {
      console.error('Failed to start screen share:', error);
      return null;
    }
  }

  // Legacy alias for backwards compatibility
  async startScreenshare(): Promise<MediaStream | null> {
    return this.screenshare(true);
  }

  async stopScreenshare(): Promise<void> {
    await this.screenshare(false);
  }

  /**
   * Set subscription state for a specific participant
   * @param participantSid - Participant SID
   * @param subscribed - Whether to subscribe to tracks from this participant
   */
  setSubscribedFor(participantSid: string, subscribed: boolean): void {
    const participant = this.room.participants.get(participantSid);
    if (!participant) {
      console.warn(`[RTCClient] Participant ${participantSid} not found`);
      return;
    }

    participant.tracks.forEach((pub) => {
      pub.setSubscribed(subscribed);
    });
  }

  /**
   * Get all participants in the room
   */
  getParticipants(): Map<string, Participant> {
    return this.room.participants;
  }

  /**
   * Get participant by SID
   */
  getParticipant(sid: string): Participant | undefined {
    return this.room.participants.get(sid);
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.isReconnecting = false;
    this.connectionState = 'disconnected';
    this.room.disconnect();
  }

  /**
   * Get current connection state
   */
  getConnectionState(): 'disconnected' | 'connecting' | 'connected' | 'reconnecting' {
    return this.connectionState;
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connectionState === 'connected';
  }
}
