interface WindowWithWebkitAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export class MicAnalyser {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private stream: MediaStream | null = null;

  async attach(stream: MediaStream): Promise<void> {
    this.stream = stream;
    this.ctx = new (
      window.AudioContext || (window as WindowWithWebkitAudioContext).webkitAudioContext
    )();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    const source = this.ctx.createMediaStreamSource(stream);
    source.connect(this.analyser);

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  sample(): number {
    if (!this.analyser || !this.dataArray) return 0;

    const buffer = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(buffer);
    const sum = buffer.reduce((a, b) => a + b, 0);
    const avg = sum / buffer.length;
    return Math.min(1, avg / 255);
  }

  resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  dispose(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.analyser = null;
    this.dataArray = null;
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
