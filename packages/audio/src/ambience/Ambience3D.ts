interface WindowWithWebkitAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export class Ambience3D {
  private ctx = new (
    window.AudioContext || (window as WindowWithWebkitAudioContext).webkitAudioContext
  )();
  private nodes: Array<{
    id: string;
    panner: PannerNode;
    source?: MediaElementAudioSourceNode;
    audio?: HTMLAudioElement;
  }> = [];

  async addLoop(
    id: string,
    url: string,
    pos: [number, number, number],
    maxDist = 20
  ): Promise<void> {
    const audio = new Audio(url);
    audio.loop = true;
    audio.crossOrigin = 'anonymous';

    const src = this.ctx.createMediaElementSource(audio);
    const pan = this.ctx.createPanner();
    pan.panningModel = 'HRTF';
    pan.distanceModel = 'inverse';
    pan.maxDistance = maxDist;
    pan.refDistance = 2.5;
    pan.rolloffFactor = 1.6;
    pan.positionX.value = pos[0];
    pan.positionY.value = pos[1];
    pan.positionZ.value = pos[2];

    src.connect(pan).connect(this.ctx.destination);

    // Play (autoplay policy -> EnterOverlay ruft resumeContext)
    audio.play().catch(() => {
      // Silently fail - will be resumed on user interaction
    });

    this.nodes.push({ id, panner: pan, source: src, audio });
  }

  setListener(x: number, y: number, z: number): void {
    if (this.ctx.listener.positionX) {
      this.ctx.listener.positionX.value = x;
      this.ctx.listener.positionY.value = y;
      this.ctx.listener.positionZ.value = z;
    } else {
      // Fallback for older browsers
      const listener = this.ctx.listener as AudioListener & {
        setPosition?: (x: number, y: number, z: number) => void;
      };
      listener.setPosition?.(x, y, z);
    }
  }

  resume(): void {
    this.ctx.resume();
  }

  dispose(): void {
    this.nodes.forEach((node) => {
      node.source?.disconnect();
      node.panner.disconnect();
      node.audio?.pause();
      node.audio = undefined;
    });
    this.nodes = [];
  }
}
