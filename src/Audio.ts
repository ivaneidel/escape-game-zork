// Synthesised soft-piano ambient. Web Audio only, no samples. Each "preset"
// defines a pitch pool and tempo. Notes play sparsely with long decay,
// overlapping to suggest chord without being one.

interface PianoPreset {
  pitches: number[];
  intervalMs: number;
  jitterMs: number;
  decay: number;
  volume: number;
}

const PRESETS: Record<string, PianoPreset> = {
  // Used when no specific ambient is declared and no render mode is in play.
  default: {
    pitches: [220, 261.63, 329.63], // A3 C4 E4
    intervalMs: 5500,
    jitterMs: 2000,
    decay: 4,
    volume: 0.18,
  },
  // Dreamer rooms — warmer, lower fundamentals, wider chord.
  'dreamer-default': {
    pitches: [110, 130.81, 164.81, 220, 261.63, 329.63], // A2 C3 E3 A3 C4 E4
    intervalMs: 4500,
    jitterMs: 1500,
    decay: 6,
    volume: 0.2,
  },
  // Reckoner rooms — modal, sparser, higher.
  'reckoner-default': {
    pitches: [196, 220, 261.63, 293.66], // G3 A3 C4 D4
    intervalMs: 6500,
    jitterMs: 2500,
    decay: 3.5,
    volume: 0.14,
  },
  // Neutral rooms — quiet, sparse, only the simplest triad.
  'neutral-default': {
    // pitches: [220, 261.63, 329.63],
    // intervalMs: 8500,
    // jitterMs: 3500,
    // decay: 5,
    // volume: 0.12,
    pitches: [196, 220, 261.63, 293.66], // G3 A3 C4 D4
    intervalMs: 6500,
    jitterMs: 2500,
    decay: 3.5,
    volume: 0.14,
  },
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentLoopToken = 0;
  private initialized = false;
  private muted = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1;
    this.masterGain.connect(this.ctx.destination);
    this.initialized = true;
  }

  setAmbient(presetKey: string): void {
    if (!this.ctx || !this.masterGain) return;
    const preset = PRESETS[presetKey] ?? PRESETS.default!;
    this.stopAmbient();
    this.startPianoLoop(preset);
  }

  stopAmbient(): void {
    this.currentLoopToken++;
  }

  private startPianoLoop(preset: PianoPreset): void {
    const token = ++this.currentLoopToken;
    const scheduleNext = () => {
      if (token !== this.currentLoopToken) return;
      if (!this.muted) {
        const pitch = preset.pitches[Math.floor(Math.random() * preset.pitches.length)]!;
        this.playPianoNote(pitch, preset.decay, preset.volume);
      }
      const next = preset.intervalMs + (Math.random() * 2 - 1) * preset.jitterMs;
      setTimeout(scheduleNext, Math.max(800, next));
    };
    // First note plays after a short, randomised lead-in so room changes
    // don't all kick at exactly the same instant.
    setTimeout(scheduleNext, 400 + Math.random() * 600);
  }

  private playPianoNote(freq: number, decay: number, volume: number): void {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Three partials: triangle fundamental + sine harmonics. Approximates a
    // soft-attack piano-like timbre without samples.
    const fundamental = ctx.createOscillator();
    fundamental.type = 'triangle';
    fundamental.frequency.value = freq;

    const octave = ctx.createOscillator();
    octave.type = 'sine';
    octave.frequency.value = freq * 2;

    const fifth = ctx.createOscillator();
    fifth.type = 'sine';
    fifth.frequency.value = freq * 3;

    const fundGain = ctx.createGain();
    fundGain.gain.value = 1;

    const octGain = ctx.createGain();
    octGain.gain.value = 0.28;

    const fifthGain = ctx.createGain();
    fifthGain.gain.value = 0.12;

    fundamental.connect(fundGain);
    octave.connect(octGain);
    fifth.connect(fifthGain);

    // Lowpass that opens slightly on attack and closes on decay — gives a
    // soft bloom and warm tail.
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3, now);
    filter.frequency.linearRampToValueAtTime(freq * 6, now + 0.05);
    filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 2, 200), now + decay);
    filter.Q.value = 0.6;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(volume, now + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    fundGain.connect(filter);
    octGain.connect(filter);
    fifthGain.connect(filter);
    filter.connect(env);
    env.connect(this.masterGain);

    fundamental.start(now);
    octave.start(now);
    fifth.start(now);
    fundamental.stop(now + decay + 0.1);
    octave.stop(now + decay + 0.1);
    fifth.stop(now + decay + 0.1);
  }

  playSfx(type: 'click' | 'creak' | 'paper' | 'footstep' | 'lock'): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const ctx = this.ctx;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 800;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'creak') {
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0)!;
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start();
    } else if (type === 'paper') {
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0)!;
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.5;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 2000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start();
    } else if (type === 'footstep') {
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0)!;
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 100;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start();
    } else if (type === 'lock') {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 600;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 1;
    }
    return this.muted;
  }

  dispose(): void {
    this.stopAmbient();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.initialized = false;
  }
}
