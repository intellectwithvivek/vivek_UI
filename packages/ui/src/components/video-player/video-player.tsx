'use client'

import {
  type ChangeEvent,
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
  type VideoHTMLAttributes,
} from 'react'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'
import { formatTime } from '../../utils/format-time'

export interface VideoSource {
  src: string
  /** MIME type, e.g. `video/mp4` or `video/webm`, so the browser can skip what it cannot play. */
  type?: string
}

export interface VideoTrack {
  src: string
  /** BCP 47 language tag, e.g. `en`. */
  srclang: string
  label: string
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters'
  default?: boolean
}

export interface VideoPlayerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * One URL, or several sources the browser tries **in order**.
   *
   * List the most widely supported format first (MP4/H.264, then WebM): Safari holds the
   * document's `load` event while it works through a format it cannot decode, so a WebM-first
   * list makes the whole page appear to hang there.
   */
  src?: string | VideoSource[]
  /**
   * Frame shown before playback. **A raster image (JPEG, PNG, WebP)** — Safari ignores an
   * SVG poster, and the document's `load` event never fires while it waits for one.
   */
  poster?: string
  /** WebVTT text tracks. The first `default` one (else the first) is the captions track. */
  tracks?: VideoTrack[]
  /** Accessible name of the player. Default `'Video player'`. */
  label?: string
  /** Width / height. Default `16 / 9`. */
  ratio?: number
  autoPlay?: boolean
  /** Start muted — required by every browser for `autoPlay` to actually play. */
  muted?: boolean
  loop?: boolean
  /** Default `true`: play in place on phones instead of taking over the screen. */
  playsInline?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  /** Playback speeds offered. Default `[0.5, 1, 1.25, 1.5, 2]`; `[]` hides the control. */
  rates?: number[]
  /** Seconds moved by ArrowLeft / ArrowRight. Default `5`. */
  seekStep?: number
  /** Hide the controls this many ms after the pointer rests while playing. `0` never hides. Default `2500`. */
  hideControlsAfter?: number
  /** Shown when the media fails to load or decode. */
  errorMessage?: ReactNode
  /** The `<video>` element, for anything the props do not cover. */
  videoRef?: Ref<HTMLVideoElement>
  /** Extra attributes for the `<video>` — `crossOrigin` for cross-origin captions, for one. */
  videoProps?: Omit<
    VideoHTMLAttributes<HTMLVideoElement>,
    'src' | 'poster' | 'controls' | 'autoPlay' | 'muted' | 'loop' | 'playsInline' | 'preload'
  >
  onPlayingChange?: (playing: boolean) => void
  onTimeChange?: (currentTime: number, duration: number) => void
  onEnded?: () => void
  onError?: () => void
}

const DEFAULT_RATES = [0.5, 1, 1.25, 1.5, 2]

export { formatTime }

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

/* Icons are drawn here rather than imported: the library has no icon dependency. */
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
  captions: (
    <Icon>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 12h4M13 12h4M7 15h3M12 15h5" />
    </Icon>
  ),
  pip: (
    <Icon>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M12 12h7v5h-7z" fill="currentColor" stroke="none" />
    </Icon>
  ),
  fullscreen: (
    <Icon>
      <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
    </Icon>
  ),
  exitFullscreen: (
    <Icon>
      <path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />
    </Icon>
  ),
}

/**
 * A video player with its own controls — progressive files (MP4, WebM), no streaming.
 *
 * The native `controls` attribute gives every browser a different, unstyleable bar and
 * no keyboard contract worth documenting. This one has one bar, every control a real
 * `<button>` or `<input type="range">` with a name, and the shortcuts people expect from
 * every player they have used:
 *
 * | Key | Behaviour |
 * | --- | --- |
 * | Space / K | Play or pause |
 * | ArrowLeft / ArrowRight, J / L | Seek back / forward by `seekStep` (J/L: 10 s) |
 * | ArrowUp / ArrowDown | Volume up / down |
 * | M | Mute / unmute |
 * | C | Captions on / off (when there are tracks) |
 * | F | Fullscreen |
 *
 * The seek bar announces "1:23 of 4:56"; volume announces a percentage. Controls fade
 * while the pointer rests during playback and come back on any movement, key, or focus
 * — they are never removed, only faded, so a keyboard user always has them.
 *
 * Pass `videoRef` or `videoProps` for anything the player does not model itself.
 */
