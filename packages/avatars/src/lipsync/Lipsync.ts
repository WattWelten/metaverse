// AudioContext from standardized-audio-context (optional dependency)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AudioContextType = any;

export class Lipsync {
  private audioContext: AudioContextType | null = null;

  async enable(): Promise<void> {
    // Use browser AudioContext if available
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new window.AudioContext();
    }
    // WebAudio FFT → einfache Visemes (später)
  }

  update(_audioData: Float32Array): void {
    // Stub für später
  }

  dispose(): void {
    this.audioContext?.close();
  }
}
