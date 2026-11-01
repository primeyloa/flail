---
name: new-pack
description: Create a new animation pack when a video's animation type doesn't fit any existing pack, such as mascots, physics-led motion or a different camera language.
disable-model-invocation: true
---

Create a pack for: $ARGUMENTS

1. Confirm no pack in `packs/` fits. Differences in story or colour don't need a new pack. Different bodies, physics or camera language do.
2. Run `node tools/new.mjs pack <name>`.
3. List the riskiest effects, and check for any character or brand assets that need permission. Add those to the video's `asset-requests.md`.
4. Before writing rules or building a library, prove each risky effect in one short test scene, using `/build-panel`. Change approach if it fails or looks poor.
5. Fill in `pack.md` with what the tests showed, including limits. Put reusable code in the pack's `lib/`.
6. Show the test and stop for approval before building real panels.

Keep the shared workflow in `AGENTS.md` and brand rules in `_config/`. Don't copy them into the pack.
