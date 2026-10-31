#!/usr/bin/env node
// Renders a video's panels and joins them, using no LLM tokens.
//   node tools/render.mjs vid001           draft: writes output/preview.mp4
//   node tools/render.mjs vid001 --final   writes output/final.mp4, refuses placeholders
// Panels whose inputs haven't changed are skipped.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const ffmpeg = require("ffmpeg-static");
const ffprobe = require("ffprobe-static").path;
const hyperframes = join(ROOT, "node_modules/.bin/hyperframes");
const env = { ...process.env, PATH: `${dirname(ffmpeg)}:${dirname(ffprobe)}:${process.env.PATH}` };

const [videoId, flag] = process.argv.slice(2);
if (!videoId) {
  console.error("Usage: node tools/render.mjs <video-id> [--final]");
  process.exit(1);
}
const isFinal = flag === "--final";
try {
  execFileSync(process.execPath, [join(ROOT, "tools/lint.mjs"), videoId], { stdio: "inherit" });
} catch {
  console.error("Fix the lint errors above before rendering.");
  process.exit(1);
}
const videoDir = join(ROOT, "videos", videoId);
const outDir = join(videoDir, "output");
mkdirSync(outDir, { recursive: true });

const yaml = readFileSync(join(videoDir, "video.yaml"), "utf8");
const field = (key) => (yaml.match(new RegExp(`^\\s+${key}:\\s*(.+?)\\s*$`, "m")) || [])[1] || "";
const event = { date: field("date"), venue: field("venue") };
const panels = [...yaml.matchAll(/^\s+-\s+(\S+)\s*$/gm)].map((m) => m[1]);

if (isFinal) {
  const missing = Object.entries(event).filter(([, value]) => !value || /^tba$/i.test(value)).map(([key]) => key);
  if (missing.length) {
    console.error(`Refusing final render: set ${missing.join(" and ")} in videos/${videoId}/video.yaml`);
    process.exit(1);
  }
}

const SHARED = ["library/rig/character.js", "_config/cast.js", "_config/tokens.css"];
function hashPanel(panelDir, html, usesEvent) {
  const hash = createHash("sha256").update(html);
  SHARED.forEach((file) => hash.update(readFileSync(join(ROOT, file))));
  const assets = join(panelDir, "assets");
  if (existsSync(assets)) readdirSync(assets).sort().forEach((file) => hash.update(readFileSync(join(assets, file))));
  if (usesEvent) hash.update(JSON.stringify(event));
  return hash.digest("hex");
}

const cachePath = join(outDir, ".hashes.json");
const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, "utf8")) : {};
const outputs = [];

panels.forEach((panel, i) => {
  const panelDir = join(videoDir, panel);
  const id = basename(panel);
  const scene = join(panelDir, "scene.html");
  const output = join(outDir, `${id}.mp4`);
  const html = readFileSync(scene, "utf8");
  const usesEvent = html.includes("data-composition-variables");

  // A panel can open on the previous panel's last frame, so the cut can't drift.
  if (html.includes("assets/from-previous.png")) {
    mkdirSync(join(panelDir, "assets"), { recursive: true });
    execFileSync(ffmpeg, ["-y", "-v", "error", "-sseof", "-0.04", "-i", outputs[i - 1], "-frames:v", "1", join(panelDir, "assets/from-previous.png")], { env });
  }

  const hash = hashPanel(panelDir, html, usesEvent);
  outputs.push(output);
  if (cache[id] === hash && existsSync(output)) {
    console.log(`${id}: unchanged, skipped`);
    return;
  }
  console.log(`${id}: rendering`);
  const args = ["render", ROOT, "-c", scene.slice(ROOT.length + 1), "-o", output, "-w", "2", "--quiet"];
  if (usesEvent) args.push("--variables", JSON.stringify(event));
  execFileSync(hyperframes, args, { env, cwd: ROOT, stdio: ["ignore", "ignore", "inherit"] });
  cache[id] = hash;
  writeFileSync(cachePath, JSON.stringify(cache, null, 2));
});

const listPath = join(outDir, ".concat.txt");
writeFileSync(listPath, outputs.map((file) => `file '${file}'`).join("\n"));
const joined = join(outDir, isFinal ? "final.mp4" : "preview.mp4");
execFileSync(ffmpeg, ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", joined], { env });
console.log(`Wrote ${joined.slice(ROOT.length + 1)}`);
