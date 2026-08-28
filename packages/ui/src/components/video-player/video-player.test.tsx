/**
 * VideoPlayer.
 *
 * jsdom has no media pipeline: `play()` and `pause()` are stubs and time never advances.
 * So the suite drives the element the way a browser would - firing the media events and
 * setting the properties they would set - and checks that the controls, the announced
 * values and the keyboard contract follow. Every control is a real button or range, so
 * the assertions go through roles and names, never class hooks.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { formatTime, VideoPlayer } from './video-player'

let playSpy: ReturnType<typeof vi.spyOn>
let pauseSpy: ReturnType<typeof vi.spyOn>

beforeAll(() => {
  // A browser resolves play() and then fires `play`; jsdom does neither.
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

const video = () => document.querySelector('video') as HTMLVideoElement
const button = (name: string | RegExp) => screen.getByRole('button', { name })
const seek = () => screen.getByRole('slider', { name: 'Seek' })

/** What a browser does once metadata arrives. */
function loadMetadata(duration = 125) {
  Object.defineProperty(video(), 'duration', { configurable: true, get: () => duration })
  fireEvent.loadedMetadata(video())
}

describe('formatTime', () => {
  it('formats m:ss under an hour and h:mm:ss above, and never NaN', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(3725)).toBe('1:02:05')
    expect(formatTime(Number.NaN)).toBe('0:00')
    expect(formatTime(-3)).toBe('0:00')
  })
})

