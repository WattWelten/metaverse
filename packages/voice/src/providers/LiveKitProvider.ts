import { Room, RoomEvent, createLocalAudioTrack, Track } from 'livekit-client';

import { IVoiceProvider, JoinOptions, DeviceInfo, ParticipantInfo } from './IVoiceProvider.js';

export class LiveKitProvider implements IVoiceProvider {
  private room: Room | null = null;
  private stateCb?: (s: 'idle' | 'connecting' | 'connected' | 'error', e?: unknown) => void;
  private partCb?: (n: number) => void;
  private partUpdateCb?: (participants: ParticipantInfo[]) => void;
  private activeSpeakersCb?: (speakerIds: string[]) => void;
  private screenCb?: (participantId: string, stream: MediaStream | null) => void;
  private dataCb?: (data: string, participantId: string) => void;
  private localScreenTrack: MediaStreamTrack | null = null;

  onState(cb: (s: 'idle' | 'connecting' | 'connected' | 'error', e?: unknown) => void): void {
    this.stateCb = cb;
  }

  onParticipantChange(cb: (n: number) => void): void {
    this.partCb = cb;
  }

  async join(opts: JoinOptions): Promise<void> {
    this.stateCb?.('connecting');
    try {
      this.room = new Room();
      this.room.on(RoomEvent.ConnectionStateChanged, (state) => {
        if (state === 'connected') {
          this.stateCb?.('connected');
        } else if (state === 'disconnected') {
          this.stateCb?.('idle');
        } else if (state === 'reconnecting') {
          this.stateCb?.('connecting');
        }
      });
      this.room.on(RoomEvent.ParticipantConnected, () => {
        this.partCb?.(this.room?.numParticipants ?? 0);
        this.notifyParticipantUpdate();
      });
      this.room.on(RoomEvent.ParticipantDisconnected, () => {
        this.partCb?.(this.room?.numParticipants ?? 0);
        this.notifyParticipantUpdate();
      });
      this.room.on(RoomEvent.TrackMuted, () => {
        this.notifyParticipantUpdate();
      });
      this.room.on(RoomEvent.TrackUnmuted, () => {
        this.notifyParticipantUpdate();
      });
      this.room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const speakerIds = speakers.map((s) => s.identity);
        this.activeSpeakersCb?.(speakerIds);
      });

      // Setup data channel for stage moderation
      this.room.on(RoomEvent.DataReceived, (payload, participant) => {
        if (payload instanceof Uint8Array) {
          const decoder = new TextDecoder();
          const data = decoder.decode(payload);
          this.dataCb?.(data, participant?.identity || 'unknown');
        } else if (typeof payload === 'string') {
          this.dataCb?.(payload, participant?.identity || 'unknown');
        }
      });

