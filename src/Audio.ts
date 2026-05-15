// Synthesised ambient. Web Audio only, no samples. Each preset is a stack of
// layers (piano melody, drone, noise bed, slow pad) tuned in audio-sandbox.html
// and pasted in here.

type PianoLayer = {
  type: "piano";
  pitches: number[];
  intervalMs: number;
  jitterMs: number;
  decay: number;
  volume: number;
  filterRatio: number;
  timbre: OscillatorType;
};

type DroneLayer = {
  type: "drone";
  freq: number;
  detune: number;
  filterFreq: number;
  filterQ: number;
  lfoRate: number;
  lfoDepth: number;
  volume: number;
};

type NoiseLayer = {
  type: "noise";
  color: "brown" | "pink" | "white";
  filterFreq: number;
  filterQ: number;
  modRate: number;
  modDepth: number;
  volume: number;
};

type PadLayer = {
  type: "pad";
  pitches: number[];
  detune: number;
  attack: number;
  filterFreq: number;
  volume: number;
};

type Layer = PianoLayer | DroneLayer | NoiseLayer | PadLayer;

const PRESETS: Record<string, Layer[]> = {
  // Default — Tomas.
  default: [
    {
      type: "piano",
      pitches: [261.63, 329.63, 392],
      intervalMs: 5500,
      jitterMs: 2000,
      decay: 4,
      volume: 0.15,
      filterRatio: 4,
      timbre: "triangle",
    },
    {
      type: "noise",
      color: "pink",
      filterFreq: 500,
      filterQ: 1,
      modRate: 0.07,
      modDepth: 200,
      volume: 0.03,
    },
    {
      type: "pad",
      pitches: [174.61, 220, 261.63],
      detune: 5,
      attack: 6,
      filterFreq: 800,
      volume: 0.05,
    },
  ],

  "dreamer-default": [
    {
      type: "piano",
      pitches: [220, 261.63, 329.63, 392, 440],
      intervalMs: 5500,
      jitterMs: 2000,
      decay: 4,
      volume: 0.15,
      filterRatio: 4,
      timbre: "triangle",
    },
    {
      type: "drone",
      freq: 110,
      detune: 7,
      filterFreq: 600,
      filterQ: 1.5,
      lfoRate: 0.1,
      lfoDepth: 80,
      volume: 0.03,
    },
    {
      type: "noise",
      color: "brown",
      filterFreq: 500,
      filterQ: 1,
      modRate: 0.07,
      modDepth: 200,
      volume: 0.02,
    },
    {
      type: "pad",
      pitches: [110, 164.81, 220, 261.63],
      detune: 5,
      attack: 6,
      filterFreq: 800,
      volume: 0.05,
    },
  ],

  "reckoner-default": [
    {
      type: "piano",
      pitches: [196, 246.94, 293.66],
      intervalMs: 5500,
      jitterMs: 2000,
      decay: 4,
      volume: 0.15,
      filterRatio: 4,
      timbre: "triangle",
    },
    {
      type: "drone",
      freq: 110,
      detune: 7,
      filterFreq: 600,
      filterQ: 1.5,
      lfoRate: 0.1,
      lfoDepth: 80,
      volume: 0.01,
    },
    {
      type: "pad",
      pitches: [146.83, 174.61, 220],
      detune: 5,
      attack: 6,
      filterFreq: 800,
      volume: 0.05,
    },
  ],
};

// Neutral mirrors reckoner (matches prior behaviour).
PRESETS["neutral-default"] = PRESETS["reckoner-default"]!;

