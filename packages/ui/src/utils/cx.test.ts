import { describe, expect, it } from 'vitest'
import { cx } from './cx'

describe('cx', () => {
  it('joins class names with a single space', () => {
    expect(cx('vk-button', 'my-button')).toBe('vk-button my-button')
  })

  it('filters out every falsy value', () => {
    expect(cx('vk-button', undefined, null, false, '')).toBe('vk-button')
  })

  it('returns an empty string when nothing survives filtering', () => {
    expect(cx(undefined, null, false)).toBe('')
  })

  it('keeps conditional classes readable', () => {
    const active = true
    const disabled = false
    expect(cx('vk-tab', active && 'is-active', disabled && 'is-disabled')).toBe('vk-tab is-active')
  })

  it('accepts no arguments at all', () => {
    expect(cx()).toBe('')
  })
})