      this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === 'video' && publication.source === Track.Source.ScreenShare) {
          const stream = new MediaStream([track.mediaStreamTrack]);
          this.screenCb?.(participant.identity, stream);
        }
      });
      this.room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        if (track.kind === 'video' && publication.source === Track.Source.ScreenShare) {
          this.screenCb?.(participant.identity, null);
        }
      });
      await this.room.connect(opts.url, opts.token);
      const track = await createLocalAudioTrack();
      await this.room.localParticipant.publishTrack(track);
      this.stateCb?.('connected');
    } catch (error) {
      this.stateCb?.('error', error);
      throw error;
    }
  }

  async leave(): Promise<void> {
    await this.room?.disconnect();
    this.room = null;
    this.stateCb?.('idle');
  }

  async mute(muted: boolean): Promise<void> {
    if (!this.room?.localParticipant) return;
    // Get first audio track publication
    const audioPublications = Array.from(
      this.room.localParticipant.audioTrackPublications.values()
    );
    const mic = audioPublications[0];
    if (mic) {
      if (muted) {
        await mic.mute();
      } else {
        await mic.unmute();
      }
    }
  }

  async listDevices(): Promise<DeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === 'audioinput' || d.kind === 'audiooutput')
      .map((d) => ({
        id: d.deviceId,
        label: d.label,
        kind: d.kind as 'audioinput' | 'audiooutput',
      }));
  }

  async setInputDevice(deviceId: string): Promise<void> {
    await this.room?.switchActiveDevice('audioinput', deviceId);
  }

  async setOutputDevice(deviceId: string): Promise<void> {
    await this.room?.switchActiveDevice('audiooutput', deviceId);
  }

  getParticipants(): ParticipantInfo[] {
    if (!this.room) return [];
    const participants: ParticipantInfo[] = [];

    // Add local participant
    if (this.room.localParticipant) {
      const localPart = this.room.localParticipant;
      const audioPub = Array.from(localPart.audioTrackPublications.values())[0];
      participants.push({
        id: localPart.sid,
        identity: localPart.identity,
        name: localPart.name,
        isSpeaking: this.room.activeSpeakers.some((s) => s === localPart),
        isMuted: audioPub?.isMuted ?? false,
        role: localPart.permissions?.canPublish ? 'host' : 'participant',
      });
    }

    // Add remote participants
    this.room.remoteParticipants.forEach((participant) => {
      const audioPub = Array.from(participant.audioTrackPublications.values())[0];
      participants.push({
        id: participant.sid,
        identity: participant.identity,
        name: participant.name,
        isSpeaking: this.room?.activeSpeakers.some((s) => s === participant) ?? false,
        isMuted: audioPub?.isMuted ?? false,
        role: participant.permissions?.canPublish ? 'host' : 'participant',
      });
    });

    return participants;
  }

  onParticipantUpdate(cb: (participants: ParticipantInfo[]) => void): void {
    this.partUpdateCb = cb;
  }

  onActiveSpeakers(cb: (speakerIds: string[]) => void): void {
    this.activeSpeakersCb = cb;
  }

  private notifyParticipantUpdate(): void {
    if (this.partUpdateCb) {
      this.partUpdateCb(this.getParticipants());
    }
  }

  setPeerPosition(participantId: string, x: number, y: number, z: number): void {
    if (!this.room) return;

    // Find participant
    const participant = this.room.remoteParticipants.get(participantId);
    if (!participant) return;

    // Update spatial audio position for all audio tracks of this participant
    participant.audioTrackPublications.forEach((publication) => {
      if (publication.track) {
        interface AudioTrackWithPanner {
          mediaStreamTrack?: MediaStreamTrack & {
            kind?: string;
            pannerNode?: {
              positionX?: { value: number };
              positionY?: { value: number };
              positionZ?: { value: number };
            };
          };
        }
        const audioTrack = publication.track as AudioTrackWithPanner;
        // LiveKit uses AudioTrack with pannerNode for spatial audio
        if (audioTrack.mediaStreamTrack && audioTrack.mediaStreamTrack.kind === 'audio') {
          // Get the audio element or panner node
          const audioElement = audioTrack.mediaStreamTrack;
          // Update position via Web Audio API if available
          if (audioElement.pannerNode) {
            if (audioElement.pannerNode.positionX) {
              audioElement.pannerNode.positionX.value = x;
            }
            if (audioElement.pannerNode.positionY) {
              audioElement.pannerNode.positionY.value = y;
            }
            if (audioElement.pannerNode.positionZ) {
              audioElement.pannerNode.positionZ.value = z;
            }
          }
        }
      }
    });
  }

  async startScreenShare(): Promise<MediaStream | null> {
    if (!this.room?.localParticipant) return null;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        this.localScreenTrack = videoTrack;
        await this.room.localParticipant.publishTrack(videoTrack, {
          source: Track.Source.ScreenShare,
        });
        videoTrack.onended = () => {
          this.stopScreenShare();
        };
        return stream;
      }
      return null;
    } catch (error) {
      console.error('Failed to start screen share:', error);
      return null;
    }
  }

  async stopScreenShare(): Promise<void> {
    if (!this.room?.localParticipant || !this.localScreenTrack) return;
    try {
      await this.room.localParticipant.unpublishTrack(this.localScreenTrack);
      this.localScreenTrack.stop();
      this.localScreenTrack = null;
    } catch (error) {
      console.error('Failed to stop screen share:', error);
    }
  }

  onRemoteScreen(cb: (participantId: string, stream: MediaStream | null) => void): void {
    this.screenCb = cb;
  }

  async sendData(data: string): Promise<void> {
    if (!this.room?.localParticipant) return;
    try {
      const encoder = new TextEncoder();
      const payload = encoder.encode(data);
      await this.room.localParticipant.publishData(payload, {
        reliable: true,
        topic: 'stage-moderation',
      });
    } catch (error) {
      console.error('Failed to send data:', error);
      throw error;
    }
  }

  onData(cb: (data: string, participantId: string) => void): void {
    this.dataCb = cb;
  }
}
