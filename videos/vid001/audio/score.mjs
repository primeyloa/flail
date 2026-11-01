// vid001: calm and warm, to match the premium feel. One chord per panel, resolving on the logo.
// Times are seconds in the full video: p01 0, p02 3.5, p03 6.5, p04 10.5, end 15.
import { Bus, click, lowpass, mallet, midi, pad, pop, thump, whoosh } from "../../../library/audio/synth.mjs";

const LENGTH = 15;
const SECTIONS = [
  { at: 0, until: 3.5, chord: [50, 57, 61, 64, 66] }, // Dmaj9
  { at: 3.5, until: 6.5, chord: [47, 54, 57, 61, 62] }, // Bm9
  { at: 6.5, until: 10.5, chord: [43, 50, 54, 57, 59] }, // Gmaj9
  { at: 10.5, until: 12, chord: [45, 52, 55, 57, 62] }, // Asus4
  { at: 12, until: LENGTH, chord: [50, 57, 62, 64, 66] }, // D, home on the logo and details
];
const STEP = 0.4;
const PATTERN = [1, 3, 2, 4, 3, 2, 4, 3];

function buildMusic() {
  const music = new Bus(LENGTH);
  let beat = 0;
  for (const { at, until, chord } of SECTIONS) {
    const pads = chord.slice(0, 4).map(midi);
    music.add(lowpass(pad(pads, until - at + 0.9, 0.5, 0.9), 1400), at, 0.17);
    music.add(mallet(midi(chord[0]), 3, 0.5), at, 0.34, -0.1);
    for (let t = at; t < Math.min(until, LENGTH - 1.2); t += STEP) {
      const note = chord[PATTERN[beat++ % PATTERN.length]] + 12;
      music.add(mallet(midi(note), 1.6, 0.6), t, 0.15 + 0.03 * (beat % 2), ((beat % 3) - 1) * 0.3);
    }
  }
  music.add(mallet(midi(74), 3, 0.7), 12, 0.3, 0.1);
  music.reverb(0.34, 0.76);
  return music.automate((t) => Math.min(1, t / 0.15, (LENGTH - t) / 1));
}

function buildEffects() {
  const sfx = new Bus(LENGTH);
  // Ama's footsteps, slowing as she stops, then her walk to the group in p02.
  [0.05, 0.56, 1.1, 1.72, 4.55, 5.25].forEach((t, i) => { sfx.add(thump(150, 0.08, 1), t, 0.2, -0.3 + i * 0.1); sfx.add(click(1400, 0.02, 9 + i), t, 0.05, -0.3 + i * 0.1); });
  // The scene closes to a circle, and the laptop settles.
  sfx.add(whoosh(1.05, 220, 1600), 6.5, 0.12);
  sfx.add(thump(130, 0.16, 1), 7.05, 0.2);
  // Typing the prompt, then the page landing.
  for (let i = 0; i < 20; i++) sfx.add(click(2600, 0.016, 3 + i), 7.55 + i * 0.034, 0.07, 0.1);
  sfx.add(pop(420, 880, 0.16), 8.95, 0.14);
  // The circle closes into the logo mark, and a soft bell lands on it.
  sfx.add(whoosh(0.95, 1600, 260, 21), 10.5, 0.11);
  sfx.add(mallet(midi(86), 2.4, 1.2), 11.35, 0.16);
  return sfx.reverb(0.16, 0.7);
}

export const score = () => ({ music: buildMusic(), sfx: buildEffects() });
