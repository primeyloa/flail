// vid002: playful console music for pixel Clawd, holding back on the crest, then full on the drop.
// Times are seconds in the full video: p01 0, p02 6, p03 8.5, p04 13.5, p05 16, end 20.
import { Bus, RATE, bass, chip, click, highpass, lowpass, mallet, midi, noise, pad, pop, thump, whoosh } from "../../../library/audio/synth.mjs";

const LENGTH = 20;
const BEAT = 0.5;
const RIDE_START = 8.5;
const DROP = 10; // When the car's speed surges.
const CHORDS = [[48, 60, 64, 67], [53, 60, 65, 69], [57, 60, 64, 69], [55, 59, 62, 67]]; // C F Am G
const chordAt = (t) => CHORDS[Math.floor(t / (BEAT * 4)) % CHORDS.length];
const LEAD = [72, 76, 79, 76, 81, 79, 76, 74, 72, 74, 76, 79, 84, 81, 79, 76];

// The same physics as FlailRide.planRide, so clacks and wind follow the car on screen.
function ride() {
  const curves = [[[-700, 760], [-300, 760], [-40, 520], [300, 520]], [[300, 520], [720, 520], [980, 2360], [1560, 2360]], [[1560, 2360], [2100, 2360], [2300, 1040], [2860, 1040]], [[2860, 1040], [3200, 1040], [3500, 1300], [4300, 1500]]];
  const points = [];
  for (const [a, b, c, d] of curves) {
    for (let i = 0; i < 500; i++) {
      const t = i / 500, u = 1 - t, w = [u ** 3, 3 * u * u * t, 3 * u * t * t, t ** 3];
      points.push([w[0] * a[0] + w[1] * b[0] + w[2] * c[0] + w[3] * d[0], w[0] * a[1] + w[1] * b[1] + w[2] * c[1] + w[3] * d[1]]);
    }
  }
  const lengths = [0];
  for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  const at = (s) => {
    let lo = 0, hi = points.length - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (lengths[m] < s) lo = m + 1; else hi = m; }
    return points[lo];
  };
  let crest = 0;
  for (let s = 0; s < 1500; s += 5) if (at(s)[1] < at(crest)[1]) crest = s;
  const frames = [];
  let s = crest;
  const startY = at(s)[1];
  for (let i = 0; i < 225; i++) {
    const [x, y] = at(s);
    const speed = Math.sqrt(Math.max(170 * 170 + 2 * 300 * (y - startY), 400));
    frames.push({ t: RIDE_START + i / 30, x, s, speed });
    s += speed / 30;
  }
  const top = Math.max(...frames.map((f) => f.speed));
  const hold = frames.findIndex((f) => f.x > 2450);
  const smooth = (u) => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };
  frames.forEach((f, i) => {
    f.relative = f.speed / top;
    f.wind = smooth((f.relative - 0.4) / 0.45) * (1 - smooth((i - hold) / 12));
  });
  return frames;
}

function buildMusic() {
  const music = new Bus(LENGTH);
  // p01 and p02: light and bouncy, a little louder as the coaster is revealed.
  for (let t = 0; t < 8.25; t += BEAT / 2) {
    const chord = chordAt(t), step = Math.round(t / (BEAT / 2));
    music.add(chip(midi(chord[1 + (step % 3)] + 12), 0.18, 11), t, t < 6 ? 0.07 : 0.09, step % 2 ? 0.25 : -0.25);
    if (step % 2 === 0) music.add(bass(midi(chord[0]), 0.34), t, 0.09);
  }
  // A rising run under the whip pan.
  for (let i = 0; i < 10; i++) music.add(chip(midi(60 + i * 2), 0.11, 9), 6.8 + i * 0.13, 0.05 + i * 0.006);
  // p03 crest: everything drops out but a held note, building the wait.
  music.add(lowpass(pad([midi(55), midi(67)], DROP - RIDE_START + 0.2, 0.3, 0.1), 900), RIDE_START, 0.1);
  // The drop: full beat and lead.
  for (let t = DROP; t < 13.5; t += BEAT / 2) {
    const chord = chordAt(t), step = Math.round((t - DROP) / (BEAT / 2));
    if (step % 2 === 0) music.add(thump(115, 0.14, 2.5), t, 0.3);
    music.add(highpass(noise(0.03, 40 + step), 6000), t + BEAT / 4, 0.06);
    if (step % 4 === 2) music.add(highpass(noise(0.1, 90 + step), 1800).map((v, i) => v * Math.exp(-i / 1200)), t, 0.16);
    music.add(bass(midi(chord[0] + (step % 4 === 3 ? 7 : 0)), 0.22), t, 0.12);
    music.add(chip(midi(LEAD[step % LEAD.length]), 0.22, 6), t, 0.11, ((step % 3) - 1) * 0.2);
  }
  // p04: the beat falls away as the car slows over the top.
  for (let t = 13.5; t < 15.9; t += BEAT) {
    const fade = 1 - (t - 13.5) / 2.6;
    music.add(chip(midi(LEAD[Math.round(t * 2) % LEAD.length]), 0.28, 5), t, 0.09 * fade);
    music.add(bass(midi(chordAt(t)[0]), 0.4), t, 0.1 * fade);
  }
  // p05: warm and settled under the message, home on C.
  const end = [48, 55, 64, 67, 72];
  music.add(lowpass(pad(end.map(midi), 4.2, 0.7, 1.1), 1500), 16, 0.16);
  [60, 64, 67, 72].forEach((note, i) => music.add(mallet(midi(note), 2.4, 0.6), 16.1 + i * 0.3, 0.2));
  music.reverb(0.2, 0.66);
  return music.automate((t) => Math.min(1, t / 0.05, (LENGTH - t) / 0.8));
}

