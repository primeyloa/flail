// Small deterministic synth. Every sound is generated, so there's nothing to license.
export const RATE = 44100;
export const midi = (note) => 440 * 2 ** ((note - 69) / 12);

function random(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
    return (s / 4294967296) * 2 - 1;
  };
}

const samples = (seconds) => new Float32Array(Math.max(1, Math.round(seconds * RATE)));

function render(seconds, fn) {
  const out = samples(seconds);
  for (let i = 0; i < out.length; i++) out[i] = fn(i / RATE, i);
  return out;
}

const fadeEdges = (t, seconds, attack, release) => Math.min(1, t / attack, (seconds - t) / release);

// Soft, bell-like piano tone.
export function mallet(freq, seconds = 2, bright = 1) {
  const partials = [[1, 1, 1.6], [2, 0.32 * bright, 3], [3, 0.12 * bright, 5], [4.2, 0.05 * bright, 8]];
  return render(seconds, (t) => {
    let v = 0;
    for (const [ratio, level, decay] of partials) v += level * Math.sin(2 * Math.PI * freq * ratio * t) * Math.exp(-decay * t);
    return v * Math.min(1, t / 0.004) * Math.min(1, (seconds - t) / 0.05);
  });
}

// Warm sustained chord that swells in and out.
export function pad(freqs, seconds, attack = 0.8, release = 0.8) {
  return render(seconds, (t) => {
    let v = 0;
    for (const f of freqs) {
      for (const detune of [0.997, 1.003]) {
        const phase = 2 * Math.PI * f * detune * t;
        v += Math.sin(phase) + 0.18 * Math.sin(2 * phase);
      }
    }
    return (v / (freqs.length * 2)) * Math.max(0, fadeEdges(t, seconds, attack, release));
  });
}

// Game-console square wave, softened by using only the lower harmonics.
export function chip(freq, seconds = 0.2, decay = 7) {
  return render(seconds, (t) => {
    let v = 0;
    for (let h = 1; h <= 7; h += 2) v += Math.sin(2 * Math.PI * freq * h * t) / h;
    return v * 0.75 * Math.exp(-decay * t) * Math.min(1, t / 0.002) * Math.min(1, (seconds - t) / 0.01);
  });
}

export function bass(freq, seconds = 0.4) {
  return render(seconds, (t) => {
    const phase = 2 * Math.PI * freq * t;
    return (Math.sin(phase) + 0.25 * Math.sin(2 * phase)) * Math.exp(-2.5 * t) * Math.min(1, t / 0.005) * Math.min(1, (seconds - t) / 0.02);
  });
}

// One-pole filter. `cutoff` is a number in Hz or a function of time.
export function lowpass(input, cutoff) {
  const out = new Float32Array(input.length);
  let y = 0;
  for (let i = 0; i < input.length; i++) {
    const fc = typeof cutoff === "function" ? cutoff(i / RATE) : cutoff;
    y += (1 - Math.exp((-2 * Math.PI * fc) / RATE)) * (input[i] - y);
    out[i] = y;
  }
  return out;
}

export function highpass(input, cutoff) {
  const low = lowpass(input, cutoff);
  return input.map((v, i) => v - low[i]);
}

export function noise(seconds, seed = 7) {
  const next = random(seed);
  return render(seconds, () => next());
}

// Air rushing past, sweeping between two filter frequencies.
export function whoosh(seconds, from = 300, to = 2400, seed = 11) {
  const swept = lowpass(highpass(noise(seconds, seed), 120), (t) => from * (to / from) ** (t / seconds));
  return swept.map((v, i) => v * 1.8 * Math.sin((Math.PI * i) / swept.length) ** 1.5);
}

export function click(frequency = 3000, seconds = 0.018, seed = 3) {
  const burst = highpass(noise(seconds, seed), frequency);
  return burst.map((v, i) => v * Math.exp((-6 * i) / burst.length));
}

// Low pitch-dropping knock, used for footsteps and kicks.
export function thump(freq = 95, seconds = 0.14, drop = 2) {
  let phase = 0;
  return render(seconds, (t) => {
    phase += (2 * Math.PI * freq * (1 + drop * Math.exp(-t * 40))) / RATE;
    return Math.sin(phase) * Math.exp((-5 * t) / seconds) * Math.min(1, t / 0.002);
  });
}

// A rounded droplet sound, for bubbles appearing.
export function pop(from = 320, to = 780, seconds = 0.14) {
  let phase = 0;
  return render(seconds, (t) => {
    phase += (2 * Math.PI * from * (to / from) ** (t / seconds)) / RATE;
    return Math.sin(phase) * Math.sin((Math.PI * t) / seconds) ** 0.7;
  });
}

// A mix bus. add() places a sound at a time, with gain and stereo pan from -1 to 1.
export class Bus {
  constructor(seconds) {
    this.left = samples(seconds);
    this.right = samples(seconds);
  }

  add(sound, at, gain = 1, pan = 0) {
    const start = Math.round(at * RATE);
    const l = gain * Math.cos(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
    const r = gain * Math.sin(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
    for (let i = 0; i < sound.length && start + i < this.left.length; i++) {
      if (start + i < 0) continue;
      this.left[start + i] += sound[i] * l;
      this.right[start + i] += sound[i] * r;
    }
    return this;
  }

  // Simple room: parallel delays, slightly different per side so it spreads.
  reverb(mix = 0.2, decay = 0.72) {
    const room = (input, delays) => {
      const out = new Float32Array(input.length);
      for (const d of delays) {
        const size = Math.round(d * RATE);
        const line = new Float32Array(size);
        let at = 0;
        for (let i = 0; i < input.length; i++) {
          const v = line[at];
          line[at] = input[i] + v * decay;
          out[i] += v / delays.length;
          at = (at + 1) % size;
        }
      }
      return out;
    };
    const left = room(this.left, [0.0297, 0.0371, 0.0411, 0.0437]);
    const right = room(this.right, [0.0313, 0.0353, 0.0429, 0.0449]);
    for (let i = 0; i < this.left.length; i++) {
      this.left[i] += left[i] * mix;
      this.right[i] += right[i] * mix;
    }
    return this;
  }

  // Multiplies by a gain that changes over time, for fades and ducking.
  automate(gain) {
    for (let i = 0; i < this.left.length; i++) {
      const g = gain(i / RATE);
      this.left[i] *= g;
      this.right[i] *= g;
    }
    return this;
  }
}
