interface DroneParams {
  baseFreq: number;
  filterFreq: number;
  filterQ: number;
  noiseGain: number;
  sineGain: number;
  lfoRate: number;
  lfoDepth: number;
}

type DronePresets = Record<string, DroneParams>;

const PRESETS: DronePresets = {
  default: { baseFreq: 80, filterFreq: 400, filterQ: 1, noiseGain: 0.15, sineGain: 0.08, lfoRate: 0.1, lfoDepth: 10 },
  'dressing-room': { baseFreq: 100, filterFreq: 350, filterQ: 0.8, noiseGain: 0.1, sineGain: 0.1, lfoRate: 0.08, lfoDepth: 8 },
  workshop: { baseFreq: 60, filterFreq: 600, filterQ: 2, noiseGain: 0.2, sineGain: 0.05, lfoRate: 0.15, lfoDepth: 15 },
  'stage-wing': { baseFreq: 70, filterFreq: 250, filterQ: 0.5, noiseGain: 0.12, sineGain: 0.06, lfoRate: 0.05, lfoDepth: 12 },
  hallway: { baseFreq: 90, filterFreq: 500, filterQ: 1.5, noiseGain: 0.18, sineGain: 0.04, lfoRate: 0.12, lfoDepth: 10 },
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentDrone: { nodes: AudioNode[]; stop: () => void } | null = null;
  private initialized = false;
  private muted = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.ctx.destination);
    this.initialized = true;
  }

  setAmbient(presetKey: string): void {
    if (!this.ctx || !this.masterGain) return;
    this.stopAmbient();

    const preset = (PRESETS[presetKey] ?? PRESETS.default) as DroneParams;
    const ctx = this.ctx;

    const noise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0)!;
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      const v = data[i]!;
      lastOut = v;
      data[i] = v * 3.5;
    }
    noise.buffer = buffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = preset.filterFreq;
    noiseFilter.Q.value = preset.filterQ;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = preset.noiseGain;

    const sine = ctx.createOscillator();
    sine.type = 'sine';
    sine.frequency.value = preset.baseFreq;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = preset.lfoRate;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = preset.lfoDepth;
    lfo.connect(lfoGain);
    lfoGain.connect(sine.frequency);
    lfo.start();

    const sineGain = ctx.createGain();
    sineGain.gain.value = preset.sineGain;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    sine.connect(sineGain);
    sineGain.connect(this.masterGain);

    noise.start();
    sine.start();

    this.currentDrone = {
      nodes: [noise, sine, lfo],
      stop: () => {
        try { noise.stop(); } catch { /* already stopped */ }
        try { sine.stop(); } catch { /* already stopped */ }
        try { lfo.stop(); } catch { /* already stopped */ }
      },
    };
  }

  stopAmbient(): void {
    if (this.currentDrone) {
      this.currentDrone.stop();
      this.currentDrone = null;
    }
  }

  playSfx(type: 'click' | 'creak' | 'paper' | 'footstep' | 'lock'): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const ctx = this.ctx;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 800;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
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
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
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
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
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
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
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
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
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
      this.masterGain.gain.value = this.muted ? 0 : 0.3;
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
