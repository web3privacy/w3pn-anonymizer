/** Honest, non-overclaiming privacy copy for the live voice mask. */
export const VOICE_MASK_PRIVACY = {
  short: 'All voice processing runs locally in your browser. Nothing is uploaded.',
  strength:
    'Voice masking destructively alters pitch and timbre to strongly reduce recognizability. ' +
    'It is NOT guaranteed to defeat forensic speaker recognition. For the strongest privacy, ' +
    'combine with on-camera masking and avoid revealing personal details.',
  monitorWarning:
    'Monitoring plays the masked voice through your speakers — use headphones to avoid feedback.',
} as const

export const AI_VOICE_MASK_NOTE =
  'A future on-device AI voice conversion provider can be plugged in here; the current mask is a ' +
  'classic-DSP, fully-offline implementation.'
