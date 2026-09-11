import { SoundType } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private hapticsEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private getContext(): AudioContext | null {
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

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
  }

  public getHapticsEnabled(): boolean {
    return this.hapticsEnabled;
  }

  // Trigger tactile vibration if supported
  public triggerHaptic(pattern: number | number[] = 15) {
    if (!this.hapticsEnabled || typeof window === 'undefined') return;
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore vibration errors (e.g. permission or iframe)
    }
  }

  // Generates realistic white/pink noise buffer
  private createNoiseBuffer(ctx: AudioContext, duration: number = 0.2): AudioBuffer {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Plays a crisp, realistic glass crack / tap sound based on the glass material type
   */
  public playCrack(soundType: SoundType = 'crisp', intensity: number = 1) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic(Math.min(50, Math.floor(15 * intensity)));

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * Math.min(1.2, intensity), now);
    masterGain.connect(ctx.destination);

    // 1. High-frequency brittle snap impulse (The sharp transient "clink" / "tink")
    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(ctx, 0.08);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(4500 + Math.random() * 1500, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7 * intensity, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start(now);

    // 2. High-pitched crystalline glass resonance (Chimes tuned to glass physical resonances)
    const baseFreqMap: Record<SoundType, number[]> = {
      crisp: [3200, 4800, 6400],
      stained: [1800, 2600, 3900, 5200],
      ice: [2400, 3600, 5800],
      tempered: [3800, 4500, 5600, 7200],
      cyber: [1200, 2400, 4800],
      wire: [1600, 2800, 4200],
      obsidian: [900, 1800, 3500],
      crystal: [2600, 3900, 5200, 6500],
      plasma: [2100, 3400, 6800],
      cosmic: [1500, 3000, 4500, 8000],
    };

    const freqs = baseFreqMap[soundType] || baseFreqMap.crisp;
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      // Slightly randomize frequency for realistic acoustic variation
      const jitter = (Math.random() - 0.5) * 120;
      osc.type = soundType === 'stained' || soundType === 'crystal' ? 'sine' : soundType === 'cyber' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq + jitter, now);

      if (soundType === 'cyber') {
        // Frequency laser sweep
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.12);
      }

      const ringDuration = 0.08 + idx * 0.04;
      oscGain.gain.setValueAtTime(0.3 / (idx + 1), now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + ringDuration);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + ringDuration + 0.01);
    });

    // 3. Body thump (impact energy)
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(soundType === 'obsidian' ? 140 : 220, now);
    thump.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    thumpGain.gain.setValueAtTime(0.4 * intensity, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    thump.connect(thumpGain);
    thumpGain.connect(masterGain);
    thump.start(now);
    thump.stop(now + 0.09);
  }

  /**
   * Plays a cataclysmic, deeply satisfying full shatter explosion sound
   */
  public playShatter(soundType: SoundType = 'crisp') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic([30, 40, 25, 40, 60]);

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 1.3, now);
    masterGain.connect(ctx.destination);

    // 1. Initial burst explosion noise
    const burst = ctx.createBufferSource();
    burst.buffer = this.createNoiseBuffer(ctx, 0.6);

    const burstFilter = ctx.createBiquadFilter();
    burstFilter.type = 'bandpass';
    burstFilter.frequency.setValueAtTime(3500, now);
    burstFilter.frequency.exponentialRampToValueAtTime(1200, now + 0.5);
    burstFilter.Q.setValueAtTime(3, now);

    const burstGain = ctx.createGain();
    burstGain.gain.setValueAtTime(0.9, now);
    burstGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    burst.connect(burstFilter);
    burstFilter.connect(burstGain);
    burstGain.connect(masterGain);
    burst.start(now);

    // 2. Cascading rain of falling shards clinking (granular tinks)
    const clinkCount = soundType === 'tempered' ? 18 : 12;
    for (let i = 0; i < clinkCount; i++) {
      const delay = Math.random() * 0.45;
      const clinkOsc = ctx.createOscillator();
      const clinkGain = ctx.createGain();

      clinkOsc.type = 'sine';
      const clinkFreq = 2200 + Math.random() * 4500;
      clinkOsc.frequency.setValueAtTime(clinkFreq, now + delay);

      const clinkDur = 0.04 + Math.random() * 0.06;
      clinkGain.gain.setValueAtTime(0, now);
      clinkGain.gain.setValueAtTime(0.25 * (1 - delay), now + delay);
      clinkGain.gain.exponentialRampToValueAtTime(0.001, now + delay + clinkDur);

      clinkOsc.connect(clinkGain);
      clinkGain.connect(masterGain);

      clinkOsc.start(now + delay);
      clinkOsc.stop(now + delay + clinkDur + 0.01);
    }

    // 3. Sub-bass boom
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(180, now);
    sub.frequency.exponentialRampToValueAtTime(30, now + 0.4);

    subGain.gain.setValueAtTime(0.8, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    sub.connect(subGain);
    subGain.connect(masterGain);
    sub.start(now);
    sub.stop(now + 0.46);
  }

  /**
   * Sound effect for power-up activations
   */
  public playPowerUp(type: string) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic([40, 60, 40]);
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume, now);
    masterGain.connect(ctx.destination);

    if (type === 'hammer') {
      // Heavy metallic impact
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
      gain.gain.setValueAtTime(1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (type === 'freeze') {
      // Crystallizing icy freeze sweep
      const noise = ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(ctx, 0.4);
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(8000, now + 0.35);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      noise.start(now);
    } else if (type === 'resonator') {
      // Pure harmonic resonant hum
      [440, 660, 880].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.2 / (i + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.52);
      });
    } else if (type === 'laser') {
      // Laser beam sizzle
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === 'vortex') {
      // Swirling pitch vortex
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.56);
    } else if (type === 'slowmo') {
      // Time warp pitch down
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.4);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.46);
    }
  }

  /**
   * Sound effect for combo multiplier increase
   */
  public playCombo(comboCount: number) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const basePitch = 440;
    const semitones = Math.min(24, comboCount * 2);
    const freq = basePitch * Math.pow(2, semitones / 12);

    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.1);

    gain.gain.setValueAtTime(this.volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Fanfare sound on completing a level
   */
  public playVictory() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic([50, 50, 50, 50, 100]);
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, High C
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(this.volume * 0.5, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.38);
    });
  }

  /**
   * Sound effect when user accidentally strikes wood / forbidden hazard
   */
  public playWoodHit() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic([60, 40, 80]);
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 1.1, now);
    masterGain.connect(ctx.destination);

    // 1. Dull low-pitched wood thud (hollow oak acoustic resonance)
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(160, now);
    thud.frequency.exponentialRampToValueAtTime(55, now + 0.15);
    thudGain.gain.setValueAtTime(0.9, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    thud.connect(thudGain);
    thudGain.connect(masterGain);
    thud.start(now);
    thud.stop(now + 0.2);

    // 2. Rough splinter crackle noise
    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(ctx, 0.12);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(800, now);
    noiseFilter.Q.setValueAtTime(2, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start(now);

    // 3. Harsh error buzzer tone
    const buzz = ctx.createOscillator();
    const buzzGain = ctx.createGain();
    buzz.type = 'sawtooth';
    buzz.frequency.setValueAtTime(110, now);
    buzzGain.gain.setValueAtTime(0.35, now);
    buzzGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    buzz.connect(buzzGain);
    buzzGain.connect(masterGain);
    buzz.start(now);
    buzz.stop(now + 0.24);
  }

  /**
   * Tragic game over / level failed sound
   */
  public playLevelFail() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic([100, 50, 150]);
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.9, now);
    masterGain.connect(ctx.destination);

    // Descending gloomy minor chords
    const notes = [330, 311.13, 293.66, 261.63, 196]; // E4, Eb4, D4, C4, G3
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.35, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.3);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.32);
    });
  }

  /**
   * Fast aerodynamic whoosh sound when swinging the hammer
   */
  public playHammerSwing() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(ctx, 0.12);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.11);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  /**
   * Sound effect when dangerous/obstacle non-glass object is struck
   */
  public playDangerHit() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic([80, 50, 80]);
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 1.2, now);
    masterGain.connect(ctx.destination);

    // Heavy metallic clang + low warning rasp
    const clang = ctx.createOscillator();
    const clangGain = ctx.createGain();
    clang.type = 'sawtooth';
    clang.frequency.setValueAtTime(420, now);
    clang.frequency.exponentialRampToValueAtTime(80, now + 0.18);
    clangGain.gain.setValueAtTime(0.7, now);
    clangGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    clang.connect(clangGain);
    clangGain.connect(masterGain);
    clang.start(now);
    clang.stop(now + 0.24);

    // Harsh electronic buzzer
    const buzz = ctx.createOscillator();
    const buzzGain = ctx.createGain();
    buzz.type = 'square';
    buzz.frequency.setValueAtTime(95, now);
    buzzGain.gain.setValueAtTime(0.4, now);
    buzzGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    buzz.connect(buzzGain);
    buzzGain.connect(masterGain);
    buzz.start(now);
    buzz.stop(now + 0.2);
  }

  /**
   * Light, high-pitched crack for thin delicate glass
   */
  public playThinGlassCrack() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic(12);
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.9, now);
    masterGain.connect(ctx.destination);

    // Sharp crystalline chime snap
    [4800, 7200, 9600].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 80, now);
      gain.gain.setValueAtTime(0.25 / (i + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05 + i * 0.02);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.08);
    });
  }

  /**
   * Deeper, heavier impact crack for thick / tempered glass
   */
  public playThickGlassCrack(hitNumber: number = 1, maxHp: number = 3) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.triggerHaptic(20 + hitNumber * 8);
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 1.0, now);
    masterGain.connect(ctx.destination);

    // Deeper fundamental thump
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = 'triangle';
    thump.frequency.setValueAtTime(260 - hitNumber * 30, now);
    thump.frequency.exponentialRampToValueAtTime(60, now + 0.1);
    thumpGain.gain.setValueAtTime(0.6, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    thump.connect(thumpGain);
    thumpGain.connect(masterGain);
    thump.start(now);
    thump.stop(now + 0.14);

    // Resonant glass stress ring
    const ring = ctx.createOscillator();
    const ringGain = ctx.createGain();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(1800 + hitNumber * 400, now);
    ringGain.gain.setValueAtTime(0.35, now);
    ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    ring.connect(ringGain);
    ringGain.connect(masterGain);
    ring.start(now);
    ring.stop(now + 0.16);
  }

  /**
   * Sound when a laser bolt strikes glass
   */
  public playLaserShoot() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.09);
    gain.gain.setValueAtTime(0.4 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  /**
   * Sound when power-up expires
   */
  public playPowerUpExpire() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.22);
    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }
}

export const soundEngine = new SoundEngine();