describe('VideoPlayer · structure', () => {
  it('renders with zero props: a named group, a video, and disabled seek until metadata', () => {
    render(<VideoPlayer />)
    expect(screen.getByRole('group', { name: 'Video player' })).toBeInTheDocument()
    expect(video()).toBeInTheDocument()
    expect(video()).not.toHaveAttribute('controls')
    expect(seek()).toBeDisabled()
    expect(button('Play')).toBeInTheDocument()
    expect(button('Mute')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Playback speed' })).toBeInTheDocument()
  })

  it('renders sources, poster and tracks; captions button appears only with tracks', () => {
    const { rerender } = render(
      <VideoPlayer
        label="Trailer"
        poster="/p.jpg"
        src={[
          { src: '/a.webm', type: 'video/webm' },
          { src: '/a.mp4', type: 'video/mp4' },
        ]}
        tracks={[{ src: '/en.vtt', srclang: 'en', label: 'English', default: true }]}
      />,
    )
    expect(screen.getByRole('group', { name: 'Trailer' })).toBeInTheDocument()
    expect(video()).toHaveAttribute('poster', '/p.jpg')
    expect(video()).not.toHaveAttribute('src')
    const sources = video().querySelectorAll('source')
    expect([...sources].map((s) => s.getAttribute('type'))).toEqual(['video/webm', 'video/mp4'])
    const track = video().querySelector('track')
    expect(track).toHaveAttribute('srclang', 'en')
    expect(track).toHaveAttribute('kind', 'subtitles')
    expect(button('Captions')).toHaveAttribute('aria-pressed', 'true')
    rerender(<VideoPlayer src="/a.mp4" />)
    expect(video()).toHaveAttribute('src', '/a.mp4')
    expect(screen.queryByRole('button', { name: 'Captions' })).toBeNull()
  })

  it('applies ratio, merges className and style, forwards videoRef and videoProps', () => {
    const videoRef = { current: null as HTMLVideoElement | null }
    render(
      <VideoPlayer
        ratio={1}
        className="mine"
        style={{ maxWidth: 400 }}
        videoRef={videoRef}
        videoProps={{ crossOrigin: 'anonymous', 'data-v': '1' } as never}
        data-x="y"
      />,
    )
    const root = screen.getByRole('group')
    expect(root).toHaveClass('vk-video-player', 'mine')
    expect(root.style.getPropertyValue('--vk-video-ratio')).toBe('1')
    expect(root).toHaveStyle({ maxWidth: '400px' })
    expect(root).toHaveAttribute('data-x', 'y')
    expect(videoRef.current).toBe(video())
    expect(video()).toHaveAttribute('crossorigin', 'anonymous')
    expect(video()).toHaveAttribute('data-v', '1')
  })

  it('hides the speed control with rates=[]', () => {
    render(<VideoPlayer rates={[]} />)
    expect(screen.queryByRole('combobox')).toBeNull()
  })
})

describe('VideoPlayer · playback', () => {
  it('the play button toggles and relabels; state follows the media events', () => {
    const onPlayingChange = vi.fn()
    render(<VideoPlayer src="/a.mp4" onPlayingChange={onPlayingChange} />)
    const root = screen.getByRole('group')
    expect(root).toHaveAttribute('data-state', 'paused')
    fireEvent.click(button('Play'))
    expect(playSpy).toHaveBeenCalled()
    expect(root).toHaveAttribute('data-state', 'playing')
    expect(onPlayingChange).toHaveBeenLastCalledWith(true)
    fireEvent.click(button('Pause'))
    expect(pauseSpy).toHaveBeenCalled()
    expect(root).toHaveAttribute('data-state', 'paused')
    expect(onPlayingChange).toHaveBeenLastCalledWith(false)
  })

  it('clicking the video toggles too, and ended shows Replay', () => {
    const onEnded = vi.fn()
    render(<VideoPlayer src="/a.mp4" onEnded={onEnded} />)
    fireEvent.click(video())
    expect(button('Pause')).toBeInTheDocument()
    fireEvent.ended(video())
    expect(onEnded).toHaveBeenCalled()
    expect(screen.getByRole('group')).toHaveAttribute('data-state', 'ended')
    fireEvent.click(button('Replay'))
    expect(button('Pause')).toBeInTheDocument()
  })

  it('metadata enables seek with the duration; timeupdate moves it and the announced text', () => {
    const onTimeChange = vi.fn()
    render(<VideoPlayer src="/a.mp4" onTimeChange={onTimeChange} />)
    loadMetadata(125)
    expect(seek()).toBeEnabled()
    expect(seek()).toHaveAttribute('max', '125')
    expect(seek()).toHaveAttribute('aria-valuetext', '0:00 of 2:05')
    video().currentTime = 65
    fireEvent.timeUpdate(video())
    expect(seek()).toHaveValue('65')
    expect(seek()).toHaveAttribute('aria-valuetext', '1:05 of 2:05')
    expect(screen.getByText('1:05 / 2:05')).toBeInTheDocument()
    expect(onTimeChange).toHaveBeenLastCalledWith(65, 125)
    expect(screen.getByRole('group').style.getPropertyValue('--vk-video-progress')).toBe('52%')
  })

  it('dragging the seek bar sets currentTime', () => {
    render(<VideoPlayer src="/a.mp4" />)
    loadMetadata(100)
    fireEvent.change(seek(), { target: { value: '40' } })
    expect(video().currentTime).toBe(40)
    expect(seek()).toHaveAttribute('aria-valuetext', '0:40 of 1:40')
  })

  it('mute toggles the element and is a pressed button; volume slider drives volume', () => {
    render(<VideoPlayer src="/a.mp4" />)
    const vol = screen.getByRole('slider', { name: 'Volume' })
    expect(vol).toHaveAttribute('aria-valuetext', '100%')
    fireEvent.click(button('Mute'))
    expect(video().muted).toBe(true)
    expect(button('Unmute')).toHaveAttribute('aria-pressed', 'true')
    expect(vol).toHaveAttribute('aria-valuetext', '0%')
    fireEvent.click(button('Unmute'))
    expect(video().muted).toBe(false)
    fireEvent.change(vol, { target: { value: '0.5' } })
    expect(video().volume).toBe(0.5)
    expect(vol).toHaveAttribute('aria-valuetext', '50%')
    fireEvent.change(vol, { target: { value: '0' } })
    expect(video().muted).toBe(true)
  })

  it('the speed select sets playbackRate', () => {
    render(<VideoPlayer src="/a.mp4" />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Playback speed' }), {
      target: { value: '1.5' },
    })
    expect(video().playbackRate).toBe(1.5)
  })

  it('captions toggle by button and by C', () => {
    render(
      <VideoPlayer src="/a.mp4" tracks={[{ src: '/en.vtt', srclang: 'en', label: 'English' }]} />,
    )
    expect(button('Captions')).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(button('Captions'))
    expect(button('Captions')).toHaveAttribute('aria-pressed', 'true')
    fireEvent.keyDown(screen.getByRole('group'), { key: 'c' })
    expect(button('Captions')).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows the error message with role=status when the media fails', () => {
    const onError = vi.fn()
    render(<VideoPlayer src="/missing.mp4" onError={onError} />)
    fireEvent.error(video())
    expect(screen.getByRole('status')).toHaveTextContent('This video could not be played.')
    expect(onError).toHaveBeenCalled()
  })
})

