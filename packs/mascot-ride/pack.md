# Pack: mascot-ride

**Use for:** playful, thrilling videos starring Clawd, with physics-led motion and big camera moves.

**Not for:** calm human stories. Use `flat-people` for those.

## Look

- Clawd comes only from `assets/clawd/`. Never redraw or restyle it, or change its colour.
- Brand colours and type from `_config/`, on light backgrounds. Props are simple flat shapes.
- Speech bubbles are liquid glass. They need something behind them to bend, or they read as plain white pills.

## Motion

- Clawd moves in whole-frame pose swaps, like an old game. Never bend or tween its body, though the whole sprite can move and rotate.
- Everything around Clawd moves smoothly, for contrast.
- Coaster speed comes from height: slow over crests, fast down drops. The car must start on a crest.
- Faster and more energetic than `flat-people`, on purpose.

## Library

- `lib/clawd.js`, `FlailClawd`: `create`, `pose`, `blink`, `walk`. Each panel lists the poses it uses.
- `lib/ride.js`, `FlailRide`: `buildTrack`, `buildCar`, `planRide` (one deterministic ride: car, camera, balloon and wind per frame, so panels can share a run across a cut), and `wind`. Put the wind container behind the world so lines don't cross characters.
- `lib/glass.js`, `FlailGlass`: `create` and `show` for speech bubbles.

## Proven in test

- Coaster physics, close-up on the drop, pull-back on the climb, and the camera holding while the car leaves: works, and renders fast (9s for 6s of video).
- Liquid glass: `backdrop-filter: url(#lens)` with a generated map that bends only near the rim. Looks right. Render time varies and the cause is unknown: 126s for the 3-second test, but 10s for the 6-second p01 with two bubbles, which uses `lib/glass.js` and hides bubbles when off screen. Use that library, and check the time after each render.
- A noise-based displacement map looks torn. `saturate` pushes coral towards orange. Don't use either.
- A balloon streaming back reads well on the drop, but it swings below the car on the climb.

