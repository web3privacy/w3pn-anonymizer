// Sync OPFS access is available in older WebKit versions that lack createWritable.
interface SyncHandle {
  write(data: Uint8Array, options: { at: number }): number
  flush(): void
  close(): void
}
let handle: SyncHandle | undefined
self.onmessage = async (event: MessageEvent) => {
  const { id, command } = event.data
  try {
    if (command === 'open') handle = await event.data.handle.createSyncAccessHandle()
    else if (command === 'write') {
      const data = event.data.data instanceof Blob ? new Uint8Array(await event.data.data.arrayBuffer()) : event.data.data
      let offset = 0
      while (offset < data.byteLength) {
        const written = handle!.write(data.subarray(offset), { at: event.data.position + offset })
        if (!written) throw new Error('Temporary storage write made no progress.')
        offset += written
      }
    } else if (command === 'close') { handle?.flush(); handle?.close(); handle = undefined }
    else if (command === 'abort') { handle?.close(); handle = undefined }
    self.postMessage({ id })
  } catch (error) { self.postMessage({ id, error: String(error) }) }
}
export {}
