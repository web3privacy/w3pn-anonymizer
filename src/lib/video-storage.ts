/** Private, temporary disk storage. Media never leaves the device. */
// Keep ownership across hot module replacement: existing library blobs can outlive
// the module instance that produced them.
const ownershipKey = Symbol.for('w3pn.video.temporary-file-owners')
const host = globalThis as typeof globalThis & { [ownershipKey]?: WeakMap<Blob, () => Promise<void>> }
const owners = host[ownershipKey] ??= new WeakMap<Blob, () => Promise<void>>()
const leaseKey = Symbol.for('w3pn.video.temporary-file-leases')
const leaseHost = globalThis as typeof globalThis & { [leaseKey]?: WeakMap<Blob, { readers: number; released: boolean }> }
const leases = leaseHost[leaseKey] ??= new WeakMap<Blob, { readers: number; released: boolean }>()
const PREFIX = 'anonymizer-video-'
let session: Promise<FileSystemDirectoryHandle> | undefined

interface VideoFileWriter {
  write(data: { type: 'write'; position: number; data: Uint8Array<ArrayBuffer> | Blob }): Promise<void>
  close(): Promise<void>
  abort(): Promise<void>
}

async function createWriter(handle: FileSystemFileHandle): Promise<VideoFileWriter> {
  if (typeof handle.createWritable === 'function') return handle.createWritable()
  const worker = new Worker(new URL('./video-storage.worker.ts', import.meta.url), { type: 'module' })
  let sequence = 0
  let terminated = false
  const terminate = () => { terminated = true; worker.terminate() }
  const request = (command: string, payload: object = {}) => new Promise<void>((resolve, reject) => {
    if (terminated) { reject(new Error('Temporary storage worker is closed.')); return }
    const id = ++sequence
    const cleanup = () => { clearTimeout(timer); worker.onmessage = null; worker.onerror = null }
    const timer = setTimeout(() => { cleanup(); terminate(); reject(new Error('Temporary video storage timed out.')) }, 30_000)
    worker.onmessage = (event) => {
      if (event.data.id !== id) return
      cleanup()
      if (event.data.error) reject(new Error(event.data.error)); else resolve()
    }
    worker.onerror = () => { cleanup(); terminate(); reject(new Error('Temporary video storage worker failed.')) }
    try { worker.postMessage({ id, command, ...payload }) }
    catch (error) { cleanup(); reject(error) }
  })
  try { await request('open', { handle }) } catch (error) { terminate(); throw error }
  return {
    write: (data) => request('write', data),
    close: async () => { try { await request('close') } finally { terminate() } },
    abort: async () => { if (terminated) return; try { await request('abort') } finally { terminate() } },
  }
}

async function directory(): Promise<FileSystemDirectoryHandle> {
  return session ??= (async () => {
    if (!navigator.storage?.getDirectory) throw new Error('This browser cannot store temporary video files. Use a recent browser with private file storage enabled.')
    const root = await navigator.storage.getDirectory()
    const name = PREFIX + crypto.randomUUID()
    // A lock identifies live tabs; only abandoned sessions may be removed.
    if (navigator.locks) {
      await new Promise<void>((resolve) => {
        void navigator.locks.request(name, async () => { resolve(); await new Promise(() => {}) })
      })
      const entries = root as FileSystemDirectoryHandle & { keys(): AsyncIterableIterator<string> }
      for await (const key of entries.keys()) {
        if (!key.startsWith(PREFIX) || key === name) continue
        await navigator.locks.request(key, { ifAvailable: true }, async (lock) => {
          if (lock) await root.removeEntry(key, { recursive: true }).catch(() => undefined)
        })
      }
    }
    return root.getDirectoryHandle(name, { create: true })
  })().catch((error) => { session = undefined; throw error })
}

export function transferVideoFileOwnership(from: Blob, to: Blob): void {
  const dispose = owners.get(from)
  if (dispose) { owners.delete(from); owners.set(to, dispose) }
}

export async function releaseVideoFile(blob: Blob): Promise<void> {
  const lease = leases.get(blob)
  if (lease?.readers) { lease.released = true; return }
  const dispose = owners.get(blob)
  await dispose?.()
  owners.delete(blob)
  leases.delete(blob)
}

/** An in-flight save must survive removing/replacing its item in the library. */
export function retainVideoFile(blob: Blob): (() => Promise<void>) | undefined {
  if (!owners.has(blob)) return undefined
  const lease = leases.get(blob) ?? { readers: 0, released: false }
  lease.readers++
  leases.set(blob, lease)
  let returned = false
  return async () => {
    if (returned) return
    returned = true
    lease.readers--
    if (lease.released && lease.readers === 0) await releaseVideoFile(blob)
  }
}

export class VideoTempFile {
  private pending: Promise<void> = Promise.resolve()
  private failure: unknown
  private queuedBytes = 0
  private closed = false
  size = 0

  private constructor(private root: FileSystemDirectoryHandle, private name: string,
    private handle: FileSystemFileHandle, private writer: VideoFileWriter) {}

  static async create(): Promise<VideoTempFile> {
    const root = await directory()
    const name = crypto.randomUUID()
    const handle = await root.getFileHandle(name, { create: true })
    try { return new VideoTempFile(root, name, handle, await createWriter(handle)) }
    catch (error) { await root.removeEntry(name).catch(() => undefined); throw error }
  }

  write(data: Uint8Array | Blob, position = this.size): void {
    if (this.failure) throw this.failure
    if (this.closed) throw new Error('Temporary video file is closed.')
    const length = data instanceof Blob ? data.size : data.byteLength
    // This bounds pending I/O, not video length. Producers drain between frames.
    if (this.queuedBytes + length > 32 * 1024 * 1024) throw new Error('Temporary storage cannot keep up with video encoding. Free disk space or reduce export resolution.')
    this.queuedBytes += length
    this.size = Math.max(this.size, position + length)
    const owned = data instanceof Blob ? data : new Uint8Array(data)
    this.pending = this.pending.then(async () => {
      if (!this.failure) await this.writer.write({ type: 'write', position, data: owned })
    }).catch((error: unknown) => {
      this.failure = new Error(`Could not write temporary video data. Check available disk space. ${String(error)}`)
    }).finally(() => { this.queuedBytes -= length })
  }

  async drain(): Promise<void> { await this.pending; if (this.failure) throw this.failure }

  async finish(type = ''): Promise<Blob> {
    await this.drain()
    if (!this.closed) { await this.writer.close(); this.closed = true }
    const file = await this.handle.getFile()
    const blob = type ? file.slice(0, file.size, type) : file
    owners.set(blob, () => this.dispose())
    return blob
  }

  async dispose(): Promise<void> {
    await this.pending
    if (!this.closed) { await this.writer.abort().catch(() => undefined); this.closed = true }
    await this.root.removeEntry(this.name).catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === 'NotFoundError')) throw error
    })
  }
}
