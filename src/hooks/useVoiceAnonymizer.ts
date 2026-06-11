import { useCallback, useEffect, useRef, useState } from 'react'
import { getAudioContext } from '../lib/audio/audioUtils'
import { createLiveVoiceGraph, type LiveVoiceGraph } from '../lib/audio/live/liveVoicePipeline'
import { resolveVoiceMaskParams } from '../lib/audio/live/voiceMaskPresets'
import {
  DEFAULT_VOICE_MASK_SETTINGS,
  type VoiceMaskSettings,
} from '../lib/audio/live/voiceMaskTypes'

const STORAGE_KEY = 'anonymizer-voice-mask'

function loadSettings(): VoiceMaskSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<VoiceMaskSettings>
      const legacy = new Set([
        'synthetic_witness', 'robot_courier', 'broken_radio', 'deep_scramble',
      ])
      const preset = legacy.has(String(parsed.preset))
        ? 'maximum_mask'
        : (parsed.preset ?? DEFAULT_VOICE_MASK_SETTINGS.preset)
      return { ...DEFAULT_VOICE_MASK_SETTINGS, ...parsed, preset, enabled: false }
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_VOICE_MASK_SETTINGS }
}

/**
 * Manages the live voice-mask: mic capture, the local DSP graph, monitoring,
 * recording, and persisted UI prefs. A per-session random seed varies the pitch
 * so each session sounds different (anti-fingerprinting).
 */
export function useVoiceAnonymizer() {
  const [settings, setSettings] = useState<VoiceMaskSettings>(loadSettings)
  const [running, setRunning] = useState(false)
  const [recording, setRecording] = useState(false)
  const [level, setLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)

  const micRef = useRef<MediaStream | null>(null)
  const graphRef = useRef<LiveVoiceGraph | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const seedRef = useRef(Math.random())
  const startingRef = useRef(false)
  const recordingUrlRef = useRef<string | null>(null)

  // Persist prefs (never the audio).
  useEffect(() => {
    try {
      const { monitor, preset, strength, intelligibility } = settings
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ monitor, preset, strength, intelligibility }))
    } catch { /* ignore */ }
  }, [settings])

  // Push parameter changes to the live graph.
  useEffect(() => {
    if (!graphRef.current) return
    graphRef.current.setParams(resolveVoiceMaskParams(settings, seedRef.current))
    graphRef.current.setMonitor(settings.monitor)
  }, [settings])

  const start = useCallback(async () => {
    // Mutex: graphRef is only set at the very end, so without this an eager
    // double-click could open two mic streams and orphan the first graph.
    if (graphRef.current || startingRef.current) return
    startingRef.current = true
    setError(null)
    try {
      const mic = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      micRef.current = mic
      const ctx = getAudioContext()
      await ctx.resume()
      seedRef.current = Math.random()
      const graph = await createLiveVoiceGraph(ctx, mic, resolveVoiceMaskParams(settings, seedRef.current))
      graph.onLevel((rms) => setLevel(rms))
      graph.setMonitor(settings.monitor)
      graphRef.current = graph
      setRunning(true)
    } catch (err) {
      console.error('voice mask start failed', err)
      setError(err instanceof Error ? err.message : 'Microphone unavailable')
      micRef.current?.getTracks().forEach((t) => t.stop())
      micRef.current = null
    } finally {
      startingRef.current = false
    }
  }, [settings])

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    graphRef.current?.dispose()
    graphRef.current = null
    micRef.current?.getTracks().forEach((t) => t.stop())
    micRef.current = null
    setRunning(false)
    setRecording(false)
    setLevel(0)
  }, [])

  const startRecording = useCallback(() => {
    const graph = graphRef.current
    if (!graph || recorderRef.current?.state === 'recording') return
    chunksRef.current = []
    // Pick a container the browser can actually record (Safari/Firefox reject
    // webm) instead of blindly assuming audio/webm.
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
    const supports = typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported
    const mime = candidates.find((c) => supports && MediaRecorder.isTypeSupported(c)) ?? ''
    let rec: MediaRecorder
    try {
      rec = mime ? new MediaRecorder(graph.outputStream, { mimeType: mime }) : new MediaRecorder(graph.outputStream)
    } catch (err) {
      console.error('voice mask recording unsupported', err)
      setError('Recording is not supported in this browser')
      return
    }
    rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || mime || 'audio/webm' })
      setRecordingUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob) })
    }
    rec.start()
    recorderRef.current = rec
    setRecording(true)
  }, [])

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    setRecording(false)
  }, [])

  // Track the latest recording URL so it can be revoked on teardown.
  useEffect(() => { recordingUrlRef.current = recordingUrl }, [recordingUrl])

  useEffect(() => () => {
    stop()
    if (recordingUrlRef.current) {
      URL.revokeObjectURL(recordingUrlRef.current)
      recordingUrlRef.current = null
    }
  }, [stop])

  // The distorted output track (from the live graph's MediaStreamDestination).
  // Used to mix the anonymized voice into recorded live videos.
  const getOutputTrack = useCallback(
    () => graphRef.current?.outputStream.getAudioTracks()[0] ?? null,
    [],
  )

  return {
    settings, setSettings,
    running, recording, level, error, recordingUrl,
    start, stop, startRecording, stopRecording,
    getOutputTrack,
    analyser: () => graphRef.current?.analyser ?? null,
  }
}
