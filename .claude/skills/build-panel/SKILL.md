---
name: build-panel
description: Build or animate one video panel's scene from its script. Use when asked to build, animate or create a panel.
---

Build this panel: $ARGUMENTS

Read only the panel's `script.md`, `panel.yaml` and `scene.html`, plus `_config/style-guide.md`, `_config/motion.md` and `library/rig/character.js`. If the panel follows another, also read the previous panel's `scene.html` to match its end state. For an approach to copy, check `memory/golden/README.md`.

1. Write `scene.html`. Reuse rig moves and the cast. Add new moves to the rig, and new people to `_config/cast.js`.
2. If an asset is missing, add it to `asset-requests.md` and use a placeholder.
3. Run `node tools/render.mjs <video>`, then `node tools/sheet.mjs <video> <panel>`.
4. Look at the contact sheet and any cut image. Check: empty first frame, hands crossing faces, shapes colliding, unclear props, cut-off text, content outside the safe area, and every rule in `memory/lessons.md`.
5. Fix what you find and re-render. Stop after three rounds and report what's left.
6. Show the video with `SendUserFile` if available, otherwise give its path. Say what you checked and that sampled frames can't confirm motion quality. Stop for the user's verdict.
