import { describe, expect, it } from 'vitest'
import { formatTime } from './format-time'

describe('formatTime', () => {
  it('formats m:ss under an hour and h:mm:ss above', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(9)).toBe('0:09')
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(3599)).toBe('59:59')
    expect(formatTime(3600)).toBe('1:00:00')
    expect(formatTime(3725)).toBe('1:02:05')
  })

  it('floors fractional seconds', () => {
    expect(formatTime(64.9)).toBe('1:04')
  })

  it('never shows NaN or Infinity: unknown and live durations read as 0:00', () => {
    expect(formatTime(Number.NaN)).toBe('0:00')
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe('0:00')
    expect(formatTime(-3)).toBe('0:00')
  })
})
