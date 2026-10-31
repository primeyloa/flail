#!/usr/bin/env node
// Scaffolds videos and panels, using no LLM tokens.
//   node tools/new.mjs video vid002 "Title"
//   node tools/new.mjs panel vid002 s01-hook p01 3.5 light
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [kind, videoId, ...rest] = process.argv.slice(2);
const videoDir = videoId && join(ROOT, "videos", videoId);
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (kind === "video" && videoId) {
  if (existsSync(videoDir)) fail(`${videoId} already exists`);
  mkdirSync(join(videoDir, "sections"), { recursive: true });
  const title = rest[0] || videoId;
  writeFileSync(join(videoDir, "video.yaml"), `title: ${title}\nsize: 1080x1920\nmax_seconds: 15\n\nevent:\n  date: TBA\n  venue: TBA\n\npanels:\n`);
  writeFileSync(join(videoDir, "brief.md"), `# ${videoId} brief\n\n- **Goal:**\n- **Audience:**\n- **Where:**\n- **Length:**\n- **Tone:** premium and calm\n- **Audio:**\n`);
  writeFileSync(join(videoDir, "asset-requests.md"), "# Asset requests\n\nOpen:\n\nDone:\n");
  console.log(`Created videos/${videoId}`);
} else if (kind === "panel" && videoId && rest.length >= 2) {
  const [section, panel, duration = "3", background = "light"] = rest;
  if (!existsSync(videoDir)) fail(`${videoId} doesn't exist; run: node tools/new.mjs video ${videoId}`);
  const relative = `sections/${section}/panels/${panel}`;
  const dir = join(videoDir, relative);
  if (existsSync(dir)) fail(`${panel} already exists`);
  mkdirSync(dir, { recursive: true });
  const template = readFileSync(join(ROOT, "library/templates/panel.html"), "utf8");
  const colours = background === "dark" ? { bg: "--ink", text: "--ivory", label: "--grey-on-dark" } : { bg: "--ivory", text: "--ink", label: "--grey" };
  const html = template.replaceAll("{{DURATION}}", duration).replaceAll("{{BG}}", colours.bg).replaceAll("{{TEXT}}", colours.text).replaceAll("{{LABEL}}", colours.label);
  writeFileSync(join(dir, "scene.html"), html);
  writeFileSync(join(dir, "script.md"), `# ${panel}\n\n**On screen:**\n\nWhat happens:\n`);
  writeFileSync(join(dir, "panel.yaml"), `id: ${panel}\nduration: ${duration}\nbackground: ${background}\nstatus: draft\ncast: []\n`);
  appendFileSync(join(videoDir, "video.yaml"), `  - ${relative}\n`);
  console.log(`Created videos/${videoId}/${relative}`);
} else {
  fail('Usage:\n  node tools/new.mjs video <id> "Title"\n  node tools/new.mjs panel <id> <section> <panel> [seconds] [light|dark]');
}
