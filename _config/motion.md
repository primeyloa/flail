# Motion rules

## Timing

- About 1 second per stride. A walk needs room, so lengthen the panel before speeding up the motion.
- Text fades in over 0.7-1s with a small rise (about 22px). Fade out over about 0.3s.
- Use slow camera moves that last the whole panel. Use `sine` and `power2` eases; avoid bouncy ones.

## Bodies

- Keep limbs moving through poses. Never ease to a stop at each key pose, because that reads as rigid. `FlailRig.walk` samples continuous curves.
- Each arm swings opposite the leg on the same side.
- When standing, legs are straight and parallel.
- Add follow-through: forearms trail upper arms, braids trail the head.
- Keep raised hands clear of the face and of background shapes.

## Rig moves

`FlailRig`: `createCharacter`, `stand`, `walk`, `wave`, `laugh`, `gesture`, `blink`. Add new moves to the rig, not to scenes.

Characters face right; pass `flip: true` to face left. Positive rotation swings a limb backwards.

## Cuts between panels

Start each panel on the previous panel's last frame:

- Recreate the end state with `tl.set` at time 0, or use the previous frame directly by referencing `assets/from-previous.png`, which `tools/render.mjs` generates.
- If a limb starts in a pose, do not also call `stand()` on it, because `stand()` overrides that pose.
- Start props fully outside the frame.
- `tools/sheet.mjs` compares the frames either side of each cut.

## HyperFrames basics

- The root needs `data-composition-id`, `data-duration`, `data-fps`, `data-width` and `data-height`.
- Use `gsap.timeline({ paused: true })` and register it on `window.__timelines["root"]`.
- Load GSAP from `library/vendor/`, not a CDN.
- Run `npx hyperframes docs <topic>` for more; topics include `gsap`, `compositions` and `troubleshooting`.
