'use client'

import {
  type AudioHTMLAttributes,
  type ChangeEvent,
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useRef,
  useState,
} from 'react'
import { cx } from '../../utils/cx'
import { formatTime } from '../../utils/format-time'

export interface AudioSource {
  src: string
  /** MIME type, e.g. `audio/mpeg` or `audio/ogg`, so the browser can skip what it cannot play. */
  type?: string
}

export interface AudioPlayerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  /** One URL, or several sources the browser picks from in order. */
  src?: string | AudioSource[]
  /** Track title, shown above the controls. */
  title?: ReactNode
  /** Artist, episode, date — the line under the title. */
  subtitle?: ReactNode
  /** Square artwork beside the title. Decorative: the title is the name. */
  artwork?: string
  /** Accessible name of the player. Defaults to the `title` when it is a string, else `'Audio player'`. */
  label?: string
  size?: 'sm' | 'md'
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  /** Playback speeds offered. Default `[0.75, 1, 1.25, 1.5, 2]`; `[]` hides the control. */
  rates?: number[]
  /** Seconds moved by ArrowLeft / ArrowRight. Default `5`. */
  seekStep?: number
  /** Shown when the media fails to load or decode. */
  errorMessage?: ReactNode
  /** The `<audio>` element, for anything the props do not cover. */
  audioRef?: Ref<HTMLAudioElement>
  /** Extra attributes for the `<audio>` — `crossOrigin`, for one. */
  audioProps?: Omit<
    AudioHTMLAttributes<HTMLAudioElement>,
    'src' | 'controls' | 'autoPlay' | 'muted' | 'loop' | 'preload'
  >
  onPlayingChange?: (playing: boolean) => void
  onTimeChange?: (currentTime: number, duration: number) => void
  onEnded?: () => void
  onError?: () => void
}

const DEFAULT_RATES = [0.75, 1, 1.25, 1.5, 2]

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

/* Drawn here rather than imported: the library has no icon dependency. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}
const ICONS = {
  play: (
    <Icon>
      <path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none" />
    </Icon>
  ),
  pause: (
    <Icon>
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor" stroke="none" />
    </Icon>
  ),
  replay: (
    <Icon>
      <path d="M4 12a8 8 0 1 0 2.3-5.6" />
      <path d="M4 4v5h5" />
    </Icon>
  ),
  volume: (
    <Icon>
      <path d="M4 9v6h3.5l4.5 4V5L7.5 9z" fill="currentColor" stroke="none" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
    </Icon>
  ),
  muted: (
    <Icon>
      <path d="M4 9v6h3.5l4.5 4V5L7.5 9z" fill="currentColor" stroke="none" />
      <path d="M16 9l5 6M21 9l-5 6" />
    </Icon>
  ),
}

/**
 * An audio player with its own controls — a podcast episode, a voice note, a sample.
 *
 * The native `controls` attribute renders a different, unstyleable bar in every browser.
 * This one is a bordered card that takes the theme, with a real `<button>` for play, real
 * `<input type="range">` sliders for seek and volume, and the keyboard contract people
 * already know:
 *
 * | Key | Behaviour |
 * | --- | --- |
 * | Space / K | Play or pause |
 * | ArrowLeft / ArrowRight, J / L | Seek back / forward by `seekStep` (J/L: 10 s) |
 * | ArrowUp / ArrowDown | Volume up / down |
 * | M | Mute / unmute |
 *
 * The seek bar announces "1:23 of 4:56"; volume announces a percentage. `title`,
 * `subtitle` and `artwork` make it a track card; without them it is a bare control bar.
 * Progressive files only (MP3, OGG, WAV, AAC) — no streaming.
 */
