#!/usr/bin/env node
// Makes contact sheets and compares the frames either side of each cut, using no LLM tokens.
//   node tools/sheet.mjs vid001          every panel
//   node tools/sheet.mjs vid001 p03      one panel (cuts are still checked)
// Writes to videos/<id>/output/sheets/. Review these instead of taking many screenshots.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const ffmpeg = require("ffmpeg-static");
const ffprobe = require("ffprobe-static").path;
const FRAMES = 8;
const CUT_WARNING_DB = 35; // Below this, the two sides of a cut visibly differ.

const [videoId, only] = process.argv.slice(2);
if (!videoId) {
  console.error("Usage: node tools/sheet.mjs <video-id> [panel-id]");
  process.exit(1);
}
const videoDir = join(ROOT, "videos", videoId);
const outDir = join(videoDir, "output");
const sheetDir = join(outDir, "sheets");
mkdirSync(sheetDir, { recursive: true });

const yaml = readFileSync(join(videoDir, "video.yaml"), "utf8");
const ids = [...yaml.matchAll(/^\s+-\s+(\S+)\s*$/gm)].map((m) => m[1].split("/").pop());
const run = (...args) => execFileSync(ffmpeg, ["-y", "-v", "error", ...args]);
const clip = (id) => join(outDir, `${id}.mp4`);

ids.filter((id) => !only || id === only).forEach((id) => {
  if (!existsSync(clip(id))) return console.warn(`${id}: not rendered yet`);
  const seconds = execFileSync(ffprobe, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", clip(id)]).toString().trim();
  const sheet = join(sheetDir, `${id}.png`);
  run("-i", clip(id), "-vf", `fps=${FRAMES}/${seconds},scale=240:-1,tile=${FRAMES}x1:padding=6:color=white`, "-frames:v", "1", sheet);
  console.log(`${id}: ${sheet.slice(ROOT.length + 1)}`);
});

ids.slice(1).forEach((id, i) => {
  const before = ids[i];
  if (!existsSync(clip(before)) || !existsSync(clip(id))) return;
  const a = join(sheetDir, `.${before}-end.png`), b = join(sheetDir, `.${id}-start.png`);
  run("-sseof", "-0.04", "-i", clip(before), "-frames:v", "1", "-vf", "scale=360:-1", a);
  run("-i", clip(id), "-frames:v", "1", "-vf", "scale=360:-1", b);
  const cut = join(sheetDir, `cut-${before}-${id}.png`);
  run("-i", a, "-i", b, "-filter_complex", "[0][1]hstack=2", "-frames:v", "1", cut);
  const { stderr } = spawnSync(ffmpeg, ["-i", a, "-i", b, "-filter_complex", "psnr", "-f", "null", "-"], { encoding: "utf8" });
  const match = stderr.match(/average:([0-9.]+|inf)/);
  const score = match ? match[1] : "unknown";
  const flagged = score !== "inf" && Number(score) < CUT_WARNING_DB ? "  WARNING: frames differ, check this cut" : "";
  console.log(`cut ${before} to ${id}: ${score} dB${flagged}  ${cut.slice(ROOT.length + 1)}`);
});
