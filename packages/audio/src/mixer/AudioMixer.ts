export class AudioMixer {
  private masterVolume = 1.0;
  private channels = new Map<string, number>();

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  setChannelVolume(channel: string, volume: number): void {
    this.channels.set(channel, Math.max(0, Math.min(1, volume)));
  }

  getChannelVolume(channel: string): number {
    return this.channels.get(channel) || 1.0;
  }

  getEffectiveVolume(channel?: string): number {
    const channelVolume = channel ? this.getChannelVolume(channel) : 1.0;
    return this.masterVolume * channelVolume;
  }

  dispose(): void {
    this.channels.clear();
  }
}



