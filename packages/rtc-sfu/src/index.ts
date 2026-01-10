import {
  Room,
  RoomEvent,
  createLocalAudioTrack,
  LocalAudioTrack,
  RemoteTrackPublication,
  Track,
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
  publication: RemoteTrackPublication
) => void;

export class RTCClient {
  private room = new Room();
  private localAudio: LocalAudioTrack | null = null;
  private onTrackSubscribedCb?: TrackSubscribedCallback;
  private onTrackUnsubscribedCb?: TrackSubscribedCallback;

  async connect(opts: ConnectOptions): Promise<void> {
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

    this.room.on(RoomEvent.TrackSubscribed, (track, publication) => {
      this.onTrackSubscribedCb?.(track.mediaStreamTrack, publication);
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track, publication) => {
      this.onTrackUnsubscribedCb?.(track.mediaStreamTrack, publication);
    });
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

  onTrackAdded(cb: TrackSubscribedCallback): void {
    this.onTrackSubscribedCb = cb;
  }

  onTrackRemoved(cb: TrackSubscribedCallback): void {
    this.onTrackUnsubscribedCb = cb;
  }

  setListenerPosition(_pos: { x: number; y: number; z: number }): void {
    // Spatial-Audio wird clientseitig mit GainNodes implementiert
    // Position wird an Zone-Engine übergeben
  }

  async startScreenshare(): Promise<MediaStream | null> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        await this.room.localParticipant.publishTrack(videoTrack, {
          source: Track.Source.ScreenShare,
        });
        return stream;
      }
      return null;
    } catch (error) {
      console.error('Failed to start screen share:', error);
      return null;
    }
  }

  async stopScreenshare(): Promise<void> {
    this.room.localParticipant.videoTrackPublications.forEach((pub) => {
      if (pub.source === Track.Source.ScreenShare && pub.track) {
        this.room.localParticipant.unpublishTrack(pub.track);
      }
    });
  }

  disconnect(): void {
    this.room.disconnect();
  }
}
