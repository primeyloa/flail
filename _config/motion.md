# Motion rules for every pack

Body, rig and camera rules specific to an animation type are in that pack's `pack.md`.

## Timing

- Text fades in over 0.7-1s with a small rise (about 22px). Fade out over about 0.3s.
- Give motion time. Lengthen a panel before speeding up the motion.
- Keep things moving through key poses. Easing to a stop at each one reads as rigid.
- Avoid bouncy eases unless the pack says otherwise.

## Cuts between panels

Start each panel on the previous panel's last frame:

- Recreate the end state with `tl.set` at time 0, or use the previous frame directly by referencing `assets/from-previous.png`, which `tools/render.mjs` generates.
- Don't set the same property twice at time 0, because the wrong one can win.
- Start props fully outside the frame.
- `tools/sheet.mjs` compares the frames either side of each cut.

## HyperFrames basics

- The root needs `data-composition-id`, `data-duration`, `data-fps`, `data-width` and `data-height`.
- Use `gsap.timeline({ paused: true })` and register it on `window.__timelines["root"]`.
- Load GSAP from `library/vendor/`, not a CDN.
- Run `npx hyperframes docs <topic>` for more; topics include `gsap`, `compositions` and `troubleshooting`.