function buildEffects() {
  const sfx = new Bus(LENGTH);
  const frames = ride();

  // Clawd's little game steps, then a blip for each turn.
  for (let t = 0; t < 1.5; t += 0.22) sfx.add(chip(midi(79), 0.05, 40), t, 0.06, -0.5 + t * 0.4);
  [1.6, 1.72, 1.45, 1.57].forEach((t, i) => sfx.add(chip(midi(84 + i), 0.04, 45), t, 0.03));
  // Bubbles.
  sfx.add(pop(300, 820), 1.9, 0.18, 0.2);
  sfx.add(pop(360, 900), 3.6, 0.18, -0.2);
  sfx.add(pop(260, 700), 6.2, 0.18, 0.2);
  // The whip up the coaster.
  sfx.add(whoosh(1.5, 260, 3600, 31), 0.75 + 6, 0.2);

  // Track clacks, one per stretch of rail, so they speed up with the car.
  const RAIL = 190;
  let next = frames[0].s;
  frames.forEach((f, i) => {
    if (f.s < next) return;
    next += RAIL;
    const louder = 0.11 + 0.1 * (1 - f.relative);
    sfx.add(click(1500, 0.022, 50 + i), f.t, louder);
    sfx.add(thump(150, 0.035, 0.5), f.t, louder * 0.9);
  });

  // Arms up: a quick rising cheer from each Clawd.
  for (let i = 0; i < 5; i++) {
    sfx.add(chip(midi(76 + i * 3), 0.05, 30), DROP - 0.1 + i * 0.05, 0.07, 0.3);
    sfx.add(chip(midi(79 + i * 3), 0.05, 30), DROP + i * 0.05, 0.06, -0.3);
  }

  // Wind and wheel rumble, following the same level as the wind lines on screen.
  const level = (t) => {
    const f = frames[Math.max(0, Math.min(frames.length - 1, Math.floor((t - RIDE_START) * 30)))];
    return t < RIDE_START || t > RIDE_START + 7.5 ? 0 : f.wind;
  };
  const speed = (t) => frames[Math.max(0, Math.min(frames.length - 1, Math.floor((t - RIDE_START) * 30)))].relative;
  const seconds = 7.5;
  const air = lowpass(highpass(noise(seconds, 61), 200), (t) => 500 + 3200 * speed(RIDE_START + t));
  const gust = (t) => 0.8 + 0.2 * Math.sin(t * 7) * Math.sin(t * 2.3);
  sfx.add(air.map((v, i) => v * level(RIDE_START + i / RATE) * gust(i / RATE)), RIDE_START, 0.42, -0.1);
  const rumble = lowpass(highpass(noise(seconds, 71), 90), 320);
  sfx.add(rumble.map((v, i) => v * speed(RIDE_START + i / RATE) ** 1.4 * Math.min(1, (seconds - i / RATE) / 1.2)), RIDE_START, 0.5);

  // The message: a soft bell as the logo lands.
  sfx.add(mallet(midi(88), 2, 1.1), 17.4, 0.1);
  return sfx.reverb(0.1, 0.6);
}

export const score = () => ({ music: buildMusic(), sfx: buildEffects() });
