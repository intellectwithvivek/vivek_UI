---
'@the_viveksingh/vivek-ui': minor
---

`VideoPlayer` — a video player with its own controls, for progressive files (MP4, WebM).

The native `controls` attribute gives every browser a different, unstyleable bar and no
keyboard contract worth documenting. This one has one bar, every control a real `<button>`
or `<input type="range">` with a name, and the shortcuts people expect from every player
they have used: Space/K play, arrows seek and change volume, J/L jump ten seconds, M mutes,
C toggles captions, F goes fullscreen. The seek bar announces "1:23 of 4:56"; volume
announces a percentage.

Controls fade while the pointer rests during playback and come back on any movement, key
or focus — faded, never removed, so a keyboard user always has them. Multiple `src`
sources, WebVTT `tracks`, poster, playback speeds, picture-in-picture and fullscreen where
the browser supports them, an error state with `role="status"`, and `videoRef` /
`videoProps` for anything the player does not model. No streaming (HLS/DASH) — that is a
different component.
