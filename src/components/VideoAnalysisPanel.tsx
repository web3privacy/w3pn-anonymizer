import { useMemo, useState } from 'react'
import type { VideoAnalysisSettings, VideoAnalysisResult, VideoReviewRange } from '../lib/video-analysis'
import { formatVideoTime } from '../lib/video-layout'
import './video-analysis.css'

interface Props {
  settings: VideoAnalysisSettings
  onSettings: (settings: VideoAnalysisSettings) => void
  result?: VideoAnalysisResult
  disabled: boolean
  onAdditionalPass: () => void
  onSeek: (time: number) => void
  onDrawRange: (range: VideoReviewRange) => void
}

export function VideoAnalysisPanel({ settings, onSettings, result, disabled, onAdditionalPass, onSeek, onDrawRange }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(0)
  const [reviewed, setReviewed] = useState<Set<string>>(new Set())
  const selectedIndex = Math.max(0, Math.min(selected, (result?.review.length ?? 1) - 1))
  const range = result?.review[selectedIndex]
  const reviewKey = (item: VideoReviewRange) => `${result?.signature}:${result?.samples.length}:${item.id}`
  const remaining = result?.review.filter((item) => !reviewed.has(reviewKey(item))).length ?? 0
  // Bound DOM work for long clips while retaining every interval in the review navigator.
  const bins = useMemo(() => {
    if (!result) return []
    const groups: { index: number; count: number }[] = []
    for (let bin = 0; bin < 100; bin++) {
      const start = bin * result.duration / 100, end = (bin + 1) * result.duration / 100
      const index = result.review.findIndex((item) => item.startSec < end && item.endSec > start)
      const last = groups[groups.length - 1]
      if (last?.index === index) last.count++
      else groups.push({ index, count: 1 })
    }
    return groups
  }, [result])
  const select = (index: number) => {
    if (!result?.review[index]) return
    setSelected(index); onSeek(result.review[index].startSec)
  }
  return <details className="video-analysis-panel" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary>ANALYSIS · {settings.mode === 'every-frame' ? 'Every frame' : `${settings.samplesPerSecond} checks/s`} · {settings.mode === 'every-frame' ? 1 : settings.passes} pass{settings.mode === 'every-frame' || settings.passes === 1 ? '' : 'es'}{result ? ` · ${remaining} to review` : ''}</summary>
    <div className="video-analysis-fields">
      <label>Check frames
        <select aria-label="Check frames" value={settings.mode} disabled={disabled} onChange={(event) => onSettings({ ...settings, mode: event.target.value as VideoAnalysisSettings['mode'] })}>
          <option value="sampled">At a chosen rate</option><option value="every-frame">Every output frame</option>
        </select>
      </label>
      {settings.mode === 'sampled' && <label>Checks per second
        <input type="number" min={0.25} max={120} step={0.25} value={settings.samplesPerSecond} disabled={disabled}
          onChange={(event) => onSettings({ ...settings, samplesPerSecond: Math.max(0.25, Math.min(120, Number(event.target.value) || 0.25)) })} />
      </label>}
      <label>Passes
        <select aria-label="Passes" value={settings.mode === 'every-frame' ? 1 : settings.passes} disabled={disabled || settings.mode === 'every-frame'} onChange={(event) => onSettings({ ...settings, passes: Number(event.target.value) })}>
          {[1, 2, 3, 4, 6, 8].map((passes) => <option key={passes}>{passes}</option>)}
        </select>
      </label>
    </div>
    <p>Output stays smooth. Additional passes check new frames in the gaps. Masks cover the area between detections; sparse checks can miss brief appearances. Every frame uses the estimated output frame rate.</p>
    <p>Processing uses temporary storage on this device, with automatic cleanup.</p>
    {result && <>
      <div className="video-analysis-actions">
        <span>{result.samples.length} frames checked · {result.passes} pass{result.passes === 1 ? '' : 'es'} completed</span>
        <button type="button" className="btn btn-sm" disabled={disabled || result.fullFrameCoverage} onClick={onAdditionalPass}>{result.fullFrameCoverage ? 'All output frames checked' : '+ Analyze another pass'}</button>
      </div>
      <div className="video-review-track" aria-label="Review timeline">
        {bins.map(({ index, count }, bin) => index < 0 ? <span key={bin} style={{ flex: count }} /> : <button type="button" key={bin} disabled={disabled} style={{ flex: count }}
          className={reviewed.has(reviewKey(result.review[index])) ? "reviewed" : undefined}
          aria-label={`Review ${formatVideoTime(result.review[index].startSec)}–${formatVideoTime(result.review[index].endSec)}`}
          title={result.review[index].reasons.join('; ')} onClick={() => select(index)} />)}
      </div>
      {range ? <div className="video-review-detail">
        <div className="video-analysis-actions">
          <button className="btn btn-sm" type="button" disabled={disabled || selectedIndex <= 0} onClick={() => select(selectedIndex - 1)}>Previous</button>
          <span>{selectedIndex + 1} / {result.review.length} · {formatVideoTime(range.startSec)}–{formatVideoTime(range.endSec)}</span>
          <button className="btn btn-sm" type="button" disabled={disabled || selectedIndex >= result.review.length - 1} onClick={() => select(selectedIndex + 1)}>Next</button>
        </div>
        <p>{range.reasons.join(' · ')}</p>
        <div className="video-analysis-actions">
          <button className="btn btn-sm" type="button" disabled={disabled} onClick={() => onSeek(range.startSec)}>Show interval</button>
          <button className="btn btn-sm" type="button" disabled={disabled} onClick={() => { onDrawRange(range); setOpen(false) }}>Draw mask for interval</button>
          <button className="btn btn-sm" type="button" disabled={disabled || reviewed.has(reviewKey(range))} onClick={() => setReviewed((old) => new Set(old).add(reviewKey(range)))}>{reviewed.has(reviewKey(range)) ? 'Reviewed' : 'Mark reviewed'}</button>
        </div>
        <p>Drawing a mask requires processing again. Review marks do not remove masks or certify anonymity.</p>
      </div> : <p>No review cues were found. Check the result visually before sharing.</p>}
    </>}
  </details>
}
