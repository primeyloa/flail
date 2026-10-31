---
name: write-script
description: Write a panel-by-panel script and storyboard from a video's brief. Use after a brief is approved or when a script needs rewriting.
---

Write the script for: $ARGUMENTS

Read the video's `brief.md`, `_config/style-guide.md` and `memory/lessons.md`.

1. Propose a table: panel, time range, what's on screen, on-screen text, what it covers. Check the times add up to the brief's length and the text is readable at 2-3 words per second.
2. Plan how each panel flows into the next, with continuous camera or character movement instead of hard cuts.
3. Stop for approval. Don't build scenes yet.
4. Once approved, run `node tools/new.mjs panel <video> <section> <panel> <seconds> <light|dark>` for each panel, then fill in each `script.md`, and `cast` in `panel.yaml`.
5. Suggest `/build-panel` for the first panel, in a fresh session (`/clear`).
