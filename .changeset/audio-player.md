---
'@the_viveksingh/vivek-ui': minor
---

`AudioPlayer` — an audio player with its own controls, for podcasts, voice notes and samples.

A bordered card in the theme's colours with an optional artwork + title row, then one
control row: play, elapsed, seek, total, mute, volume, speed. Every control is a real
`<button>` or `<input type="range">` with a name; the seek bar announces "1:23 of 4:56"
and volume announces a percentage. Space/K play, arrows seek and change volume, J/L jump
ten seconds, M mutes. Several `src` sources, an error state with `role="status"`, `size="sm"`
for inline use, and `audioRef` / `audioProps` for anything the player does not model.
Progressive files only (MP3, OGG, WAV, AAC).

`formatTime` — the media clock formatter both players share — is an internal utility.
