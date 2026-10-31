---
name: build-panel
description: Build or animate one video panel's scene from its script. Use when asked to build, animate or create a panel.
---

Build this panel: $ARGUMENTS

Read only the panel's `script.md`, `panel.yaml` and `scene.html`, `_config/style-guide.md`, `_config/motion.md`, and the `pack.md` and `lessons.md` of the pack named in `video.yaml`. Read files in the pack's `lib/` as needed. If the panel follows another, also read the previous panel's `scene.html` to match its end state. For an approach to copy, check the pack's `golden.md`.

1. Write `scene.html`. Reuse what's in the pack's `lib/`, and add new moves or characters there instead of in the scene.
2. If an asset is missing, add it to `asset-requests.md` and use a placeholder.
3. Run `node tools/render.mjs <video>`, then `node tools/sheet.mjs <video> <panel>`.
4. Look at the contact sheet and any cut image. Check: empty first frame, hands crossing faces, shapes colliding, unclear props, cut-off text, content outside the safe area, and every rule in `memory/lessons.md` and the pack's `lessons.md`.
5. Fix what you find and re-render. Stop after three rounds and report what's left.
6. Show the video with `SendUserFile` if available, otherwise give its path. Say what you checked and that sampled frames can't confirm motion quality. Stop for the user's verdict.