export const VideoPlayer = forwardRef<HTMLDivElement, VideoPlayerProps>(function VideoPlayer(
  {
    src,
    poster,
    tracks = [],
    label = 'Video player',
    ratio = 16 / 9,
    autoPlay,
    muted: mutedProp = false,
    loop,
    playsInline = true,
    preload = 'metadata',
    rates = DEFAULT_RATES,
    seekStep = 5,
    hideControlsAfter = 2500,
    errorMessage = 'This video could not be played.',
    videoRef,
    videoProps,
    onPlayingChange,
    onTimeChange,
    onEnded,
    onError,
    className,
    style,
    onKeyDown,
    onPointerMove,
    onPointerDown,
    onFocus,
    ...rest
  },
  ref,
) {
  const id = useIsomorphicId()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const video = useRef<HTMLVideoElement | null>(null)
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )
  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      video.current = node
      if (typeof videoRef === 'function') videoRef(node)
      else if (videoRef) videoRef.current = node
    },
    [videoRef],
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
  const [idle, setIdle] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [pip, setPip] = useState(false)
  const [canFullscreen, setCanFullscreen] = useState(false)
  const [canPip, setCanPip] = useState(false)
  const captionIndex = Math.max(
    tracks.findIndex((t) => t.default),
    tracks.length > 0 ? 0 : -1,
  )
  const [captions, setCaptions] = useState(() => tracks.some((t) => t.default))

  // Feature detection after mount: the server cannot know, and must not guess.
  useEffect(() => {
    const doc = rootRef.current?.ownerDocument
    if (!doc) return
    setCanFullscreen(typeof doc.documentElement.requestFullscreen === 'function')
    setCanPip('pictureInPictureEnabled' in doc && Boolean(doc.pictureInPictureEnabled))
    const onChange = () => setFullscreen(doc.fullscreenElement === rootRef.current)
    doc.addEventListener('fullscreenchange', onChange)
    return () => doc.removeEventListener('fullscreenchange', onChange)
  }, [])

  // Picture-in-picture has no React event props; listen on the element.
  useEffect(() => {
    const v = video.current
    if (!v) return
    const enter = () => setPip(true)
    const leave = () => setPip(false)
    v.addEventListener('enterpictureinpicture', enter)
    v.addEventListener('leavepictureinpicture', leave)
    return () => {
      v.removeEventListener('enterpictureinpicture', enter)
      v.removeEventListener('leavepictureinpicture', leave)
    }
  }, [])

  // Text tracks: exactly one shown, or none.
  useEffect(() => {
    const list = video.current?.textTracks
    if (!list) return
    for (let i = 0; i < list.length; i += 1) {
      const track = list[i]
      if (track) track.mode = captions && i === captionIndex ? 'showing' : 'hidden'
    }
  }, [captions, captionIndex])

  // Idle: fade the controls while the pointer rests during playback. Cleared on unmount.
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clearIdle = useCallback(() => {
    if (idleTimer.current !== null) clearTimeout(idleTimer.current)
    idleTimer.current = null
  }, [])
  const wake = useCallback(() => {
    setIdle(false)
    clearIdle()
    if (!playing || hideControlsAfter <= 0) return
    idleTimer.current = setTimeout(() => {
      idleTimer.current = null
      // Never hide the bar from someone who is using it.
      if (!rootRef.current?.matches(':focus-within')) setIdle(true)
    }, hideControlsAfter)
  }, [playing, hideControlsAfter, clearIdle])
  useEffect(() => {
    wake()
    return clearIdle
  }, [wake, clearIdle])

  /* ------------------------------------------------------------------ commands */

  const togglePlay = () => {
    const v = video.current
    if (!v) return
    if (playing) v.pause()
    else v.play()?.catch?.(() => {})
  }
  const seekTo = (seconds: number) => {
    const v = video.current
    if (!v) return
    const next = clamp(seconds, 0, duration || 0)
    v.currentTime = next
    setTime(next)
  }
  const setVolumeTo = (level: number) => {
    const v = video.current
    if (!v) return
    const next = clamp(level, 0, 1)
    v.volume = next
    v.muted = next === 0
    setVolume(next)
    setMuted(next === 0)
  }
  const toggleMute = () => {
    const v = video.current
    if (!v) return
    v.muted = !muted
    setMuted(!muted)
  }
  const setRateTo = (next: number) => {
    const v = video.current
    if (!v) return
    v.playbackRate = next
    setRate(next)
  }
  const toggleFullscreen = () => {
    const root = rootRef.current
    const doc = root?.ownerDocument
    if (!root || !doc) return
    if (doc.fullscreenElement === root) doc.exitFullscreen?.().catch?.(() => {})
    else root.requestFullscreen?.().catch?.(() => {})
  }
  const togglePip = () => {
    const v = video.current
    const doc = v?.ownerDocument
    if (!v || !doc) return
    if (doc.pictureInPictureElement === v) doc.exitPictureInPicture?.().catch?.(() => {})
    else v.requestPictureInPicture?.().catch?.(() => {})
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
      case 'f':
      case 'F':
        if (canFullscreen) toggleFullscreen()
        break
      case 'c':
      case 'C':
        if (tracks.length > 0) setCaptions((on) => !on)
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

  /* -------------------------------------------------------------- media events */

  const readBuffered = (v: HTMLVideoElement) => {
    try {
      const ranges = v.buffered
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

  return (
    <div
      ref={setRootRef}
      role="group"
      aria-label={label}
      className={cx('vk-video-player', className)}
      data-state={state}
      data-idle={idle ? '' : undefined}
      data-buffering={buffering ? '' : undefined}
      data-fullscreen={fullscreen ? '' : undefined}
      data-failed={failed ? '' : undefined}
      style={
        {
          '--vk-video-ratio': String(ratio),
          '--vk-video-progress': `${progress}%`,
          '--vk-video-buffered': `${bufferedPct}%`,
          ...style,
        } as CSSProperties
      }
      onKeyDown={handleKeyDown}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        wake()
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        wake()
      }}
      onFocus={(event) => {
        onFocus?.(event)
        wake()
      }}
      {...rest}
    >
      <video
        {...videoProps}
        ref={setVideoRef}
        className={cx('vk-video-player__video', videoProps?.className)}
        src={typeof src === 'string' ? src : undefined}
        poster={poster}
        autoPlay={autoPlay}
        muted={mutedProp}
        loop={loop}
        playsInline={playsInline}
        preload={preload}
        onClick={togglePlay}
        onLoadedMetadata={(event) => {
          videoProps?.onLoadedMetadata?.(event)
          setDuration(event.currentTarget.duration)
          setFailed(false)
        }}
        onDurationChange={(event) => {
          videoProps?.onDurationChange?.(event)
          setDuration(event.currentTarget.duration)
        }}
        onTimeUpdate={(event) => {
          videoProps?.onTimeUpdate?.(event)
          const v = event.currentTarget
          setTime(v.currentTime)
          onTimeChange?.(v.currentTime, v.duration)
        }}
        onProgress={(event) => {
          videoProps?.onProgress?.(event)
          readBuffered(event.currentTarget)
        }}
        onPlay={(event) => {
          videoProps?.onPlay?.(event)
          setPlaying(true)
          setEnded(false)
          onPlayingChange?.(true)
        }}
        onPause={(event) => {
          videoProps?.onPause?.(event)
          setPlaying(false)
          onPlayingChange?.(false)
        }}
        onEnded={(event) => {
          videoProps?.onEnded?.(event)
          setEnded(true)
          setPlaying(false)
          onEnded?.()
        }}
        onVolumeChange={(event) => {
          videoProps?.onVolumeChange?.(event)
          setVolume(event.currentTarget.volume)
          setMuted(event.currentTarget.muted)
        }}
        onRateChange={(event) => {
          videoProps?.onRateChange?.(event)
          setRate(event.currentTarget.playbackRate)
        }}
        onWaiting={(event) => {
          videoProps?.onWaiting?.(event)
          setBuffering(true)
        }}
        onPlaying={(event) => {
          videoProps?.onPlaying?.(event)
          setBuffering(false)
        }}
        onCanPlay={(event) => {
          videoProps?.onCanPlay?.(event)
          setBuffering(false)
        }}
        onError={(event) => {
          videoProps?.onError?.(event)
          setFailed(true)
          setBuffering(false)
          onError?.()
        }}
      >
        {sources?.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
        {tracks.map((track, index) => (
          <track
            key={track.src}
            src={track.src}
            srcLang={track.srclang}
            label={track.label}
            kind={track.kind ?? 'subtitles'}
            default={index === captionIndex && captions}
          />
        ))}
      </video>

      <div className="vk-video-player__badge" aria-hidden="true">
        {buffering ? (
          <span className="vk-video-player__spinner" />
        ) : ended ? (
          ICONS.replay
        ) : playing ? null : (
          ICONS.play
        )}
      </div>

      {failed ? (
        <div role="status" className="vk-video-player__error">
          {errorMessage}
        </div>
      ) : null}

      <div className="vk-video-player__controls">
        <div className="vk-video-player__seek-wrap">
          <span className="vk-video-player__seek-buffered" aria-hidden="true" />
          <span className="vk-video-player__seek-progress" aria-hidden="true" />
          <input
            type="range"
            className="vk-video-player__seek"
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
        <div className="vk-video-player__row">
          <button
            type="button"
            className="vk-video-player__button"
            aria-label={playLabel}
            onClick={togglePlay}
          >
            {ended ? ICONS.replay : playing ? ICONS.pause : ICONS.play}
          </button>
          <button
            type="button"
            className="vk-video-player__button"
            aria-label={muted ? 'Unmute' : 'Mute'}
            aria-pressed={muted}
            onClick={toggleMute}
          >
            {muted || volume === 0 ? ICONS.muted : ICONS.volume}
          </button>
          <input
            type="range"
            className="vk-video-player__volume"
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
          <span className="vk-video-player__time" aria-hidden="true">
            {formatTime(time)} / {formatTime(duration)}
          </span>
          <span className="vk-video-player__spacer" />
          {rates.length > 0 ? (
            <select
              className="vk-video-player__rate"
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
          {tracks.length > 0 ? (
            <button
              type="button"
              className="vk-video-player__button"
              aria-label="Captions"
              aria-pressed={captions}
              onClick={() => setCaptions((on) => !on)}
            >
              {ICONS.captions}
            </button>
          ) : null}
          {canPip ? (
            <button
              type="button"
              className="vk-video-player__button"
              aria-label={pip ? 'Exit picture in picture' : 'Picture in picture'}
              aria-pressed={pip}
              onClick={togglePip}
            >
              {ICONS.pip}
            </button>
          ) : null}
          {canFullscreen ? (
            <button
              type="button"
              className="vk-video-player__button"
              aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              onClick={toggleFullscreen}
            >
              {fullscreen ? ICONS.exitFullscreen : ICONS.fullscreen}
            </button>
          ) : null}
        </div>
      </div>
      <span id={`${id}-desc`} hidden>
        Shortcuts: Space or K play, arrows seek and volume, M mute, F fullscreen.
      </span>
    </div>
  )
})
