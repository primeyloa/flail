# Pack: flat people

**Use for:** calm, editorial videos with human characters, seen side-on: explainers, invitations, community stories.

**Not for:** mascots, physics-led motion, or big dimensional camera moves. Make another pack for those.

## Characters

- Flat 2D, side view, darker skin tones, mixed male and female, all fictional.
- Give each person a distinct silhouette through hair, build and clothing.
- Far-side limbs are slightly darker so overlapping limbs stay readable.
- Dark clothes and hair vanish on solid dark, so keep characters on ivory, for example inside a circle.
- The cast is in `lib/cast.js`.

## Motion

- About 1 second per stride.
- Use slow camera moves that last the whole panel, with `sine` and `power2` eases.
- Add follow-through: forearms trail upper arms, braids trail the head.

## Rig

`FlailRig` in `lib/character.js`: `createCharacter`, `stand`, `walk`, `wave`, `laugh`, `gesture`, `blink`. Add new moves to the rig, not to scenes.

Characters face right; pass `flip: true` to face left. Positive rotation swings a limb backwards. If a limb starts in a pose, do not also call `stand()` on it, because `stand()` overrides that pose.
