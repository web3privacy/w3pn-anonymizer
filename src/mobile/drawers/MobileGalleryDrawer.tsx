import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import { isBatchProcessablePhoto } from '../../lib/batch-normalize'
import type { PhotoItem } from '../../types'
import { MobileToolDrawer } from '../MobileToolDrawer'

interface MobileGalleryDrawerProps {
  open: boolean
  onClose: () => void
  photos: PhotoItem[]
  displayedPhotos: PhotoItem[]
  anonymizedPhotoIds: Set<string>
  activePhotoId: string | null
  sidebarView: 'grid' | 'list'
  setSidebarView: (v: 'grid' | 'list') => void
  batchSelectMode: boolean
  selectedForBatch: Set<string>
  toggleBatchSelect: (id: string) => void
  onDeletePhoto: (id: string) => void
  onSelectPhoto: (id: string) => void
  onAddFiles: () => void
  onSelectBatch: () => void
  onOpenBatch: () => void
  onDownloadAllZip?: (photoIds?: string[]) => void
  onDownloadAllIndividual?: (photoIds?: string[]) => void
  downloadAllDisabled?: boolean
  exportProgress?: { done: number; total: number } | null
}

function mediaCounts(photos: PhotoItem[]) {
  const libraryPhotos = photos.filter((p) => !p.isVideoFrameEdit)
  const videos = libraryPhotos.filter((p) => p.isVideo).length
  const audio = libraryPhotos.filter((p) => p.isAudio).length
  const docs = libraryPhotos.filter((p) => p.isDocument).length
  const images = libraryPhotos.length - videos - audio - docs
  const kinds = [videos, audio, docs].filter((n) => n > 0).length + (images > 0 ? 1 : 0)
  if (kinds > 1) return `${libraryPhotos.length} FILES`
  if (videos > 0) return `${videos} VIDEO${videos !== 1 ? 'S' : ''}`
  if (audio > 0) return `${audio} AUDIO`
  if (docs > 0) return `${docs} DOC${docs !== 1 ? 'S' : ''}`
  return `${images} PHOTO${images !== 1 ? 'S' : ''}`
}

