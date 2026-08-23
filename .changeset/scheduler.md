---
'@the_viveksingh/vivek-ui': minor
---

Add `Scheduler` — a resource timeline, with a keyboard model.

Rooms, people or machines down the side; time across the top. Every booking tool, studio
calendar and shift roster needs this view, and no free React library ships one: shadcn/ui,
Mantine and Radix have nothing like it, and MUI's is behind a paid licence.

**Overlapping bookings stack into lanes.** Drawing them on top of one another hides a
double-booking, which on a scheduler is a data-loss bug rather than a cosmetic one. A greedy
pack gives each booking the first lane whose previous booking has already finished, and the
row grows to fit.

**It works without a pointer.** A timeline communicates entirely through position, and
position is invisible to a screen reader, so every booking carries its resource, its times
and its duration in its accessible name — *"Podcast. Studio A, 10:00 to 12:30, 2 hours 30
minutes"* — and the whole board is one tab stop with a roving focus:

| Key | Behaviour |
| --- | --- |
| Left / Right | Previous / next booking for this resource, in time order |
| Up / Down | The nearest booking in time on the resource above / below |
| Home / End | First / last booking for this resource |
| Enter or Space | Select |

Up and Down skip resources with nothing on them, because stopping on an empty row reads as a
dead key.

Two details that are easy to get wrong and hard to notice:

- **The clock is never read during render.** A `Date.now()` in the render body gives the
  server one marker position and the browser another, which React reports as a hydration
  mismatch. `showNow` reads it in an effect after mount; `now` takes an explicit time.
- **The axis snaps to local midnight, not to the epoch.** `Math.floor(ms / hour)` snaps
  against UTC, which labels an hourly axis 08:30, 09:30, 10:30 for every user in India,
  Nepal, Newfoundland or central Australia.

Times are formatted by a deterministic `HH:MM` rather than `Intl.DateTimeFormat`, whose
output varies between Node builds and browsers; pass `formatTime` for anything else.

**Nothing is mutated for you.** `onEventSelect` reports; your state decides.

29 tests, plus axe.
