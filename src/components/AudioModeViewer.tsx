import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { ToolSliderRow } from '../components/ToolSliderRow'
import type { PhotoItem } from '../types'
import type { AudioEffectSettings, AudioEffectPreset, AudioPrivacyMode } from '../lib/audio/audioTypes'
import { AUDIO_PRESET_LABELS, resolveAudioPreset } from '../lib/audio/audioPresets'
import { AUDIO_PRIVACY_WARNING } from '../lib/audio/audioTypes'
import {
  decodeAudioBlob,
  getAudioContext,
  effectiveAudioSettings,
  semitonesToPlaybackRate,
  computeWaveformPeaks,
} from '../lib/audio/audioUtils'
import { buildAudioEffectGraph, renderProcessedAudioBuffer } from '../lib/audio/audioPipeline'
import {
  anonymizedAudioFilename,
  encodeAudioBuffer,
  supportedAudioExportFormats,
  type AudioExportFormat,
} from '../lib/audio/audioExport'
import { saveAs } from 'file-saver'
import { MobileToolDrawer } from '../mobile/MobileToolDrawer'

const PRESETS: AudioEffectPreset[] = ['maximum_mask', 'heavy_scramble', 'broken_timing']

type AudioCategory = 'voice' | 'tone' | 'timing'

const CATEGORY_META: { id: AudioCategory; label: string; icon: string; title: string }[] = [
  { id: 'voice', label: 'Voice', icon: 'record_voice_over', title: 'Voice — pitch & formant' },
  { id: 'tone', label: 'Tone', icon: 'graphic_eq', title: 'Tone & texture' },
  { id: 'timing', label: 'Timing', icon: 'schedule', title: 'Timing & motion' },
]

const WAVE_BUCKETS = 640

