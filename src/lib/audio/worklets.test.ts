import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'

function load(name: string) {
  const messages: unknown[] = []
  interface ProcessorInstance {
    port: { onmessage: (event: { data: string }) => void }
    process: (inputs: Float32Array[][], outputs?: Float32Array[][], parameters?: { semitones: number[] }) => void
  }
  let Processor: new () => ProcessorInstance = class {
    port = { onmessage: (_event: { data: string }) => {} }
    process() {}
  }
  class Base { port = { postMessage: (data: unknown) => messages.push(data), onmessage: null as ((event: { data: string }) => void) | null } }
  runInNewContext(readFileSync(new URL(`../../../public/audio/${name}.js`, import.meta.url), 'utf8'), {
    AudioWorkletProcessor: Base, sampleRate: 48000, Float32Array, Math,
    registerProcessor: (_name: string, type: new () => ProcessorInstance) => { Processor = type },
  })
  return { processor: new Processor(), messages }
}

describe('bounded streaming audio worklets', () => {
  it('captures every sample, flushes the partial tail and acknowledges completion', () => {
    const { processor, messages } = load('pcm-capture')
    const block = new Float32Array(128).fill(0.25)
    processor.process([[block]])
    expect(messages).toHaveLength(0)
    processor.port.onmessage({ data: 'start' })
    for (let i = 0; i < 17; i++) processor.process([[block]])
    processor.port.onmessage({ data: 'stop' })
    expect((messages[0] as Float32Array[])[0].length).toBe(2048)
    expect((messages[1] as Float32Array[])[0].length).toBe(128)
    expect(messages[2]).toBe('stopped')
    expect((messages[1] as Float32Array[])[1][0]).toBe(0.25)
  })
  it('pitch shift changes frequency without changing the number of video audio samples', () => {
    const { processor } = load('pitch-shift')
    const result: number[] = []
    for (let block = 0; block < 375; block++) {
      const input = Float32Array.from({ length: 128 }, (_, i) => Math.sin(2 * Math.PI * 200 * (block * 128 + i) / 48000))
      const output = [new Float32Array(128), new Float32Array(128)]
      processor.process([[input]], [output], { semitones: [12] })
      result.push(...output[0])
    }
    expect(result).toHaveLength(48000)
    const tail = result.slice(4800)
    const crossings = tail.reduce((n, value, i) => n + (i > 0 && value > 0 && tail[i - 1] <= 0 ? 1 : 0), 0)
    expect(crossings / 0.9).toBeGreaterThan(370)
    expect(crossings / 0.9).toBeLessThan(430)
    expect(result.every(Number.isFinite)).toBe(true)
  })
})
