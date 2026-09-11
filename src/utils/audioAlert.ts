// Web Audio API chime synthesizer for real-time merchant order notification
class SoundAlertSystem {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Dual tone joyful cash register / order arrival chime
  playOrderChime(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1: E5 (659.25 Hz)
      this.playTone(ctx, 659.25, now, 0.15, 0.25);
      // Note 2: G#5 (830.61 Hz)
      this.playTone(ctx, 830.61, now + 0.12, 0.18, 0.3);
      // Note 3: B5 (987.77 Hz)
      this.playTone(ctx, 987.77, now + 0.24, 0.22, 0.35);
      // Note 4: E6 (1318.51 Hz) - sparkling ring
      this.playTone(ctx, 1318.51, now + 0.38, 0.45, 0.4);
    } catch (e) {
      console.warn('Audio alert error:', e);
    }
  }

  // Cash on delivery / alert buzz
  playCodAlert(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      this.playTone(ctx, 523.25, now, 0.2, 0.3);
      this.playTone(ctx, 659.25, now + 0.18, 0.3, 0.35);
    } catch (e) {
      console.warn('Audio alert error:', e);
    }
  }

  private playTone(ctx: AudioContext, freq: number, startTime: number, duration: number, maxGain: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(maxGain, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const soundAlert = new SoundAlertSystem();
