#!/usr/bin/env node
// Builds a video's music and sound effects from videos/<id>/audio/score.mjs, using no LLM tokens.
//   node tools/sound.mjs vid001
// Writes music.wav, sfx.wav and mix.wav to videos/<id>/output/audio/, at -14 LUFS for social media.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { RATE } from "../library/audio/synth.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ffmpeg = createRequire(import.meta.url)("ffmpeg-static");
const TARGET_LUFS = -14;

const videoId = process.argv[2];
if (!videoId) {
  console.error("Usage: node tools/sound.mjs <video-id>");
  process.exit(1);
}
const videoDir = join(ROOT, "videos", videoId);
const outDir = join(videoDir, "output/audio");
mkdirSync(outDir, { recursive: true });

function writeWav(path, left, right, gain = 1) {
  const data = Buffer.alloc(left.length * 4);
  for (let i = 0; i < left.length; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[i] * gain)) * 32767), i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[i] * gain)) * 32767), i * 4 + 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(2, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 4, 28);
  header.writeUInt16LE(4, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([header, data]));
}

const measure = (path) => {
  const { stderr } = spawnSync(ffmpeg, ["-hide_banner", "-i", path, "-af", "loudnorm=print_format=json", "-f", "null", "-"], { encoding: "utf8" });
  return JSON.parse(stderr.match(/\{\s*"input_i"[\s\S]*?\}/)[0]);
};

const { score } = await import(pathToFileURL(join(videoDir, "audio/score.mjs")));
const { music, sfx } = score();

// Keep the raw mix below clipping before measuring, so the measurement holds.
const left = music.left.map((v, i) => v + sfx.left[i]);
const right = music.right.map((v, i) => v + sfx.right[i]);
const peak = Math.max(...[left, right].map((side) => side.reduce((max, v) => Math.max(max, Math.abs(v)), 0)));
const headroom = 0.5 / peak;
const rawPath = join(outDir, ".raw.wav");
writeWav(rawPath, left, right, headroom);

// Gain to the loudness target, with a limiter catching the few peaks that pass -1 dB.
const raw = measure(rawPath);
const gainDb = TARGET_LUFS - Number(raw.input_i);
const finalPath = join(outDir, "mix.wav");
spawnSync(ffmpeg, ["-y", "-v", "error", "-i", rawPath, "-af", `volume=${gainDb}dB,alimiter=limit=0.84:attack=2:release=40:level=disabled`, "-ar", String(RATE), finalPath]);

// Separate stems, in case someone wants to remix them. Same balance as the mix, kept below clipping.
const stemGain = headroom * 10 ** (gainDb / 20);
const peakOf = (bus) => Math.max(...[bus.left, bus.right].map((side) => side.reduce((max, v) => Math.max(max, Math.abs(v)), 0)));
const safeGain = Math.min(stemGain, 0.84 / Math.max(peakOf(music), peakOf(sfx)));
writeWav(join(outDir, "music.wav"), music.left, music.right, safeGain);
writeWav(join(outDir, "sfx.wav"), sfx.left, sfx.right, safeGain);

const final = measure(finalPath);
console.log(`audio: ${final.input_i} LUFS, ${final.input_tp} dB peak, written to videos/${videoId}/output/audio/`);