export const AudioPlayer = forwardRef<HTMLDivElement, AudioPlayerProps>(function AudioPlayer(
  {
    src,
    title,
    subtitle,
    artwork,
    label,
    size = 'md',
    autoPlay,
    muted: mutedProp = false,
    loop,
    preload = 'metadata',
    rates = DEFAULT_RATES,
    seekStep = 5,
    errorMessage = 'This audio could not be played.',
    audioRef,
    audioProps,
    onPlayingChange,
    onTimeChange,
    onEnded,
    onError,
    className,
    style,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const setAudioRef = useCallback(
    (node: HTMLAudioElement | null) => {
      audio.current = node
      if (typeof audioRef === 'function') audioRef(node)
      else if (audioRef) audioRef.current = node
    },
    [audioRef],
  )

  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(mutedProp)
  const [rate, setRate] = useState(1)
  const [buffering, setBuffering] = useState(false)
  const [failed, setFailed] = useState(false)

  const togglePlay = () => {
    const a = audio.current
    if (!a) return
    if (playing) a.pause()
    else a.play()?.catch?.(() => {})
  }
  const seekTo = (seconds: number) => {
    const a = audio.current
    if (!a) return
    const next = clamp(seconds, 0, duration || 0)
    a.currentTime = next
    setTime(next)
  }
  const setVolumeTo = (level: number) => {
    const a = audio.current
    if (!a) return
    const next = clamp(level, 0, 1)
    a.volume = next
    a.muted = next === 0
    setVolume(next)
    setMuted(next === 0)
  }
  const toggleMute = () => {
    const a = audio.current
    if (!a) return
    a.muted = !muted
    setMuted(!muted)
  }
  const setRateTo = (next: number) => {
    const a = audio.current
    if (!a) return
    a.playbackRate = next
    setRate(next)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return
    const target = event.target as HTMLElement
    const onSlider = target.tagName === 'INPUT'
    const onSelect = target.tagName === 'SELECT'
    const onButton = target.tagName === 'BUTTON'
    let handled = true
    switch (event.key) {
      case ' ':
        if (onButton || onSlider || onSelect) return
        togglePlay()
        break
      case 'k':
      case 'K':
        togglePlay()
        break
      case 'm':
      case 'M':
        toggleMute()
        break
      case 'j':
      case 'J':
        seekTo(time - 10)
        break
      case 'l':
      case 'L':
        seekTo(time + 10)
        break
      case 'ArrowLeft':
      case 'ArrowRight':
        if (onSlider || onSelect) return
        seekTo(time + (event.key === 'ArrowRight' ? seekStep : -seekStep))
        break
      case 'ArrowUp':
      case 'ArrowDown':
        if (onSlider || onSelect) return
        setVolumeTo(volume + (event.key === 'ArrowUp' ? 0.1 : -0.1))
        break
      default:
        handled = false
    }
    if (handled) event.preventDefault()
  }

  const readBuffered = (a: HTMLAudioElement) => {
    try {
      const ranges = a.buffered
      setBuffered(ranges.length > 0 ? ranges.end(ranges.length - 1) : 0)
    } catch {
      // A media element with no data yet can throw on TimeRanges access.
    }
  }

  const sources = typeof src === 'string' ? undefined : src
  const progress = duration > 0 ? (time / duration) * 100 : 0
  const bufferedPct = duration > 0 ? clamp((buffered / duration) * 100, 0, 100) : 0
  const playLabel = ended ? 'Replay' : playing ? 'Pause' : 'Play'
  const state = ended ? 'ended' : playing ? 'playing' : 'paused'
  const name = label ?? (typeof title === 'string' ? title : 'Audio player')
  const hasHeader = Boolean(title || subtitle || artwork)

  return (
    <div
      ref={ref}
      role="group"
      aria-label={name}
      className={cx('vk-audio-player', className)}
      data-size={size}
      data-state={state}
      data-buffering={buffering ? '' : undefined}
      data-failed={failed ? '' : undefined}
      style={
        {
          '--vk-audio-progress': `${progress}%`,
          '--vk-audio-buffered': `${bufferedPct}%`,
          ...style,
        } as CSSProperties
      }
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <audio
        {...audioProps}
        ref={setAudioRef}
        className={cx('vk-audio-player__media', audioProps?.className)}
        src={typeof src === 'string' ? src : undefined}
        autoPlay={autoPlay}
        muted={mutedProp}
        loop={loop}
        preload={preload}
        onLoadedMetadata={(event) => {
          audioProps?.onLoadedMetadata?.(event)
          setDuration(event.currentTarget.duration)
          setFailed(false)
        }}
        onDurationChange={(event) => {
          audioProps?.onDurationChange?.(event)
          setDuration(event.currentTarget.duration)
        }}
        onTimeUpdate={(event) => {
          audioProps?.onTimeUpdate?.(event)
          const a = event.currentTarget
          setTime(a.currentTime)
          onTimeChange?.(a.currentTime, a.duration)
        }}
        onProgress={(event) => {
          audioProps?.onProgress?.(event)
          readBuffered(event.currentTarget)
        }}
        onPlay={(event) => {
          audioProps?.onPlay?.(event)
          setPlaying(true)
          setEnded(false)
          onPlayingChange?.(true)
        }}
        onPause={(event) => {
          audioProps?.onPause?.(event)
          setPlaying(false)
          onPlayingChange?.(false)
        }}
        onEnded={(event) => {
          audioProps?.onEnded?.(event)
          setEnded(true)
          setPlaying(false)
          onEnded?.()
        }}
        onVolumeChange={(event) => {
          audioProps?.onVolumeChange?.(event)
          setVolume(event.currentTarget.volume)
          setMuted(event.currentTarget.muted)
        }}
        onRateChange={(event) => {
          audioProps?.onRateChange?.(event)
          setRate(event.currentTarget.playbackRate)
        }}
        onWaiting={(event) => {
          audioProps?.onWaiting?.(event)
          setBuffering(true)
        }}
        onPlaying={(event) => {
          audioProps?.onPlaying?.(event)
          setBuffering(false)
        }}
        onCanPlay={(event) => {
          audioProps?.onCanPlay?.(event)
          setBuffering(false)
        }}
        onError={(event) => {
          audioProps?.onError?.(event)
          setFailed(true)
          setBuffering(false)
          onError?.()
        }}
      >
        {sources?.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
      </audio>

      {hasHeader ? (
        <div className="vk-audio-player__header">
          {artwork ? <img className="vk-audio-player__artwork" src={artwork} alt="" /> : null}
          <div className="vk-audio-player__meta">
            {title ? <div className="vk-audio-player__title">{title}</div> : null}
            {subtitle ? <div className="vk-audio-player__subtitle">{subtitle}</div> : null}
          </div>
        </div>
      ) : null}

      {failed ? (
        <div role="status" className="vk-audio-player__error">
          {errorMessage}
        </div>
      ) : null}

      <div className="vk-audio-player__controls">
        <button
          type="button"
          className="vk-audio-player__play"
          aria-label={playLabel}
          onClick={togglePlay}
        >
          {ended ? ICONS.replay : playing ? ICONS.pause : ICONS.play}
        </button>
        <span className="vk-audio-player__time" aria-hidden="true">
          {formatTime(time)}
        </span>
        <div className="vk-audio-player__seek-wrap">
          <span className="vk-audio-player__seek-buffered" aria-hidden="true" />
          <span className="vk-audio-player__seek-progress" aria-hidden="true" />
          <input
            type="range"
            className="vk-audio-player__seek"
            aria-label="Seek"
            aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
            min={0}
            max={duration > 0 ? duration : 0}
            step={0.1}
            value={clamp(time, 0, duration || 0)}
            disabled={!(duration > 0)}
            onChange={(event: ChangeEvent<HTMLInputElement>) => seekTo(Number(event.target.value))}
          />
        </div>
        <span className="vk-audio-player__time" aria-hidden="true">
          {formatTime(duration)}
        </span>
        <button
          type="button"
          className="vk-audio-player__button"
          aria-label={muted ? 'Unmute' : 'Mute'}
          aria-pressed={muted}
          onClick={toggleMute}
        >
          {muted || volume === 0 ? ICONS.muted : ICONS.volume}
        </button>
        <input
          type="range"
          className="vk-audio-player__volume"
          aria-label="Volume"
          aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)}%`}
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setVolumeTo(Number(event.target.value))
          }
        />
        {rates.length > 0 ? (
          <select
            className="vk-audio-player__rate"
            aria-label="Playback speed"
            value={String(rate)}
            onChange={(event) => setRateTo(Number(event.target.value))}
          >
            {rates.map((r) => (
              <option key={r} value={String(r)}>
                {r}×
              </option>
            ))}
          </select>
        ) : null}
      </div>
    </div>
  )
})
