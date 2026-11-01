# Sound rules

Sound is generated from a video's `audio/score.mjs`, using `library/audio/synth.mjs`. Nothing is sampled or downloaded, so there's nothing to license. `tools/render.mjs` builds it and adds it to the video.

- **You can't hear the result.** Check timing and loudness with measurements and a spectrogram, and tell the user they must judge how it sounds. Never claim it sounds good.
- Most viewers are on phones. Keep important sound above about 120 Hz, as phone speakers can't play lower.
- Mix target is -14 LUFS with peaks near -1 dB. `tools/sound.mjs` handles this.
- Time sounds to the action using the panels' start times. Follow on-screen physics where possible.
- Many people watch muted, so the video must still work without sound.
- If a user supplies a track instead, confirm they hold the rights to use it.
