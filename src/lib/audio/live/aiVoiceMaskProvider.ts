/**
 * Placeholder interface for a future on-device AI voice-conversion provider.
 * The current production path is the classic-DSP {@link createLiveVoiceGraph}.
 * An AI provider must remain fully local (no network) to honor the privacy model.
 */
import type { VoiceMaskParams } from './voiceMaskTypes'

export interface AiVoiceMaskProvider {
  readonly id: string
  readonly label: string
  /** Must be true — providers that call out to the network are rejected. */
  readonly local: boolean
  /** Returns a processed output stream from the mic input. */
  createStream(ctx: AudioContext, input: MediaStream, params: VoiceMaskParams): Promise<MediaStream>
  dispose(): void
}

/** No AI provider is bundled yet; classic DSP is used. */
export const aiVoiceMaskProvider: AiVoiceMaskProvider | null = null