const fmtTime = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`
}

export interface AudioModeViewerProps {
  activePhoto: PhotoItem
  settings: AudioEffectSettings
  onChangeSettings: (settings: AudioEffectSettings) => void
  isVideo?: boolean
  /** Untouched source blob (kept stable when the anonymized result is committed). */
  originalBlob?: Blob
  /** Persist the anonymized audio back into the library item (drives export + outline). */
  onCommitAnonymized?: (blob: Blob, mimeType: string) => void
  /** Mobile: intensity + advanced controls open as categorized bottom drawers. */
  isMobileLayout?: boolean
  /** Desktop standalone audio hides the inline export (download lives in the action toolbar). */
  hideInlineExport?: boolean
}

export function AudioModeViewer({
  activePhoto, settings, onChangeSettings, isVideo = false, originalBlob, onCommitAnonymized,
  isMobileLayout = false,
}: AudioModeViewerProps) {
  const [activeCat, setActiveCat] = useState<AudioCategory | null>(null)
  const [showFormats, setShowFormats] = useState(false)
  const [showWarn, setShowWarn] = useState(false)
  const sourceBlob = originalBlob ?? activePhoto.blob
  const exportFormats = useMemo(() => supportedAudioExportFormats(), [])
  const [exportFormatId, setExportFormatId] = useState<AudioExportFormat['id']>('wav')
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  // A/B compare: when 'anonymized' (default) the processed graph is monitored;
  // 'original' bypasses all effects so the difference is audible and visible.
  const [compare, setCompare] = useState<'anonymized' | 'original'>('anonymized')
  const [exporting, setExporting] = useState(false)
  const [origPeaks, setOrigPeaks] = useState<Float32Array | null>(null)
  const [procPeaks, setProcPeaks] = useState<Float32Array | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const graphDisconnectRef = useRef<(() => void) | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const origBufferRef = useRef<AudioBuffer | null>(null)
  // Mirror `playing` so the graph builder can decide synchronously whether to
  // route to the speakers (it must never auto-route while paused).
  const playingRef = useRef(false)
  playingRef.current = playing

  // The keep / remove-track / distort selector only makes sense for a video's
  // audio track (where removing the track is a real, reversible choice). In a
  // standalone audio clip "remove" felt like deleting the file, so we hide the
  // selector there and always treat audio mode as a voice-distortion workspace.
  const allowTrackModes = isVideo
  const distort = allowTrackModes ? settings.mode === 'distort_voice' : true
  const removed = allowTrackModes && settings.mode === 'remove_audio'
  const showProcessed = distort && compare === 'anonymized'

  // Standalone audio is always a distortion workspace — make the persisted mode
  // match so presets/export resolve against 'distort_voice' (never keep/remove).
  useEffect(() => {
    if (!allowTrackModes && settings.mode !== 'distort_voice') {
      onChangeSettings({ ...settings, mode: 'distort_voice' })
    }
  }, [allowTrackModes, settings, onChangeSettings])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    // Play from the source blob (audio file, or the audio track of a video) so
    // playback works even when previewUrl is a video poster image.
    const url = URL.createObjectURL(sourceBlob)
    // Reset transport when the source changes so a stale playhead/state from a
    // previous file (or a revoked URL) can't linger.
    el.pause()
    setPlaying(false)
    setCurrentTime(0)
    el.src = url
    const onMeta = () => setDuration(el.duration || 0)
    el.addEventListener('loadedmetadata', onMeta)
    return () => {
      el.removeEventListener('loadedmetadata', onMeta)
      URL.revokeObjectURL(url)
    }
  }, [sourceBlob])

  // Tear down the Web Audio graph on unmount so monitored audio (ring-mod
  // oscillators, looping noise, analyser → destination) never lingers as ghost
  // noise after leaving audio mode.
  useEffect(() => {
    const el = audioRef.current
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      graphDisconnectRef.current?.()
      graphDisconnectRef.current = null
      try { analyserRef.current?.disconnect() } catch { /* already gone */ }
      try { sourceNodeRef.current?.disconnect() } catch { /* already gone */ }
      el?.pause()
    }
  }, [])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const tick = () => setCurrentTime(el.currentTime)
    // Playback loops (el.loop) so the clip repeats until the user pauses; the
    // 'ended' guard remains as a safety net if looping is ever disabled.
    const onEnded = () => { if (!el.loop) setPlaying(false) }
    el.addEventListener('timeupdate', tick)
    el.addEventListener('ended', onEnded)
    return () => {
      el.removeEventListener('timeupdate', tick)
      el.removeEventListener('ended', onEnded)
    }
  }, [])

  // Decode the source once for the original waveform overview.
  useEffect(() => {
    let cancelled = false
    setOrigPeaks(null)
    setProcPeaks(null)
    origBufferRef.current = null
    void decodeAudioBlob(sourceBlob)
      .then((buffer) => {
        if (cancelled) return
        origBufferRef.current = buffer
        setOrigPeaks(computeWaveformPeaks(buffer, WAVE_BUCKETS))
      })
      .catch(() => { /* unsupported source — overview stays empty */ })
    return () => { cancelled = true }
  }, [sourceBlob])

  // Render the processed waveform overview (debounced) for the A/B compare view.
  useEffect(() => {
    if (!distort) { setProcPeaks(null); return }
    const buffer = origBufferRef.current
    if (!buffer) return
    let cancelled = false
    const handle = setTimeout(() => {
      void renderProcessedAudioBuffer(getAudioContext(), buffer, settings)
        .then((out) => { if (!cancelled) setProcPeaks(computeWaveformPeaks(out, WAVE_BUCKETS)) })
        .catch(() => { if (!cancelled) setProcPeaks(null) })
    }, 220)
    return () => { cancelled = true; clearTimeout(handle) }
  }, [distort, settings, origPeaks])

  const rebuildGraph = useCallback(() => {
    graphDisconnectRef.current?.()
    graphDisconnectRef.current = null
    sourceNodeRef.current?.disconnect()
    analyserRef.current?.disconnect()
    const el = audioRef.current
    if (!el || settings.mode === 'remove_audio') return

    const ctx = getAudioContext()
    if (!sourceNodeRef.current) {
      sourceNodeRef.current = ctx.createMediaElementSource(el)
    }
    if (!analyserRef.current) {
      const an = ctx.createAnalyser()
      an.fftSize = 1024
      an.smoothingTimeConstant = 0.8
      analyserRef.current = an
    }
    const analyser = analyserRef.current

    if (showProcessed) {
      const { output, disconnect } = buildAudioEffectGraph(ctx, sourceNodeRef.current, settings)
      output.connect(analyser)
      graphDisconnectRef.current = disconnect
      // Pitch can't run through a MediaElementSource graph, so mirror the
      // export's varispeed on the element itself (keeps preview === export).
      el.playbackRate = semitonesToPlaybackRate(effectiveAudioSettings(settings).pitchSemitones ?? 0)
    } else {
      sourceNodeRef.current.connect(analyser)
      el.playbackRate = 1
    }
    // Only monitor to the speakers while actually playing. The processed graph
    // includes always-on sources (ring-mod oscillator, looping noise) that would
    // otherwise leak a constant hiss the moment the viewer mounts — exactly the
    // "noise after recording" the user hit when opening a freshly captured clip.
    try { analyser.disconnect(ctx.destination) } catch { /* not connected */ }
    if (playingRef.current) analyser.connect(ctx.destination)
  }, [showProcessed, settings])

  useEffect(() => { rebuildGraph() }, [rebuildGraph])

  // Connect/disconnect speaker monitoring as playback starts/stops so a paused
  // viewer is always silent (no ghost hiss), and audio is audible on play.
  useEffect(() => {
    const analyser = analyserRef.current
    if (!analyser) return
    const ctx = getAudioContext()
    try { analyser.disconnect(ctx.destination) } catch { /* not connected */ }
    if (playing) analyser.connect(ctx.destination)
  }, [playing])

  // Draw the waveform overview + playhead.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let frame = 0

    const draw = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const cssW = canvas.clientWidth || 600
      const cssH = canvas.clientHeight || 160
      if (canvas.width !== Math.floor(cssW * dpr) || canvas.height !== Math.floor(cssH * dpr)) {
        canvas.width = Math.floor(cssW * dpr)
        canvas.height = Math.floor(cssH * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cssW, cssH)

      const mid = cssH / 2
      // Original (not yet anonymized) reads warm orange over a light-grey
      // baseline; the anonymized result reads green. Keeps the A/B state and the
      // privacy status legible at a glance.
      const baseColor = 'rgba(220,224,230,0.32)'
      const accent = showProcessed ? '#00FF78' : '#ff9f43'
      const peaksA = origPeaks
      const peaksB = showProcessed ? procPeaks : null

      // Center line.
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(cssW, mid); ctx.stroke()

      const drawPeaks = (peaks: Float32Array | null, color: string, scale: number) => {
        if (!peaks) return
        const n = peaks.length
        const bw = cssW / n
        ctx.fillStyle = color
        for (let i = 0; i < n; i++) {
          const h = Math.max(1, peaks[i] * mid * 0.92 * scale)
          const x = i * bw
          ctx.fillRect(x, mid - h, Math.max(1, bw - 0.5), h * 2)
        }
      }

      // Original (muted) under the processed overlay for the A/B comparison.
      if (showProcessed && peaksB) {
        drawPeaks(peaksA, baseColor, 1)
        drawPeaks(peaksB, accent, 1)
      } else {
        drawPeaks(peaksA, accent, 1)
      }

      // Playhead.
      if (duration > 0) {
        const px = (currentTime / duration) * cssW
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'
        ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, cssH); ctx.stroke()
      }

      // Live level meter (bottom strip) while playing. A VU-style gradient runs
      // green → yellow → red across the full width, so louder passages push the
      // bar into the red zone.
      const analyser = analyserRef.current
      if (playing && analyser) {
        const buf = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteTimeDomainData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v }
        const rms = Math.sqrt(sum / buf.length)
        const meterH = 4
        const meterW = Math.min(1, rms * 2.2) * cssW
        const grad = ctx.createLinearGradient(0, 0, cssW, 0)
        grad.addColorStop(0, '#00FF78')
        grad.addColorStop(0.55, '#9bff3c')
        grad.addColorStop(0.75, '#ffd34f')
        grad.addColorStop(0.9, '#ff9f43')
        grad.addColorStop(1, '#ff3b30')
        ctx.fillStyle = grad
        ctx.fillRect(0, cssH - meterH, meterW, meterH)
        frame = requestAnimationFrame(draw)
        rafRef.current = frame
      }
    }

    draw()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [origPeaks, procPeaks, showProcessed, currentTime, duration, playing])

  const togglePlay = () => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      void getAudioContext().resume()
      // Only flip to "playing" once playback actually starts — a rejected
      // play() (autoplay policy, decode error) must not leave a stuck UI.
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  const seekToFraction = (fraction: number) => {
    const el = audioRef.current
    if (!el || !duration) return
    const t = Math.max(0, Math.min(duration, fraction * duration))
    el.currentTime = t
    setCurrentTime(t)
  }

  const setMode = (mode: AudioPrivacyMode) => onChangeSettings({ ...settings, mode })

  const setPreset = (preset: AudioEffectPreset) => {
    onChangeSettings(resolveAudioPreset(preset, settings.intensity, { ...settings, preset }))
  }

  // Advanced edits switch to a 'custom' preset seeded from the resolved values so
  // the sound doesn't jump when the user starts tweaking.
  const setAdvanced = (patch: Partial<AudioEffectSettings>) => {
    const base = effectiveAudioSettings(settings)
    onChangeSettings({ ...base, ...patch, noiseAmount: 0, mode: settings.mode, preset: 'custom' })
  }
  const adv = effectiveAudioSettings(settings)

  // Voice character — pitch & formant shifting (the core de-identification).
  const voiceSliders = (
    <>
      <ToolSliderRow label="Pitch" min={-12} max={12} step={1}
        value={Math.round(adv.pitchSemitones ?? 0)} format={(v) => `${v > 0 ? '+' : ''}${v} st`}
        onChange={(v) => setAdvanced({ pitchSemitones: v })} />
      <ToolSliderRow label="Formant" min={-100} max={100} step={1}
        value={Math.round((adv.formantShift ?? 0) * 100)} format={(v) => `${v > 0 ? '+' : ''}${v}%`}
        onChange={(v) => setAdvanced({ formantShift: v / 100 })} />
    </>
  )
  // Tone & texture — spectral shaping.
  const toneSliders = (
    <>
      <ToolSliderRow label="Low-pass" min={800} max={16000} step={100}
        value={Math.round(adv.lowpassHz ?? 8000)} format={(v) => `${(v / 1000).toFixed(1)} kHz`}
        onChange={(v) => setAdvanced({ lowpassHz: v })} />
      <ToolSliderRow label="High-pass" min={20} max={1000} step={10}
        value={Math.round(adv.highpassHz ?? 80)} format={(v) => `${v} Hz`}
        onChange={(v) => setAdvanced({ highpassHz: v })} />
      <ToolSliderRow label="Ring mod" min={0} max={120} step={1}
        value={Math.round(adv.ringModFrequency ?? 0)} format={(v) => v ? `${v} Hz` : 'off'}
        onChange={(v) => setAdvanced({ ringModFrequency: v })} />
      <ToolSliderRow label="Bitcrush" min={0} max={100} step={1}
        value={Math.round((adv.bitcrushAmount ?? 0) * 100)} format={(v) => v ? `${v}%` : 'off'}
        onChange={(v) => setAdvanced({ bitcrushAmount: v / 100 })} />
    </>
  )
  // Timing & motion — amplitude/timing modulation that smears temporal cues.
  const timingSliders = (
    <>
      <ToolSliderRow label="Tremolo" min={0} max={95} step={1}
        value={Math.round((adv.tremoloDepth ?? 0) * 100)} format={(v) => v ? `${v}%` : 'off'}
        onChange={(v) => setAdvanced({ tremoloDepth: v / 100 })} />
      <ToolSliderRow label="Timing wobble" min={0} max={100} step={1}
        value={Math.round((adv.randomizationAmount ?? 0) * 100)} format={(v) => v ? `${v}%` : 'off'}
        onChange={(v) => setAdvanced({ randomizationAmount: v / 100 })} />
    </>
  )
  const categoryContent = (id: AudioCategory) =>
    id === 'voice' ? voiceSliders : id === 'tone' ? toneSliders : timingSliders

  const exportAudio = async (formatId?: AudioExportFormat['id']) => {
    if (activePhoto.isVideo) return
    setShowFormats(false)
    setExporting(true)
    try {
      const id = formatId ?? exportFormatId
      if (formatId && formatId !== exportFormatId) setExportFormatId(formatId)
      const format = exportFormats.find((f) => f.id === id) ?? exportFormats[0]
      const buffer = origBufferRef.current ?? await decodeAudioBlob(sourceBlob)
      const out = distort
        ? await renderProcessedAudioBuffer(getAudioContext(), buffer, settings)
        : buffer
      const blob = await encodeAudioBuffer(out, format)
      saveAs(blob, anonymizedAudioFilename(activePhoto.name, format.ext))
      // Persist the anonymized result so the library reflects it (export + outline).
      if (distort) onCommitAnonymized?.(blob, blob.type || 'audio/wav')
    } finally {
      setExporting(false)
    }
  }

  const activeCatMeta = CATEGORY_META.find((c) => c.id === activeCat) ?? null

  // Standalone audio on mobile shows its primary actions (A/B compare, level
  // meter, info + download) consolidated in a row under the waveform.
  const showFootActions = isMobileLayout && !isVideo && !removed

  const renderAbToggle = (compact = false) =>
    distort ? (
      <button
        type="button"
        role="switch"
        aria-checked={compare === 'anonymized'}
        className={`audio-ab-switch${compare === 'anonymized' ? ' is-anon' : ' is-orig'}${compact ? ' audio-ab-switch--compact' : ''}`}
        onClick={() => setCompare((c) => (c === 'anonymized' ? 'original' : 'anonymized'))}
        title="Toggle between the original and the anonymized voice"
      >
        <span className="audio-ab-switch-label audio-ab-switch-label--orig">{compact ? 'Orig' : 'Original'}</span>
        <span className="audio-ab-switch-track" aria-hidden="true"><span className="audio-ab-switch-thumb" /></span>
        <span className="audio-ab-switch-label audio-ab-switch-label--anon">{compact ? 'Anon' : 'Anonymized'}</span>
      </button>
    ) : null

  const transport = (
    <div className="audio-toolbar-row audio-transport">
      <button type="button" className="btn btn-sm" onClick={togglePlay} disabled={removed}>
        <Icon name={playing ? 'pause' : 'play_arrow'} size={18} />
      </button>
      <input
        type="range"
        className="audio-mode-scrubber"
        min={0}
        max={duration || 1}
        step={0.01}
        value={currentTime}
        disabled={removed}
        onChange={(e) => seekToFraction(parseFloat(e.target.value) / (duration || 1))}
      />
      <span className="audio-mode-time">{fmtTime(currentTime)} / {fmtTime(duration)}</span>
    </div>
  )

  return (
    <div className={`audio-mode-viewer${isVideo ? ' audio-mode-viewer--embed' : ''}${isMobileLayout ? ' audio-mode-viewer--mobile' : ''}`}>
      <audio ref={audioRef} preload="metadata" loop />

      <div className="audio-stage">
        {/* The standalone audio workspace shows the filename in the shell/toolbar
            above, so the stage stays a clean visualization. The video editor's
            embedded panel keeps the label for context. */}
        {isVideo && (
          <div className="audio-stage-top">
            <div className="audio-stage-title">
              <Icon name="graphic_eq" size={18} />
              <span>{activePhoto.name.split('/').pop()}</span>
            </div>
          </div>
        )}

        <div
          className="audio-wave-wrap"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            seekToFraction((e.clientX - rect.left) / rect.width)
          }}
        >
          {removed ? (
            <div className="audio-wave-empty"><Icon name="volume_off" size={28} /> Audio removed on export</div>
          ) : (
            <canvas ref={canvasRef} className="audio-wave-canvas" />
          )}
          {/* The live level meter is drawn as a VU-gradient strip along the bottom
              of the canvas (see the draw loop). */}
          {/* Mobile: the transport timeline lives at the bottom of the preview.
              Stop propagation so scrubbing doesn't trigger the wave click-seek. */}
          {showFootActions && (
            <div className="audio-wave-transport" onClick={(e) => e.stopPropagation()}>
              {transport}
            </div>
          )}
        </div>

        {/* Mobile actions row: Orig/Anon compare on the left, info + compact
            Download on the right. The codec choice opens only after tapping
            Download; the privacy note hides behind the info icon. */}
        {showFootActions && (
          <div className="audio-preview-actions">
            {renderAbToggle(true)}
            <div className="audio-preview-actions-right">
              <button
                type="button"
                className={`audio-info-btn${showWarn ? ' active' : ''}`}
                onClick={() => { setShowFormats(false); setShowWarn((s) => !s) }}
                aria-label="Voice privacy note"
                title="Voice privacy note"
              >
                <Icon name="info" size={18} />
              </button>
              <div className="audio-download-wrap">
                <button
                  type="button"
                  className="audio-download-main audio-download-main--compact"
                  onClick={() => { setShowWarn(false); setShowFormats((s) => !s) }}
                  disabled={exporting}
                >
                  <Icon name="download" size={16} /> {exporting ? 'Exporting…' : 'Download'}
                </button>
                {showFormats && (
                  <>
                    <div className="audio-pop-backdrop" onClick={() => setShowFormats(false)} aria-hidden="true" />
                    <div className="audio-format-menu" role="menu">
                      <p className="audio-format-menu-title">Download as</p>
                      {exportFormats.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          className={`audio-format-item${f.id === exportFormatId ? ' active' : ''}`}
                          role="menuitem"
                          onClick={() => { void exportAudio(f.id) }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            {showWarn && (
              <>
                <div className="audio-pop-backdrop" onClick={() => setShowWarn(false)} aria-hidden="true" />
                <div className="audio-warn-pop">{AUDIO_PRIVACY_WARNING}</div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="audio-toolbar">
        {/* Desktop keeps the timeline in the toolbar; mobile moves it into the
            bottom of the preview (see audio-wave-transport above). */}
        {!showFootActions && transport}

        {(allowTrackModes || (distort && !showFootActions)) && (
          <div className="audio-toolbar-row audio-toolbar-modes">
            {allowTrackModes && (
              <div className="audio-seg">
                {(['keep_original', 'remove_audio', 'distort_voice'] as AudioPrivacyMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`btn btn-sm${settings.mode === mode ? ' active' : ''}`}
                    onClick={() => setMode(mode)}
                  >
                    {mode === 'keep_original' ? 'Keep' : mode === 'remove_audio' ? 'Remove track' : 'Distort'}
                  </button>
                ))}
              </div>
            )}

            {distort && !showFootActions && renderAbToggle()}
          </div>
        )}

        {distort && (
          <>
            <div className="audio-toolbar-row audio-presets-row">
              {(settings.preset === 'custom' ? [...PRESETS, 'custom' as AudioEffectPreset] : PRESETS).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn btn-sm audio-preset-chip${settings.preset === p ? ' active' : ''}`}
                  onClick={() => setPreset(p)}
                >
                  {AUDIO_PRESET_LABELS[p]}
                </button>
              ))}
            </div>

            <div className="audio-toolbar-row audio-intensity-row">
              <ToolSliderRow
                label="Intensity"
                min={0}
                max={100}
                value={settings.intensity}
                format={(v) => `${v}%`}
                onChange={(v) => onChangeSettings(resolveAudioPreset(settings.preset, v, settings))}
              />
            </div>

            {/* Voice / Tone / Timing — tabs in a bottom menu. Mobile reuses the
                live-mode tool-category buttons (identical look on phone/tablet)
                and opens a bottom drawer; desktop keeps the floating flyout. */}
            <div className="audio-cat-bar">
              {isMobileLayout ? (
                <div className="mobile-tool-categories audio-cat-categories">
                  {CATEGORY_META.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`mobile-tool-btn${activeCat === c.id ? ' active' : ''}`}
                      onClick={() => setActiveCat((a) => (a === c.id ? null : c.id))}
                      aria-label={c.title}
                    >
                      <Icon name={c.icon} size={22} />
                      <span className="mobile-tool-btn-label">{c.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="audio-cat-tabs">
                  {CATEGORY_META.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`audio-cat-tab${activeCat === c.id ? ' active' : ''}`}
                      onClick={() => setActiveCat((a) => (a === c.id ? null : c.id))}
                    >
                      <Icon name={c.icon} size={16} /> <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {!isMobileLayout && (
                <button
                  type="button"
                  className={`audio-info-btn${showWarn ? ' active' : ''}`}
                  onClick={() => setShowWarn((s) => !s)}
                  aria-label="Voice privacy note"
                  title="Voice privacy note"
                >
                  <Icon name="info" size={18} />
                </button>
              )}

              {!isMobileLayout && activeCatMeta && (
                <>
                  <div className="audio-pop-backdrop" onClick={() => setActiveCat(null)} aria-hidden="true" />
                  <div className="audio-flyout">
                    <p className="audio-flyout-title">{activeCatMeta.title}</p>
                    <div className="audio-flyout-grid">{categoryContent(activeCatMeta.id)}</div>
                  </div>
                </>
              )}

              {!isMobileLayout && showWarn && (
                <>
                  <div className="audio-pop-backdrop" onClick={() => setShowWarn(false)} aria-hidden="true" />
                  <div className="audio-warn-pop audio-warn-pop--desktop">{AUDIO_PRIVACY_WARNING}</div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Mobile: tapping a category in the bottom menu overlays a drawer that
          shows just that one category's controls (no in-drawer tabs), matching
          the other tool drawers. */}
      {isMobileLayout && distort && (
        <MobileToolDrawer
          open={activeCat !== null}
          onClose={() => setActiveCat(null)}
          title={activeCatMeta?.title ?? 'Voice settings'}
        >
          <div className="audio-drawer-controls">
            {activeCat && categoryContent(activeCat)}
          </div>
        </MobileToolDrawer>
      )}
    </div>
  )
}
