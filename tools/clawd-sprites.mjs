#!/usr/bin/env node
// Turns the block characters in assets/clawd/clawd-poses.json into SVG sprites.
//   node tools/clawd-sprites.mjs
// A terminal cell is about twice as tall as it is wide, so a quarter-cell block is drawn 1 wide by 2 tall.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets/clawd");
const data = JSON.parse(readFileSync(join(OUT, "clawd-poses.json"), "utf8"));
const BODY = data.colours.body, DARK = data.colours.background;

// Which quarters of a cell each glyph fills: upper left, upper right, lower left, lower right.
const QUARTERS = {
  "▘": "1000", "▝": "0100", "▖": "0010", "▗": "0001", "▌": "1010", "▐": "0101", "▀": "1100", "▄": "0011",
  "▛": "1110", "▜": "1101", "▙": "1011", "▟": "0111", "█": "1111", " ": "0000",
};

function cellRects(glyph, column, row, fill) {
  if (glyph === "▂") return [[column * 2, row * 2 + 1.5, 2, 0.5, fill]]; // Lower quarter block.
  const quarters = QUARTERS[glyph];
  if (quarters === undefined) throw new Error(`Unknown glyph: ${glyph}`);
  return [...quarters].flatMap((on, i) => (on === "1" ? [[column * 2 + (i % 2), row * 2 + (i >> 1), 1, 1, fill]] : []));
}

// `dark` cells have a dark background behind the glyph, which is what makes the eyes.
function drawCell(glyph, column, row, { dark = false, lid = false } = {}) {
  if (glyph === " " && !dark) return [];
  if (lid) return [[column * 2, row * 2, 2, 2, BODY], ...cellRects(glyph, column, row, DARK)];
  const rects = dark ? [[column * 2, row * 2, 2, 2, DARK]] : [];
  return [...rects, ...cellRects(glyph, column, row, BODY)];
}

function drawText(text, startColumn, row, options) {
  return [...text].flatMap((glyph, i) => drawCell(glyph, startColumn + i, row, options));
}

function standing(pose) {
  const arms = data.arms[pose.arms];
  let column = 2;
  const eyes = data.eyes[pose.eyes].flatMap(({ glyphs, lid }) => {
    const rects = drawText(glyphs, column, 0, lid ? { lid: true } : { dark: true });
    column += [...glyphs].length;
    return rects;
  });
  return [
    ...drawText(arms.r1L, 0, 0), ...eyes, ...drawText(arms.r1R, 8, 0),
    ...drawText(arms.r2L, 0, 1), ...drawText("█████", 2, 1), ...drawText(arms.r2R, 7, 1),
    ...drawText(data.feet[pose.feet], 0, 2),
  ];
}

function turning(rows) {
  return rows.flatMap(({ glyphs, from, to }, row) =>
    [...glyphs].flatMap((glyph, column) => drawCell(glyph, column, row, { dark: column >= from && column < to })));
}

// Merges same-coloured runs so the SVG stays small and shows no seams between pixels.
function toSvg(rects, comment) {
  const merged = [];
  for (const rect of [...rects].sort((a, b) => a[1] - b[1] || a[0] - b[0])) {
    const last = merged.at(-1);
    if (last && last[1] === rect[1] && last[3] === rect[3] && last[4] === rect[4] && last[0] + last[2] === rect[0]) last[2] += rect[2];
    else merged.push([...rect]);
  }
  const body = merged.filter((r) => r[4] === BODY), dark = merged.filter((r) => r[4] === DARK);
  // Dark cells sit behind the body except for lid lines, so draw eyes first unless they're lids.
  const lids = dark.filter((r) => r[3] === 0.5), behind = dark.filter((r) => r[3] !== 0.5);
  const lines = [...behind, ...body, ...lids].map(([x, y, w, h, fill]) => `  <rect x="${x}" y="${y * 2}" width="${w}" height="${h * 2}" fill="${fill}"/>`);
  return `<!-- ${comment} -->\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 12" shape-rendering="crispEdges">\n${lines.join("\n")}\n</svg>\n`;
}

mkdirSync(join(OUT, "sprites"), { recursive: true });
const source = `Clawd, generated from the block characters in Claude Code CLI v${data.cliVersion}`;
const names = [];
const write = (name, rects) => {
  writeFileSync(join(OUT, "sprites", `${name}.svg`), toSvg(rects, `${source}: ${name}`));
  names.push(name);
};

for (const [name, pose] of Object.entries(data.poses)) write(name, standing(pose));
write("one-arm-up", standing({ eyes: "open", arms: "one-up", feet: "both" }));
write("blink", standing({ eyes: "closed", arms: "down", feet: "both" }));
write("wink", standing({ eyes: "wink", arms: "down", feet: "both" }));
write("step-left", standing({ eyes: "open", arms: "down", feet: "left" }));
write("step-right", standing({ eyes: "open", arms: "down", feet: "right" }));
for (const [name, rows] of Object.entries(data.facing)) write(`facing-${name}`, turning(rows));

writeFileSync(join(OUT, "clawd.svg"), toSvg(standing(data.poses.default), `${source}: default`));
console.log(`${names.length} sprites: ${names.join(", ")}`);
