# Clawd

Generated from the block characters that draw Clawd in the Claude Code CLI v2.1.310, not traced from an image. The club lead confirmed on 2026-10-31 that the club may use Clawd.

| File | Use |
|---|---|
| `clawd.svg`, `clawd.png` | Main Clawd, the compact logo shown at Claude Code startup |
| `clawd-welcome.svg` | The other version, from the CLI's welcome screen: longer legs, smaller eyes |
| `sprites/` | 22 poses from the CLI: arms up, looking, blink, wink, one foot lifted, and turning all the way round |
| `clawd-poses.json` | The source characters and colours |

Rebuild sprites with `node tools/clawd-sprites.mjs`.

## Rules

- Don't redraw or restyle Clawd. Scale sprites up with crisp edges so pixels stay sharp.
- The body is `#D77757`, from the CLI. It's slightly different from the club kit's coral `#D97757`. Keep it as it is.
- The shapes assume a terminal cell twice as tall as it is wide, as the exact ratio varies by font.