describe('VideoPlayer · keyboard', () => {
  it('K and Space toggle play; Space on a button is left to the button', () => {
    render(<VideoPlayer src="/a.mp4" />)
    const root = screen.getByRole('group')
    fireEvent.keyDown(root, { key: 'k' })
    expect(button('Pause')).toBeInTheDocument()
    fireEvent.keyDown(root, { key: ' ' })
    expect(button('Play')).toBeInTheDocument()
    const calls = playSpy.mock.calls.length
    fireEvent.keyDown(button('Mute'), { key: ' ' })
    expect(playSpy.mock.calls.length).toBe(calls)
  })

  it('arrows seek by seekStep and J/L by 10, clamped to the duration', () => {
    render(<VideoPlayer src="/a.mp4" seekStep={5} />)
    loadMetadata(30)
    const root = screen.getByRole('group')
    fireEvent.keyDown(root, { key: 'ArrowRight' })
    expect(video().currentTime).toBe(5)
    fireEvent.keyDown(root, { key: 'l' })
    expect(video().currentTime).toBe(15)
    fireEvent.keyDown(root, { key: 'ArrowLeft' })
    expect(video().currentTime).toBe(10)
    fireEvent.keyDown(root, { key: 'l' })
    fireEvent.keyDown(root, { key: 'l' })
    expect(video().currentTime).toBe(30)
    fireEvent.keyDown(root, { key: 'j' })
    fireEvent.keyDown(root, { key: 'j' })
    fireEvent.keyDown(root, { key: 'j' })
    fireEvent.keyDown(root, { key: 'j' })
    expect(video().currentTime).toBe(0)
  })

  it('ArrowUp/Down change volume in tenths and M mutes; arrows inside a slider are left alone', () => {
    render(<VideoPlayer src="/a.mp4" />)
    const root = screen.getByRole('group')
    fireEvent.keyDown(root, { key: 'ArrowDown' })
    expect(video().volume).toBeCloseTo(0.9)
    fireEvent.keyDown(root, { key: 'm' })
    expect(video().muted).toBe(true)
    const before = video().volume
    fireEvent.keyDown(seek(), { key: 'ArrowDown' })
    expect(video().volume).toBe(before)
  })

  it('does not swallow keys with modifiers', () => {
    render(<VideoPlayer src="/a.mp4" />)
    const event = fireEvent.keyDown(screen.getByRole('group'), { key: 'k', ctrlKey: true })
    expect(event).toBe(true)
    expect(button('Play')).toBeInTheDocument()
  })
})

describe('VideoPlayer · a11y', () => {
  it('has no axe violations, idle and playing', async () => {
    const { container } = render(
      <VideoPlayer src="/a.mp4" tracks={[{ src: '/en.vtt', srclang: 'en', label: 'English' }]} />,
    )
    expect(await axe(container)).toHaveNoViolations()
    fireEvent.click(button('Play'))
    loadMetadata(60)
    expect(await axe(container)).toHaveNoViolations()
  })
})
