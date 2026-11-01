# Flail

Flail is an AI agent that makes short animated videos from a brief. You approve each step, and every video stays as files you can open and edit by hand.

It runs on [Claude Code](https://claude.com/claude-code). Scenes are HTML with GSAP motion, rendered with [HyperFrames](https://www.npmjs.com/package/hyperframes). So far it has made two vertical videos for the Claude Builder Club at the University of Ghana:

| Video | Length | Pack | What it is |
|---|---|---|---|
| `vid001` | 15s | `flat-people` | Kick-off teaser with flat 2D characters |
| `vid002` | 20s | `mascot-ride` | Two Clawds ride a roller coaster |

## How it works

Each step waits for your approval: brief, script, panels, full preview, final render, feedback.

- **Everything is editable.** A video is a folder of panels, each with a script and an HTML scene.
- **Packs hold the animation types.** Each pack has its own rules, library, template, lessons and examples. A video names one pack and loads only that one.
- **The agent loads only what a step needs.** The folder structure decides what it reads, which saves tokens and keeps it focused.
- **It checks its own work.** Before showing a panel, it renders it and reviews a contact sheet and the frames either side of each cut. Sampled frames don't prove motion is good, so you still have the final say.
- **It learns from feedback.** Your notes go into a log, and the lessons become rules for later work.
- **Sound is generated in code.** Music and effects come from a score file, so there's nothing to license.
- **Routine work uses no LLM.** Rendering, linting, contact sheets and sound are plain Node scripts.

## Setup

You need Node.js and Claude Code. FFmpeg comes with the npm dependencies.

```bash
git clone https://github.com/primeyloa/flail.git
```

```bash
cd flail
```

```bash
npm install
```

## Make a video

Open Claude Code in the project and start with:

```text
/new-video a 20-second invite to our next build night
```

The agent interviews you, fills in the brief, and takes you through the remaining steps.

| Command | What it does |
|---|---|
| `/new-video` | Starts a video and writes its brief |
| `/write-script` | Writes a panel-by-panel script from the brief |
| `/build-panel` | Builds one panel from its script |
| `/revise` | Applies a specific change to a panel, script or character |
| `/log-feedback` | Records your verdict so later work learns from it |
| `/new-pack` | Adds a new animation type |

## Run the tools

These work without Claude Code.

| Command | What it does |
|---|---|
| `node tools/new.mjs video <id> <pack> "<title>"` | Creates a video folder |
| `node tools/new.mjs panel <id> <section> <panel> <seconds> <light\|dark>` | Creates a panel |
| `node tools/new.mjs pack <name>` | Creates a pack from `packs/_starter` |
| `node tools/lint.mjs <id>` | Checks a video's panels against the project's rules |
| `node tools/render.mjs <id>` | Renders changed panels and writes `output/preview.mp4` |
| `node tools/render.mjs <id> --final` | Writes `output/final.mp4`, and refuses placeholders |
| `node tools/sheet.mjs <id>` | Makes contact sheets and compares frames at each cut |
| `node tools/sound.mjs <id>` | Builds music and effects from `audio/score.mjs` |

For example, to re-render the roller coaster video:

```bash
node tools/render.mjs vid002
```

## Project layout

```text
flail/
├── _config/     # brand tokens, fonts, style guide, motion and sound rules
├── assets/      # brand kit and other supplied files
├── library/     # GSAP and the audio synth, shared by every pack
├── memory/      # feedback log and lessons for every pack
├── packs/       # one folder per animation type
├── tools/       # new, lint, render, sheet, sound
├── videos/      # one folder per video
└── .claude/skills/  # the slash commands above
```

`AGENTS.md` has the agent's rules, and `structure.md` has the folder contract and locked decisions.

## Reuse it for another brand

Replace `_config/tokens.css`, `_config/style-guide.md` and `assets/`, then edit the brand rules in `AGENTS.md`. The tools, skills and pack libraries don't depend on the club, apart from each pack's cast and palette.

The club's brand kit and Clawd in `assets/` were approved for club use, so replace them rather than reusing them.

## Credits

The idea came from Tedlee Appiah-Kubi's work, which Flail builds on.

Using folder structure as agent architecture comes from [Interpretable Context Methodology](https://arxiv.org/abs/2603.16021) by Jake Van Clief and David McDermott.
