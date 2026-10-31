#!/usr/bin/env node
// Scaffolds packs, videos and panels, using no LLM tokens.
//   node tools/new.mjs pack mascot-ride
//   node tools/new.mjs video vid002 mascot-ride "Title"
//   node tools/new.mjs panel vid002 s01-hook p01 3.5 light
import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [kind, id, ...rest] = process.argv.slice(2);
const videoDir = id && join(ROOT, "videos", id);
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (kind === "pack" && id) {
  const dir = join(ROOT, "packs", id);
  if (existsSync(dir)) fail(`Pack ${id} already exists`);
  cpSync(join(ROOT, "packs/_starter"), dir, { recursive: true });
  ["pack.md", "lessons.md", "golden.md"].forEach((file) => {
    writeFileSync(join(dir, file), readFileSync(join(dir, file), "utf8").replaceAll("{{NAME}}", id));
  });
  console.log(`Created packs/${id}`);
} else if (kind === "video" && id && rest.length) {
  const [pack, title = id] = rest;
  if (!existsSync(join(ROOT, "packs", pack))) fail(`Pack ${pack} doesn't exist; run: node tools/new.mjs pack ${pack}`);
  if (existsSync(videoDir)) fail(`${id} already exists`);
  mkdirSync(join(videoDir, "sections"), { recursive: true });
  writeFileSync(join(videoDir, "video.yaml"), `title: ${title}\npack: ${pack}\nsize: 1080x1920\nmax_seconds: 15\n\nevent:\n  date: TBA\n  venue: TBA\n\npanels:\n`);
  writeFileSync(join(videoDir, "brief.md"), `# ${id} brief\n\n- **Goal:**\n- **Audience:**\n- **Where:**\n- **Length:**\n- **Tone:**\n- **Audio:**\n`);
  writeFileSync(join(videoDir, "asset-requests.md"), "# Asset requests\n\nOpen:\n\nDone:\n");
  console.log(`Created videos/${id} using pack ${pack}`);
} else if (kind === "panel" && id && rest.length >= 2) {
  const [section, panel, duration = "3", background = "light"] = rest;
  if (!existsSync(videoDir)) fail(`${id} doesn't exist; run: node tools/new.mjs video ${id} <pack>`);
  const relative = `sections/${section}/panels/${panel}`;
  const dir = join(videoDir, relative);
  if (existsSync(dir)) fail(`${panel} already exists`);
  mkdirSync(dir, { recursive: true });
  const pack = readFileSync(join(videoDir, "video.yaml"), "utf8").match(/^pack:\s*(\S+)/m)[1];
  const template = readFileSync(join(ROOT, "packs", pack, "template.html"), "utf8");
  const colours = background === "dark" ? { bg: "--ink", text: "--ivory", label: "--grey-on-dark" } : { bg: "--ivory", text: "--ink", label: "--grey" };
  const html = template.replaceAll("{{DURATION}}", duration).replaceAll("{{BG}}", colours.bg).replaceAll("{{TEXT}}", colours.text).replaceAll("{{LABEL}}", colours.label);
  writeFileSync(join(dir, "scene.html"), html);
  writeFileSync(join(dir, "script.md"), `# ${panel}\n\n**On screen:**\n\nWhat happens:\n`);
  writeFileSync(join(dir, "panel.yaml"), `id: ${panel}\nduration: ${duration}\nbackground: ${background}\nstatus: draft\ncast: []\n`);
  appendFileSync(join(videoDir, "video.yaml"), `  - ${relative}\n`);
  console.log(`Created videos/${id}/${relative}`);
} else {
  fail('Usage:\n  node tools/new.mjs pack <name>\n  node tools/new.mjs video <id> <pack> "Title"\n  node tools/new.mjs panel <id> <section> <panel> [seconds] [light|dark]');
}
