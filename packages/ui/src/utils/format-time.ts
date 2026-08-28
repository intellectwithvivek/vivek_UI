/**
 * Media clock text: `m:ss` under an hour, `h:mm:ss` from an hour up, never `NaN:NaN`.
 *
 * `duration` is `NaN` until metadata loads and `Infinity` for a live stream; both read as
 * `0:00` rather than leaking into the UI.
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const whole = Math.floor(seconds)
  const h = Math.floor(whole / 3600)
  const m = Math.floor((whole % 3600) / 60)
  const s = whole % 60
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m)
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`
}
