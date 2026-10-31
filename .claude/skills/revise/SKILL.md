---
name: revise
description: Apply a specific change to a panel, script or character. Use when the user gives feedback or asks for a change to existing work.
---

Apply this change: $ARGUMENTS

1. If the request has no detail about what to change, ask. Do not re-render on a guess.
2. Find the cause before editing. If it's in the pack's `lib/`, fix it there, as that also fixes every other panel using it.
3. Make the smallest edit that works, in the fewest files.
4. Run `node tools/render.mjs <video>` and `node tools/sheet.mjs <video>`. Check the change, and that the cuts on both sides still match.
5. Show the result and say what changed, including anything else affected.
6. Record it with `/log-feedback`.
