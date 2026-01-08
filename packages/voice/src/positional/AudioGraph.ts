// AudioContext and related types are from Web Audio API (browser global)

export interface AudioSource {
  id: string;
  source: AudioBufferSourceNode;
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
    if (this.listener) {
      this.listener.positionX.value = x;
      this.listener.positionY.value = y;
      this.listener.positionZ.value = z;
    }
  }

  addSource(
    id: string,
    _stream: MediaStream | AudioBuffer,
    position: { x: number; y: number; z: number }
  ): AudioSource {
    const source = this.audioContext.createBufferSource();
    const panner = this.audioContext.createPanner();
    const gain = this.audioContext.createGain();

    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 100;
    panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.coneOuterGain = 0;

    panner.positionX.value = position.x;
    panner.positionY.value = position.y;
    panner.positionZ.value = position.z;

    source.connect(panner);
    panner.connect(gain);
    gain.connect(this.masterGain);

    const audioSource: AudioSource = {
      id,
      source: source as AudioBufferSourceNode,
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
      this.sources.delete(id);
    }
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
