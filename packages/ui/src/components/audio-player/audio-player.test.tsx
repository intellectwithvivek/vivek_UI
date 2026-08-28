/**
 * AudioPlayer.
 *
 * jsdom has no media pipeline, so the suite drives the element the way a browser would -
 * firing the media events and setting the properties they would set - and checks that the
 * controls, the announced values and the keyboard contract follow.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { AudioPlayer } from './audio-player'

let playSpy: ReturnType<typeof vi.spyOn>
let pauseSpy: ReturnType<typeof vi.spyOn>

beforeAll(() => {
  playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    fireEvent.play(this)
    return Promise.resolve()
  })
  pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    fireEvent.pause(this)
  })
})
afterAll(() => {
  playSpy.mockRestore()
  pauseSpy.mockRestore()
})

const audio = () => document.querySelector('audio') as HTMLAudioElement
const button = (name: string) => screen.getByRole('button', { name })
const seek = () => screen.getByRole('slider', { name: 'Seek' })

function loadMetadata(duration: number) {
  Object.defineProperty(audio(), 'duration', { configurable: true, get: () => duration })
  fireEvent.loadedMetadata(audio())
}

describe('AudioPlayer · structure', () => {
  it('renders with zero props: a named group, a hidden audio element, seek disabled until metadata', () => {
    render(<AudioPlayer />)
    expect(screen.getByRole('group', { name: 'Audio player' })).toBeInTheDocument()
    expect(audio()).toBeInTheDocument()
    expect(audio()).not.toHaveAttribute('controls')
    expect(audio()).toHaveAttribute('preload', 'metadata')
    expect(seek()).toBeDisabled()
    expect(button('Play')).toBeInTheDocument()
    expect(button('Mute')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Playback speed' })).toBeInTheDocument()
  })

  it('a string title names the group; label overrides; artwork is decorative', () => {
    const { rerender } = render(
      <AudioPlayer title="Episode 12" subtitle="42 min" artwork="/art.jpg" src="/e12.mp3" />,
    )
    expect(screen.getByRole('group', { name: 'Episode 12' })).toBeInTheDocument()
    expect(screen.getByText('42 min')).toBeInTheDocument()
    const img = document.querySelector('img')
    expect(img).toHaveAttribute('src', '/art.jpg')
    expect(img).toHaveAttribute('alt', '')
    rerender(<AudioPlayer title={<em>Fancy</em>} label="Intro music" />)
    expect(screen.getByRole('group', { name: 'Intro music' })).toBeInTheDocument()
    expect(document.querySelector('.vk-audio-player__header')).toBeInTheDocument()
    rerender(<AudioPlayer />)
    expect(document.querySelector('.vk-audio-player__header')).toBeNull()
  })

  it('renders several sources; forwards audioRef, audioProps, size, className, style and rest', () => {
    const audioRef = { current: null as HTMLAudioElement | null }
    render(
      <AudioPlayer
        src={[
          { src: '/a.ogg', type: 'audio/ogg' },
          { src: '/a.mp3', type: 'audio/mpeg' },
        ]}
        size="sm"
        audioRef={audioRef}
        audioProps={{ crossOrigin: 'anonymous' }}
        className="mine"
        style={{ maxWidth: 300 }}
        data-x="y"
      />,
    )
    expect(audio()).not.toHaveAttribute('src')
    expect([...audio().querySelectorAll('source')].map((s) => s.getAttribute('type'))).toEqual([
      'audio/ogg',
      'audio/mpeg',
    ])
    expect(audioRef.current).toBe(audio())
    expect(audio()).toHaveAttribute('crossorigin', 'anonymous')
    const root = screen.getByRole('group')
    expect(root).toHaveAttribute('data-size', 'sm')
    expect(root).toHaveClass('vk-audio-player', 'mine')
    expect(root).toHaveStyle({ maxWidth: '300px' })
    expect(root).toHaveAttribute('data-x', 'y')
  })

  it('hides the speed control with rates=[]', () => {
    render(<AudioPlayer rates={[]} />)
    expect(screen.queryByRole('combobox')).toBeNull()
  })
})

describe('AudioPlayer · playback', () => {
  it('play toggles and relabels; state follows the media events; ended offers Replay', () => {
    const onPlayingChange = vi.fn()
    const onEnded = vi.fn()
    render(<AudioPlayer src="/a.mp3" onPlayingChange={onPlayingChange} onEnded={onEnded} />)
    const root = screen.getByRole('group')
    fireEvent.click(button('Play'))
    expect(playSpy).toHaveBeenCalled()
    expect(root).toHaveAttribute('data-state', 'playing')
    expect(onPlayingChange).toHaveBeenLastCalledWith(true)
    fireEvent.click(button('Pause'))
    expect(pauseSpy).toHaveBeenCalled()
    expect(onPlayingChange).toHaveBeenLastCalledWith(false)
    fireEvent.ended(audio())
    expect(onEnded).toHaveBeenCalled()
    expect(root).toHaveAttribute('data-state', 'ended')
    fireEvent.click(button('Replay'))
    expect(button('Pause')).toBeInTheDocument()
  })

  it('metadata enables seek; timeupdate moves it, the clock and the announced text', () => {
    const onTimeChange = vi.fn()
    render(<AudioPlayer src="/a.mp3" onTimeChange={onTimeChange} />)
    loadMetadata(200)
    expect(seek()).toBeEnabled()
    expect(seek()).toHaveAttribute('max', '200')
    expect(screen.getByText('3:20')).toBeInTheDocument()
    audio().currentTime = 90
    fireEvent.timeUpdate(audio())
    expect(seek()).toHaveValue('90')
    expect(seek()).toHaveAttribute('aria-valuetext', '1:30 of 3:20')
    expect(screen.getByText('1:30')).toBeInTheDocument()
    expect(onTimeChange).toHaveBeenLastCalledWith(90, 200)
    expect(screen.getByRole('group').style.getPropertyValue('--vk-audio-progress')).toBe('45%')
  })

  it('the seek bar sets currentTime; mute, volume and speed drive the element', () => {
    render(<AudioPlayer src="/a.mp3" />)
    loadMetadata(100)
    fireEvent.change(seek(), { target: { value: '25' } })
    expect(audio().currentTime).toBe(25)
    const vol = screen.getByRole('slider', { name: 'Volume' })
    fireEvent.click(button('Mute'))
    expect(audio().muted).toBe(true)
    expect(button('Unmute')).toHaveAttribute('aria-pressed', 'true')
    expect(vol).toHaveAttribute('aria-valuetext', '0%')
    fireEvent.click(button('Unmute'))
    fireEvent.change(vol, { target: { value: '0.3' } })
    expect(audio().volume).toBe(0.3)
    expect(vol).toHaveAttribute('aria-valuetext', '30%')
    fireEvent.change(screen.getByRole('combobox', { name: 'Playback speed' }), {
      target: { value: '2' },
    })
    expect(audio().playbackRate).toBe(2)
  })

  it('shows the error message with role=status when the media fails', () => {
    const onError = vi.fn()
    render(<AudioPlayer src="/missing.mp3" onError={onError} errorMessage="Nope." />)
    fireEvent.error(audio())
    expect(screen.getByRole('status')).toHaveTextContent('Nope.')
    expect(onError).toHaveBeenCalled()
  })
})

describe('AudioPlayer · keyboard', () => {
  it('K and Space toggle; Space on a button is left to the button; modifiers pass through', () => {
    render(<AudioPlayer src="/a.mp3" />)
    const root = screen.getByRole('group')
    fireEvent.keyDown(root, { key: 'k' })
    expect(button('Pause')).toBeInTheDocument()
    fireEvent.keyDown(root, { key: ' ' })
    expect(button('Play')).toBeInTheDocument()
    const calls = playSpy.mock.calls.length
    fireEvent.keyDown(button('Mute'), { key: ' ' })
    fireEvent.keyDown(root, { key: 'k', ctrlKey: true })
    expect(playSpy.mock.calls.length).toBe(calls)
  })

  it('arrows seek by seekStep, J/L by 10, clamped; up/down set volume; M mutes', () => {
    render(<AudioPlayer src="/a.mp3" seekStep={5} />)
    loadMetadata(30)
    const root = screen.getByRole('group')
    fireEvent.keyDown(root, { key: 'ArrowRight' })
    expect(audio().currentTime).toBe(5)
    fireEvent.keyDown(root, { key: 'l' })
    fireEvent.keyDown(root, { key: 'l' })
    fireEvent.keyDown(root, { key: 'l' })
    expect(audio().currentTime).toBe(30)
    fireEvent.keyDown(root, { key: 'j' })
    expect(audio().currentTime).toBe(20)
    fireEvent.keyDown(root, { key: 'ArrowLeft' })
    expect(audio().currentTime).toBe(15)
    fireEvent.keyDown(root, { key: 'ArrowDown' })
    expect(audio().volume).toBeCloseTo(0.9)
    fireEvent.keyDown(root, { key: 'm' })
    expect(audio().muted).toBe(true)
    // Arrows inside the seek slider belong to the slider.
    fireEvent.keyDown(seek(), { key: 'ArrowUp' })
    expect(audio().volume).toBeCloseTo(0.9)
  })
})

describe('AudioPlayer · a11y', () => {
  it('has no axe violations, bare and as a track card', async () => {
    const { container } = render(
      <>
        <AudioPlayer src="/a.mp3" />
        <AudioPlayer src="/b.mp3" title="Episode 12" subtitle="42 min" artwork="/art.jpg" />
      </>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
