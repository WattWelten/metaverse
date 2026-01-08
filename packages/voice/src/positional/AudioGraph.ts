// AudioContext and related types are from Web Audio API (browser global)

export interface AudioSource {
  id: string;
  source: AudioBufferSourceNode | MediaStreamAudioSourceNode;
  panner: PannerNode;
  gain: GainNode;
  position: { x: number; y: number; z: number };
}

export class AudioGraph {
  private audioContext: AudioContext;
  private listener: AudioListener | null = null;
  private sources = new Map<string, AudioSource>();
  private masterGain: GainNode;

  constructor() {
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
  }

  setListenerPosition(x: number, y: number, z: number): void {
    if (!this.listener) {
      this.listener = this.audioContext.listener;
    }
    if (this.listener) {
      this.listener.positionX.value = x;
      this.listener.positionY.value = y;
      this.listener.positionZ.value = z;
    }
  }

  setListenerOrientation(
    forwardX: number,
    forwardY: number,
    forwardZ: number,
    upX: number,
    upY: number,
    upZ: number
  ): void {
    if (!this.listener) {
      this.listener = this.audioContext.listener;
    }
    if (this.listener) {
      this.listener.forwardX.value = forwardX;
      this.listener.forwardY.value = forwardY;
      this.listener.forwardZ.value = forwardZ;
      this.listener.upX.value = upX;
      this.listener.upY.value = upY;
      this.listener.upZ.value = upZ;
    }
  }

  addSource(
    id: string,
    stream: MediaStream | AudioBuffer,
    position: { x: number; y: number; z: number }
  ): AudioSource {
    // Create appropriate source node based on input type
    let source: AudioBufferSourceNode | MediaStreamAudioSourceNode;

    if (stream instanceof MediaStream) {
      // For MediaStream (voice from remote peers)
      source = this.audioContext.createMediaStreamSource(stream);
    } else {
      // For AudioBuffer (test tones, ambient audio)
      source = this.audioContext.createBufferSource();
      if (stream instanceof AudioBuffer) {
        (source as AudioBufferSourceNode).buffer = stream;
        (source as AudioBufferSourceNode).loop = true;
        (source as AudioBufferSourceNode).start();
      }
    }

    const panner = this.audioContext.createPanner();
    const gain = this.audioContext.createGain();

    // HRTF spatial audio configuration
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'exponential';
    panner.refDistance = 1;
    panner.maxDistance = 100;
    panner.rolloffFactor = 1.8; // Steeper falloff for better distance perception
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.coneOuterGain = 0;

    // Set initial position
    panner.positionX.value = position.x;
    panner.positionY.value = position.y;
    panner.positionZ.value = position.z;

    // Connect: source -> panner -> gain -> masterGain -> destination
    source.connect(panner);
    panner.connect(gain);
    gain.connect(this.masterGain);

    const audioSource: AudioSource = {
      id,
      source,
      panner,
      gain,
      position,
    };

    this.sources.set(id, audioSource);
    return audioSource;
  }

  updateSourcePosition(id: string, position: { x: number; y: number; z: number }): void {
    const source = this.sources.get(id);
    if (source) {
      source.panner.positionX.value = position.x;
      source.panner.positionY.value = position.y;
      source.panner.positionZ.value = position.z;
      source.position = position;
    }
  }

  removeSource(id: string): void {
    const source = this.sources.get(id);
    if (source) {
      source.source.disconnect();
      source.panner.disconnect();
      source.gain.disconnect();

      // Stop AudioBufferSourceNode if it's one
      if (source.source instanceof AudioBufferSourceNode) {
        try {
          source.source.stop();
        } catch (e) {
          // Ignore errors if already stopped
        }
      }

      this.sources.delete(id);
    }
  }

  /**
   * Update zone gain for a specific source
   */
  setZoneGain(id: string, zoneGain: number): void {
    const source = this.sources.get(id);
    if (source) {
      // Zone gain is multiplied with base gain
      // Base gain is typically 1.0, zone gain comes from ZoneSystem
      source.gain.gain.value = zoneGain;
    }
  }

  /**
   * Get source by ID
   */
  getSource(id: string): AudioSource | undefined {
    return this.sources.get(id);
  }

  getAudioContext(): AudioContext {
    return this.audioContext;
  }

  dispose(): void {
    this.sources.forEach((source) => {
      source.source.disconnect();
      source.panner.disconnect();
      source.gain.disconnect();
    });
    this.sources.clear();
    this.audioContext.close();
  }
}