export function MobileGalleryDrawer({
  open,
  onClose,
  photos,
  displayedPhotos,
  anonymizedPhotoIds,
  activePhotoId,
  sidebarView,
  setSidebarView,
  batchSelectMode,
  selectedForBatch,
  toggleBatchSelect,
  onDeletePhoto,
  onSelectPhoto,
  onAddFiles,
  onSelectBatch,
  onOpenBatch,
  onDownloadAllZip,
  onDownloadAllIndividual,
  downloadAllDisabled,
  exportProgress,
}: MobileGalleryDrawerProps) {
  const [downloadSheetOpen, setDownloadSheetOpen] = useState(false)
  // Two-tap delete confirmation: first tap arms the button, second tap deletes.
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const pendingResetRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (pendingResetRef.current != null) window.clearTimeout(pendingResetRef.current)
  }, [])

  const handleDeleteTap = (id: string) => {
    if (pendingResetRef.current != null) window.clearTimeout(pendingResetRef.current)
    if (pendingDeleteId === id) {
      setPendingDeleteId(null)
      onDeletePhoto(id)
      return
    }
    setPendingDeleteId(id)
    pendingResetRef.current = window.setTimeout(() => setPendingDeleteId(null), 3000)
  }

  const handleTap = (id: string) => {
    if (batchSelectMode) {
      const photo = photos.find((p) => p.id === id)
      if (!photo || !isBatchProcessablePhoto(photo)) return
      toggleBatchSelect(id)
      return
    }
    onSelectPhoto(id)
    onClose()
  }

  const libraryPhotos = photos.filter((p) => !p.isVideoFrameEdit)
  const imageCount = libraryPhotos.filter(isBatchProcessablePhoto).length
  const skippedMediaCount = libraryPhotos.length - imageCount
  const selectedCount = batchSelectMode
    ? photos.filter((p) => isBatchProcessablePhoto(p) && selectedForBatch.has(p.id)).length
    : 0
  const selectedImageIds = batchSelectMode
    ? photos.filter((p) => isBatchProcessablePhoto(p) && selectedForBatch.has(p.id)).map((p) => p.id)
    : []
  const selectedImageCount = batchSelectMode
    ? selectedImageIds.length
    : 0
  const downloadCount = selectedCount > 0 ? selectedImageCount : imageCount
  const canDownloadAll = Boolean(onDownloadAllZip || onDownloadAllIndividual)
  const downloadBusy = Boolean(exportProgress)

  const downloadFooter = canDownloadAll ? (
    <button
      type="button"
      className="mobile-gallery-download-all"
      onClick={() => setDownloadSheetOpen(true)}
      disabled={downloadAllDisabled || downloadCount === 0 || downloadBusy}
    >
      <Icon name="download" size={16} />
      {downloadBusy
        ? `EXPORTING ${exportProgress!.done}/${exportProgress!.total}…`
        : selectedCount > 0 ? `DOWNLOAD ${selectedImageCount}` : 'DOWNLOAD ALL'}
    </button>
  ) : undefined

  return (
    <>
      <MobileToolDrawer
        open={open}
        onClose={onClose}
        title="LIBRARY"
        variant="gallery"
        footer={downloadFooter}
      >
        <div className="mobile-gallery-inner">
          <div className="mobile-gallery-actions">
            <button className="mobile-gallery-add" type="button" onClick={onAddFiles}>
              ADD FILES
            </button>
            <button
              className={`mobile-gallery-batch${batchSelectMode ? ' active' : ''}`}
              type="button"
              onClick={onOpenBatch}
            >
              BATCH{selectedCount > 0 ? ` (${selectedImageCount})` : ''}
            </button>
          </div>

          <div className="mobile-gallery-meta">
            <span>
              {mediaCounts(photos)}
              {!batchSelectMode && (
                <>
                  {' - '}
                  <button type="button" className="mobile-gallery-select-link" onClick={onSelectBatch}>
                    SELECT
                  </button>
                </>
              )}
            </span>
            <div className="mobile-gallery-view-toggle">
              <button
                type="button"
                className={`mobile-gallery-view-btn${sidebarView === 'grid' ? ' active' : ''}`}
                onClick={() => setSidebarView('grid')}
                aria-label="Grid view"
              >
                <Icon name="grid_view" size={16} />
              </button>
              <button
                type="button"
                className={`mobile-gallery-view-btn${sidebarView === 'list' ? ' active' : ''}`}
                onClick={() => setSidebarView('list')}
                aria-label="List view"
              >
                <Icon name="view_list" size={16} />
              </button>
            </div>
          </div>

          {batchSelectMode && (
            <div className="mobile-batch-count mobile-batch-count--gallery">
              Selected: <strong>{selectedCount}</strong> photos
              {skippedMediaCount > 0 && <span> · Batch is only for photos</span>}
            </div>
          )}

          {sidebarView === 'grid' ? (
            <div className="mobile-gallery-grid">
              {displayedPhotos.map((p) => {
                const canBatchProcess = isBatchProcessablePhoto(p)
                const selected = batchSelectMode ? canBatchProcess && selectedForBatch.has(p.id) : p.id === activePhotoId
                const anonymized = anonymizedPhotoIds.has(p.id)
                return (
                  <div
                    key={p.id}
                    className={`mobile-gallery-item-shell${selected ? ' selected' : ''}${batchSelectMode ? ' selecting' : ''}${batchSelectMode && !canBatchProcess ? ' batch-unavailable' : ''}${anonymized ? ' anonymized' : ''}`}
                  >
                    <button
                      type="button"
                      className="mobile-gallery-item"
                      onClick={() => handleTap(p.id)}
                    >
                      <div className="mobile-gallery-item-thumb">
                        <img src={p.previewUrl} alt="" loading="lazy" />
                        {p.isVideo && <span className="mobile-gallery-video-badge">VIDEO</span>}
                        {p.isAudio && <span className="mobile-gallery-video-badge">AUDIO</span>}
                        {p.isDocument && <span className="mobile-gallery-video-badge">{(p.documentKind ?? 'DOC').toUpperCase()}</span>}
                        {batchSelectMode && canBatchProcess && (
                          <span className={`mobile-gallery-check${selected ? ' checked' : ''}`} aria-hidden="true">
                            {selected ? <Icon name="check" size={14} /> : null}
                          </span>
                        )}
                      </div>
                      <div className="mobile-gallery-item-name">{p.name.split('/').pop()}</div>
                    </button>
                    <button
                      type="button"
                      className={`mobile-gallery-delete${pendingDeleteId === p.id ? ' confirming' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleDeleteTap(p.id) }}
                      aria-label={pendingDeleteId === p.id ? `Tap again to delete ${p.name.split('/').pop()}` : `Delete ${p.name.split('/').pop()}`}
                    >
                      <Icon name={pendingDeleteId === p.id ? 'delete_forever' : 'delete'} size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="mobile-gallery-list">
              {displayedPhotos.map((p) => {
                const canBatchProcess = isBatchProcessablePhoto(p)
                const selected = batchSelectMode ? canBatchProcess && selectedForBatch.has(p.id) : p.id === activePhotoId
                const anonymized = anonymizedPhotoIds.has(p.id)
                return (
                  <div
                    key={p.id}
                    className={`mobile-gallery-list-shell${selected ? ' selected' : ''}${batchSelectMode ? ' selecting' : ''}${batchSelectMode && !canBatchProcess ? ' batch-unavailable' : ''}${anonymized ? ' anonymized' : ''}`}
                  >
                    <button
                      type="button"
                      className="mobile-gallery-list-item"
                      onClick={() => handleTap(p.id)}
                    >
                      <div className="mobile-gallery-list-thumb">
                        <img src={p.previewUrl} alt="" loading="lazy" />
                        {batchSelectMode && canBatchProcess && (
                          <span className={`mobile-gallery-check${selected ? ' checked' : ''}`} aria-hidden="true">
                            {selected ? <Icon name="check" size={14} /> : null}
                          </span>
                        )}
                      </div>
                      <span className="mobile-gallery-list-name">{p.name.split('/').pop()}</span>
                    </button>
                    <button
                      type="button"
                      className={`mobile-gallery-delete mobile-gallery-delete--list${pendingDeleteId === p.id ? ' confirming' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleDeleteTap(p.id) }}
                      aria-label={pendingDeleteId === p.id ? `Tap again to delete ${p.name.split('/').pop()}` : `Delete ${p.name.split('/').pop()}`}
                    >
                      <Icon name={pendingDeleteId === p.id ? 'delete_forever' : 'delete'} size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </MobileToolDrawer>

      <MobileToolDrawer
        open={downloadSheetOpen}
        onClose={() => setDownloadSheetOpen(false)}
        title="Download all"
        variant="tool"
        elevated
      >
        <div className="mobile-gallery-download-options">
          <p className="mobile-gallery-download-hint">
            Choose how to save {selectedCount > 0 ? selectedImageCount : imageCount} item{(selectedCount > 0 ? selectedImageCount : imageCount) !== 1 ? 's' : ''}.
          </p>
          {onDownloadAllZip && (
            <button
              type="button"
              className="mobile-gallery-download-option"
              disabled={downloadAllDisabled || downloadBusy || (selectedCount > 0 && selectedImageCount === 0)}
              onClick={() => {
                setDownloadSheetOpen(false)
                onDownloadAllZip(selectedCount > 0 ? selectedImageIds : undefined)
              }}
            >
              <Icon name="folder_zip" size={20} />
              <span>
                <strong>ZIP archive</strong>
                <small>Single .zip file</small>
              </span>
            </button>
          )}
          {onDownloadAllIndividual && (
            <button
              type="button"
              className="mobile-gallery-download-option"
              disabled={downloadAllDisabled || downloadBusy || (selectedCount > 0 && selectedImageCount === 0)}
              onClick={() => {
                setDownloadSheetOpen(false)
                onDownloadAllIndividual(selectedCount > 0 ? selectedImageIds : undefined)
              }}
            >
              <Icon name="photo_library" size={20} />
              <span>
                <strong>Individual files</strong>
                <small>One download per photo</small>
              </span>
            </button>
          )}
        </div>
      </MobileToolDrawer>
    </>
  )
}
