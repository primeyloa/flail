---
name: new-video
description: Start a new video in this project. Use when the user wants to make another video, promo or teaser.
disable-model-invocation: true
---

Start a new video: $ARGUMENTS

1. Compare the idea with each `pack.md` summary in `packs/`. Choose a pack only if its body, motion and camera language truly fit, otherwise propose `/new-pack`. Choose the next id in `videos/` and run `node tools/new.mjs video <id> <pack> "<title>"`.
2. Interview the user one question at a time, each with your recommended answer: goal, audience, where it's shown, length and shape, tone, audio, what the viewer should do. Don't ask what `brief.md` or `structure.md` already answers.
3. Push back when the content won't fit the length. A viewer gets about 2-3 words per second.
4. Fill in `brief.md`, adding any assets you need to `asset-requests.md`.
5. Stop for approval, then suggest `/write-script`.