interface ActiveLayer {
  stop: () => void;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentLoopToken = 0;
  private active: ActiveLayer[] = [];
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
    const token = ++this.currentLoopToken;
    for (const layer of preset) {
      if (layer.type === "piano") this.startPianoLoop(layer, token);
      else if (layer.type === "drone") this.active.push(this.startDrone(layer));
      else if (layer.type === "noise") this.active.push(this.startNoise(layer));
      else if (layer.type === "pad") this.active.push(this.startPad(layer));
    }
  }

  stopAmbient(): void {
    this.currentLoopToken++;
    for (const a of this.active) {
      try {
        a.stop();
      } catch {
        /* noop */
      }
    }
    this.active = [];
  }

  private startPianoLoop(preset: PianoLayer, token: number): void {
    const scheduleNext = () => {
      if (token !== this.currentLoopToken) return;
      if (!this.muted) {
        const pitch =
          preset.pitches[Math.floor(Math.random() * preset.pitches.length)]!;
        this.playPianoNote(
          pitch,
          preset.decay,
          preset.volume,
          preset.filterRatio,
          preset.timbre,
        );
      }
      const next =
        preset.intervalMs + (Math.random() * 2 - 1) * preset.jitterMs;
      setTimeout(scheduleNext, Math.max(800, next));
    };
    setTimeout(scheduleNext, 400 + Math.random() * 600);
  }

  private playPianoNote(
    freq: number,
    decay: number,
    volume: number,
    filterRatio: number,
    timbre: OscillatorType,
  ): void {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const fundamental = ctx.createOscillator();
    fundamental.type = timbre;
    fundamental.frequency.value = freq;

    const octave = ctx.createOscillator();
    octave.type = "sine";
    octave.frequency.value = freq * 2;

    const fifth = ctx.createOscillator();
    fifth.type = "sine";
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

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq * (filterRatio - 1), now);
    filter.frequency.linearRampToValueAtTime(
      freq * (filterRatio + 2),
      now + 0.05,
    );
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(freq * (filterRatio / 2), 200),
      now + decay,
    );
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

  private startDrone(p: DroneLayer): ActiveLayer {
    const ctx = this.ctx!;
    const osc1 = ctx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.value = p.freq;
    const osc2 = ctx.createOscillator();
    osc2.type = "sawtooth";
    osc2.frequency.value = p.freq;
    osc2.detune.value = p.detune;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = p.filterFreq;
    filter.Q.value = p.filterQ;

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = p.lfoRate;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = p.lfoDepth;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = ctx.createGain();
    gain.gain.value = p.volume;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc1.start();
    osc2.start();
    lfo.start();

    return {
      stop: () => {
        try {
          osc1.stop();
        } catch {
          /* noop */
        }
        try {
          osc2.stop();
        } catch {
          /* noop */
        }
        try {
          lfo.stop();
        } catch {
          /* noop */
        }
      },
    };
  }

  private makeNoiseBuffer(color: "brown" | "pink" | "white"): AudioBuffer {
    const ctx = this.ctx!;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0)!;
    if (color === "white") {
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    } else if (color === "pink") {
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i]!;
        data[i] = data[i]! * 3.5;
      }
    }
    return buffer;
  }

  private startNoise(p: NoiseLayer): ActiveLayer {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.makeNoiseBuffer(p.color);
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = p.filterFreq;
    filter.Q.value = p.filterQ;

    let lfo: OscillatorNode | null = null;
    if (p.modRate > 0) {
      lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = p.modRate;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = p.modDepth;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
    }

    const gain = ctx.createGain();
    gain.gain.value = p.volume;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    src.start();
    if (lfo) lfo.start();

    return {
      stop: () => {
        try {
          src.stop();
        } catch {
          /* noop */
        }
        if (lfo) {
          try {
            lfo.stop();
          } catch {
            /* noop */
          }
        }
      },
    };
  }

  private startPad(p: PadLayer): ActiveLayer {
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = p.filterFreq;
    filter.Q.value = 0.7;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(p.volume, now + p.attack);

    const oscs: OscillatorNode[] = [];
    p.pitches.forEach((freq, i) => {
      const o1 = ctx.createOscillator();
      o1.type = "sine";
      o1.frequency.value = freq;
      const o2 = ctx.createOscillator();
      o2.type = "triangle";
      o2.frequency.value = freq;
      o2.detune.value = (i % 2 === 0 ? 1 : -1) * p.detune;
      const og = ctx.createGain();
      og.gain.value = 1 / p.pitches.length;
      o1.connect(og);
      o2.connect(og);
      og.connect(filter);
      o1.start(now);
      o2.start(now);
      oscs.push(o1, o2);
    });

    filter.connect(gain);
    gain.connect(this.masterGain!);

    return {
      stop: () => {
        const t = ctx.currentTime;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.linearRampToValueAtTime(0, t + 1);
        setTimeout(
          () =>
            oscs.forEach((o) => {
              try {
                o.stop();
              } catch {
                /* noop */
              }
            }),
          1100,
        );
      },
    };
  }

  playSfx(type: "click" | "creak" | "paper" | "footstep" | "lock"): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const ctx = this.ctx;

    if (type === "click") {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 800;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === "creak") {
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0)!;
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 200;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start();
    } else if (type === "paper") {
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0)!;
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.5;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 2000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start();
    } else if (type === "footstep") {
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0)!;
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 100;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start();
    } else if (type === "lock") {
      const osc = ctx.createOscillator();
      osc.type = "square";
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
