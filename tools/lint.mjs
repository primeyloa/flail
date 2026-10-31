#!/usr/bin/env node
// Checks a video's panels against the project's rules, using no LLM tokens.
//   node tools/lint.mjs vid001
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const videoId = process.argv[2];
if (!videoId) {
  console.error("Usage: node tools/lint.mjs <video-id>");
  process.exit(1);
}
const videoDir = join(ROOT, "videos", videoId);
const yaml = readFileSync(join(videoDir, "video.yaml"), "utf8");
const top = (text, key) => (text.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m")) || [])[1];
const panels = [...yaml.matchAll(/^\s+-\s+(\S+)\s*$/gm)].map((m) => m[1]);
const [width, height] = (top(yaml, "size") || "1080x1920").split("x");
const maxSeconds = Number(top(yaml, "max_seconds") || Infinity);

const HEX = /#[0-9a-fA-F]{6}\b/g;
const pack = top(yaml, "pack");
if (!pack || !existsSync(join(ROOT, "packs", pack))) {
  console.error(`error    video.yaml must name a pack in packs/ (found: ${pack || "none"})`);
  process.exit(1);
}
const packLib = join(ROOT, "packs", pack, "lib");
const allowed = new Set([join(ROOT, "_config/tokens.css"), ...readdirSync(packLib).map((file) => join(packLib, file))].flatMap((file) =>
  (readFileSync(file, "utf8").match(HEX) || []).map((hex) => hex.toUpperCase())));

const errors = [], warnings = [];
let total = 0;

panels.forEach((panel, i) => {
  const dir = join(videoDir, panel);
  const id = panel.split("/").pop();
  const error = (message) => errors.push(`${id}: ${message}`);
  ["script.md", "panel.yaml", "scene.html"].forEach((file) => {
    if (!existsSync(join(dir, file))) error(`missing ${file}`);
  });
  if (!existsSync(join(dir, "scene.html")) || !existsSync(join(dir, "panel.yaml"))) return;

  const html = readFileSync(join(dir, "scene.html"), "utf8");
  const meta = readFileSync(join(dir, "panel.yaml"), "utf8");
  const attr = (name) => (html.match(new RegExp(`${name}="([^"]+)"`)) || [])[1];

  const duration = Number(top(meta, "duration"));
  total += duration;
  if (Number(attr("data-duration")) !== duration) error(`scene lasts ${attr("data-duration")}s but panel.yaml says ${duration}s`);
  if (attr("data-width") !== width || attr("data-height") !== height) error(`scene is ${attr("data-width")}x${attr("data-height")}, expected ${width}x${height}`);
  if (!/gsap\.timeline\(\{\s*paused:\s*true/.test(html)) error("timeline must be created with { paused: true }");
  if (!html.includes('window.__timelines["root"]')) error('timeline must be registered on window.__timelines["root"]');

  const offPalette = [...new Set((html.match(HEX) || []).map((hex) => hex.toUpperCase()))].filter((hex) => !allowed.has(hex));
  if (offPalette.length) error(`colours not in tokens.css or the pack's lib/: ${offPalette.join(", ")}`);

  if (/(src|href)="https?:/.test(html)) error("loads a remote file; use local copies so renders are repeatable");
  for (const [, path] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (path.endsWith("from-previous.png")) {
      if (i === 0) error("first panel can't use the previous panel's frame");
      continue;
    }
    if (!existsSync(join(dir, path))) error(`missing file: ${path}`);
  }

  if (top(meta, "background") === "light" && /[^-]color:\s*var\(--coral\)/.test(html)) {
    warnings.push(`${id}: coral text on a light background is about 3:1 contrast`);
  }
});

if (total > maxSeconds) errors.push(`video lasts ${total}s, over the ${maxSeconds}s limit`);
warnings.forEach((message) => console.warn(`warning  ${message}`));
errors.forEach((message) => console.error(`error    ${message}`));
console.log(`${panels.length} panels, ${total}s: ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
