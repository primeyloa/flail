# Style guide: Claude Builder Club, University of Ghana

Brand rules that apply to every animation pack.

## Feel

Premium and calm: generous space, few elements, editorial type, nothing competing for attention. Do not add energy for its own sake.

## Colour

Tokens are in `tokens.css`; `tools/lint.mjs` rejects any other colours in a scene unless they're in `tokens.css` or the pack's `lib/`.

- Light scenes: ivory `#FAF9F5` with sand `#F0EEE6` shapes. Text is ink `#141413`.
- Dark scenes: ink `#141413`. Text is ivory, with coral `#D97757` as an accent.
- Coral on light is about 3:1 contrast, so use it for shapes only.
- Dark clothes and hair vanish on solid dark, so keep characters on ivory, for example inside a circle.

## Type

- Headlines: Source Serif 4, regular weight, about 136px in vertical video. These are close matches chosen by eye, as the kit doesn't name its fonts.
- Labels: Inter 500, uppercase, tracked out, about 26px.
- Keep lines short. A viewer gets about 2-3 words per second.

## Layout (1080x1920)

- Keep text and key content above y=1570 and below y=220, clear of app buttons and captions.
- Left margin 90px for headlines. End cards are centred.

## Brand assets

- End card logo: `Logo · Compact stacked lockup.png`. It carries "University of Ghana" as text, which is allowed. No crest yet.
- Sign-up: `qr-code.png` (Jotform join form). Always add "Link in caption", because a phone can't scan its own screen.
