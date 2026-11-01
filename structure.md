# Flail structure

Folder contract for the agent. Folders follow Interpretable Context Methodology
(Van Clief & McDermott): load only what the current step needs, keep every output
editable by hand.

## Layout

```text
flail/
├── CLAUDE.md, AGENTS.md, NOTES.md, structure.md
├── assets/             # brand kit and QR codes supplied by the club
├── _config/            # brand: tokens.css, fonts, style-guide.md; shared motion.md
├── library/vendor/     # GSAP, shared by every pack
├── library/audio/      # synth for generated music and effects; nothing to license
├── packs/              # one folder per animation type
│   ├── _starter/       # copied by: node tools/new.mjs pack <name>
│   ├── flat-people/    # pack.md, lessons.md, golden.md, template.html, lib/
│   └── mascot-ride/    # the same files, for Clawd and physics-led motion
├── memory/             # log.md and lessons.md (max 40 lines) that apply to every pack
├── tools/              # new, lint, render, sheet, sound: no LLM involved
├── .claude/skills/     # new-video, new-pack, write-script, build-panel, revise, log-feedback
└── videos/vid001/
    ├── video.yaml (names its pack), brief.md, asset-requests.md
    ├── sections/s01-hook/panels/p01/
    │   ├── script.md, scene.html, panel.yaml
    │   └── assets/
    └── output/         # proxies, section renders, final (gitignored)
```

## Pipeline

Each step waits for approval: brief, script, animatic, low-res panels, final render, feedback.

## Locked decisions

| #   | Decision        | Choice                                                                                 |
| --- | --------------- | -------------------------------------------------------------------------------------- |
| 1   | Character style | Flat, rigged 2D vector; darker skin tones; male and female cast                        |
| 2   | vid001          | 15 seconds, 1080x1920, social media teaser for the club kick-off                       |
| 3   | Agenda          | Teaser only; full agenda goes in the post caption                                      |
| 4   | Audio           | No voiceover; original generated music and effects built in, from `audio/score.mjs`    |
| 5   | Colours         | Brand kit: `#D97757`, `#141413`, `#FAF9F5`, `#F0EEE6`, `#5E5D59`                       |
| 6   | Backgrounds     | Ivory with sand shapes in p01-p02; `#141413` in p03-p04                                |
| 7   | Coral           | Shapes and very large text on light; any text on dark                                  |
| 8   | Logo            | `Logo · Compact stacked lockup.png` on the end card; no crest; no loose Claude logos   |
| 9   | Sign-up         | `qr-code.png` (Jotform join form) plus "Link in caption"; member check-in QR stays out |
| 10  | Date and venue  | Fields in `video.yaml`; final render refuses placeholders                              |
| 11  | Engine          | HyperFrames with GSAP; p01 test passed                                                 |
| 12  | Editing scope   | Generated animation, plus trimming and overlaying supplied footage                     |
| 13  | Reuse           | Template repo now; plugin after vid002                                                 |
| 14  | Budget          | Claude subscription: one panel per session, check `/usage`                             |
| 15  | Feel            | Premium and calm: unhurried motion, generous space, few elements, editorial type       |
| 16  | Animation types | One shared core plus a swappable pack per type; a video loads only its own pack       |

## vid001 cut

| Panel | Time | Text |
|---|---|---|
| p01 | 0-3.5s | "Hey, builder." |
| p02 | 3.5-6.5s | "Meet your crew." |
| p03 | 6.5-10.5s | "Watch Claude build. Then build yours." |
| p04 | 10.5-15s | Logo, "Come build with Claude.", date, venue, QR code, "Link in caption" |

## p01 test

Passes if a 1080x1920 render finishes in under 5 minutes without running out of
memory, and the character looks right to the club.
