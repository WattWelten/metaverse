/**
 * TestToneProvider - Generates a test tone (220 Hz sine wave) for audio testing
 * Useful for E2E tests and audio pipeline validation
 */

export class TestToneProvider {
  private audioContext: AudioContext;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private frequency = 220; // A3 note

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  /**
   * Start playing test tone
   */
  start(): void {
    if (this.isPlaying) return;

    this.oscillator = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();

    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = this.frequency;
    this.gainNode.gain.value = 0.1; // Low volume for testing

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    this.oscillator.start();
    this.isPlaying = true;

    // Expose debug info to window for E2E tests
    if (typeof window !== 'undefined') {
      const w = window as any;
      w.__audioDbg = w.__audioDbg || {};
      w.__audioDbg.testTone = {
        playing: true,
        frequency: this.frequency,
        gain: this.gainNode.gain.value,
      };
    }
  }

  /**
   * Stop playing test tone
   */
  stop(): void {
    if (!this.isPlaying || !this.oscillator) return;

    try {
      this.oscillator.stop();
    } catch (e) {
      // Ignore errors if already stopped
    }

    this.oscillator = null;
    this.gainNode = null;
    this.isPlaying = false;

    // Update debug info
    if (typeof window !== 'undefined') {
      const w = window as any;
      w.__audioDbg = w.__audioDbg || {};
      w.__audioDbg.testTone = {
        playing: false,
      };
    }
  }

  /**
   * Set frequency
   */
  setFrequency(freq: number): void {
    this.frequency = freq;
    if (this.oscillator) {
      this.oscillator.frequency.value = freq;
    }
  }

  /**
   * Set gain (volume)
   */
  setGain(gain: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = gain;
    }
  }

  /**
   * Get current state
   */
  getState(): { playing: boolean; frequency: number } {
    return {
      playing: this.isPlaying,
      frequency: this.frequency,
    };
  }

  /**
   * Dispose
   */
  dispose(): void {
    this.stop();
  }
}
