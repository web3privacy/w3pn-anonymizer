import type { Dispatch, SetStateAction } from 'react'
import { Icon } from '../components/Icon'
import { isBatchProcessablePhoto } from '../lib/batch-normalize'
import type { PhotoItem } from '../types'

interface EditorSidebarProps {
  photos: PhotoItem[]
  displayedPhotos: PhotoItem[]
  activePhotoId: string | null
  dirtyByPhoto: Record<string, boolean>
  anonymizedPhotoIds: Set<string>
  sidebarWidth: number
  sidebarView: 'grid' | 'list'
  setSidebarView: (v: 'grid' | 'list') => void
  batchPanelOpen: boolean
  setBatchPanelOpen: Dispatch<SetStateAction<boolean>>
  busy: boolean
  onAddFiles: () => void
  folderTree: Map<string, string[]>
  currentFolderPrefix: string
  setCurrentFolderPrefix: (p: string) => void
  folderTreeOpen: boolean
  setFolderTreeOpen: Dispatch<SetStateAction<boolean>>
  selectedForBatch: Set<string>
  setSelectedForBatch: Dispatch<SetStateAction<Set<string>>>
  selectPhoto: (id: string) => void
  selectAllForBatch: () => void
  deselectAllForBatch: () => void
  toggleBatchSelect: (id: string) => void
  rotatePhoto: (id: string) => void
  deletePhoto: (id: string) => void
  hasMorePhotosToRender: boolean
  setPhotoListLimit: Dispatch<SetStateAction<number>>
}

/** Desktop left sidebar: add/batch controls, folder tree, and photo list. */
export function EditorSidebar(props: EditorSidebarProps) {
  const {
    photos, displayedPhotos, activePhotoId, dirtyByPhoto, anonymizedPhotoIds, sidebarWidth, sidebarView, setSidebarView,
    batchPanelOpen, setBatchPanelOpen, busy, onAddFiles, folderTree, currentFolderPrefix, setCurrentFolderPrefix,
    folderTreeOpen, setFolderTreeOpen, selectedForBatch, setSelectedForBatch, selectPhoto, selectAllForBatch,
    deselectAllForBatch, toggleBatchSelect, rotatePhoto, deletePhoto, hasMorePhotosToRender, setPhotoListLimit,
  } = props
  const processablePhotos = photos.filter(isBatchProcessablePhoto)
  const processablePhotoIds = new Set(processablePhotos.map((photo) => photo.id))
  const selectedProcessableCount = processablePhotos.filter((photo) => selectedForBatch.has(photo.id)).length
  const skippedMediaCount = photos.length - processablePhotos.length
  const toggleBatchPanel = () => {
    const opening = !batchPanelOpen
    if (opening) setSelectedForBatch(new Set(processablePhotoIds))
    setBatchPanelOpen(opening)
  }

  return (
    <aside
      className="sidebar"
      style={{
        width: photos.length === 1 && !batchPanelOpen ? 0 : sidebarWidth,
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width 0.18s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Photos loaded — compact top bar + list */}
      <div className="sidebar-topbar">
        <button className="sidebar-add-btn" type="button" onClick={onAddFiles} disabled={busy} title="Add more photos or open a folder">
          + Add files
        </button>
        <button
          className={`sidebar-batch-btn${batchPanelOpen ? ' active' : ''}`}
          type="button"
          onClick={toggleBatchPanel}
          title="Batch processing settings"
        >
          Batch
        </button>
      </div>

      {/* Hierarchical folder tree (when photos have subfolders) */}
      {folderTree.size > 0 && (() => {
        // Compute child folders at currentFolderPrefix depth
        const prefix = currentFolderPrefix ? currentFolderPrefix + '/' : ''
        const childFolderNames = new Set<string>()
        folderTree.forEach((_, folder) => {
          if (folder.startsWith(prefix)) {
            const rest = folder.slice(prefix.length)
            const nextSeg = rest.split('/')[0]
            if (nextSeg) childFolderNames.add(nextSeg)
          }
        })
        return (
          <div className="folder-tree">
            <button
              className="folder-tree-toggle"
              type="button"
              onClick={() => setFolderTreeOpen((v) => !v)}
            >
              <Icon name={folderTreeOpen ? 'folder_open' : 'folder'} size={13} />
              {currentFolderPrefix ? currentFolderPrefix.split('/').pop() : 'Folders'}
              <span style={{ marginLeft: 'auto', opacity: 0.5 }}>{folderTreeOpen ? '▲' : '▼'}</span>
            </button>
            {folderTreeOpen && (
              <>
                {/* Up button when inside a subfolder */}
                {currentFolderPrefix && (
                  <button
                    className="folder-node folder-node-up"
                    type="button"
                    onClick={() => setCurrentFolderPrefix(currentFolderPrefix.includes('/') ? currentFolderPrefix.slice(0, currentFolderPrefix.lastIndexOf('/')) : '')}
                  >
                    <span className="fn-icon"><Icon name="arrow_upward" size={14} /></span>
                    <span className="fn-name">.. (up)</span>
                  </button>
                )}
                {Array.from(childFolderNames).sort().map((seg) => {
                  const fullPath = prefix + seg
                  // Collect all photo ids under this folder (recursively)
                  const ids: string[] = []
                  folderTree.forEach((photoIds, folder) => {
                    if (folder === fullPath || folder.startsWith(fullPath + '/')) ids.push(...photoIds)
                  })
                  // Check if has subfolders
                  const hasSubFolders = Array.from(folderTree.keys()).some((f) => f.startsWith(fullPath + '/'))
                  return (
                    <button
                      key={fullPath}
                      className="folder-node"
                      type="button"
                      title={`Show ${ids.length} item${ids.length === 1 ? '' : 's'} in ${seg}`}
                      onClick={() => {
                        // Always scope the library to the picked folder; in batch
                        // mode also add its processable photos to the selection.
                        if (batchPanelOpen) {
                          setSelectedForBatch((cur) => { const next = new Set(cur); ids.filter((id) => processablePhotoIds.has(id)).forEach((id) => next.add(id)); return next })
                        }
                        setCurrentFolderPrefix(fullPath)
                      }}
                    >
                      <span className="fn-icon"><Icon name={hasSubFolders ? 'folder' : 'folder_open'} size={14} /></span>
                      <span className="fn-name">{seg}</span>
                      <span className="fn-count">{ids.length}</span>
                    </button>
                  )
                })}
              </>
            )}
          </div>
        )
      })()}

      <div className="sidebar-head">
        <span className="sidebar-head-label">
          {batchPanelOpen
            ? `${selectedProcessableCount}/${processablePhotos.length} photos`
            : `${photos.length} photo${photos.length === 1 ? '' : 's'}`}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {batchPanelOpen && photos.length > 0 && (
            <>
              <button className="icon-btn" type="button" onClick={selectAllForBatch} title="Select all photos" aria-label="Select all photos"><Icon name="done_all" size={14} /></button>
              <button className="icon-btn" type="button" onClick={deselectAllForBatch} title="Deselect all photos" aria-label="Deselect all photos"><Icon name="remove_done" size={14} /></button>
            </>
          )}
          <button className={`icon-btn ${sidebarView === 'grid' ? 'active' : ''}`} type="button" onClick={() => setSidebarView('grid')} title="Thumbnails" aria-label="Thumbnails"><Icon name="grid_view" size={14} /></button>
          <button className={`icon-btn ${sidebarView === 'list' ? 'active' : ''}`} type="button" onClick={() => setSidebarView('list')} title="List" aria-label="List"><Icon name="list" size={14} /></button>
        </div>
      </div>

      {batchPanelOpen && (
        <div className="sidebar-batch-info">
          Batch is only for photos. {selectedProcessableCount}/{processablePhotos.length} selected
          {skippedMediaCount > 0 ? `; ${skippedMediaCount} other file${skippedMediaCount === 1 ? '' : 's'} skipped.` : '.'}
        </div>
      )}

      <div className={`photo-list ${sidebarView === 'grid' ? 'grid-mode' : ''}`}>
        {displayedPhotos.map((photo) => {
          const isEdited = photo.edited || dirtyByPhoto[photo.id]
          const isAnonymized = anonymizedPhotoIds.has(photo.id)
          const canBatchProcess = isBatchProcessablePhoto(photo)
          const isBatchSelected = batchPanelOpen && canBatchProcess && selectedForBatch.has(photo.id)
          return (
            <div
              key={photo.id}
              className={`photo-item ${photo.id === activePhotoId ? 'active' : ''} ${isBatchSelected ? 'batch-selected' : ''}${batchPanelOpen && !canBatchProcess ? ' batch-unavailable' : ''}${isAnonymized ? ' anonymized' : ''}`}
              onClick={() => selectPhoto(photo.id)}
              title={photo.name}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && selectPhoto(photo.id)}
            >
              {batchPanelOpen && (
                <div
                  className={`batch-checkbox${canBatchProcess ? '' : ' disabled'}`}
                  onClick={(e) => { e.stopPropagation(); if (canBatchProcess) toggleBatchSelect(photo.id) }}
                  title={canBatchProcess ? (selectedForBatch.has(photo.id) ? 'Remove from batch' : 'Add to batch') : 'Batch supports photos only'}
                >
                  {canBatchProcess ? (selectedForBatch.has(photo.id) ? '☑' : '☐') : '-'}
                </div>
              )}
              {isEdited && (
                <div className="photo-edited-badge" title="Edited">✓</div>
              )}
              {photo.isVideo && (
                <div className="photo-video-badge" title="Video">▶</div>
              )}
              {photo.isDocument && (
                <div className="photo-video-badge" title="Document">{(photo.documentKind ?? 'doc').toUpperCase()}</div>
              )}
              {photo.isDocument || photo.isAudio ? (
                <div className={`photo-item-media-placeholder${sidebarView === 'grid' ? '' : ' photo-item-thumb'}`}>
                  <Icon name={photo.isDocument ? 'description' : 'graphic_eq'} size={sidebarView === 'grid' ? 30 : 20} />
                </div>
              ) : sidebarView === 'grid' ? (
                <div className="photo-item-grid-thumb">
                  <img src={photo.previewUrl} alt={photo.name} loading="lazy" />
                </div>
              ) : (
                <img
                  src={photo.previewUrl}
                  alt={photo.name}
                  loading="lazy"
                  className="photo-item-thumb"
                />
              )}
              <div className="photo-item-info">
                <span className="photo-item-name">{photo.name.split('/').pop()}</span>
                <span className="photo-item-meta">
                  {(() => {
                    const parts = photo.name.split('/')
                    return parts.length > 1 ? <span className="photo-item-path" title={photo.name}>{parts.slice(0, -1).join('/')}/</span> : null
                  })()}
                </span>
              </div>
              {/* Hover action buttons */}
              <div className="photo-item-actions" onClick={(e) => e.stopPropagation()}>
                {!photo.isDocument && !photo.isAudio && (
                  <button
                    className="photo-item-action-btn"
                    type="button"
                    title="Rotate 90°"
                    aria-label="Rotate 90°"
                    onClick={(e) => { e.stopPropagation(); rotatePhoto(photo.id) }}
                  >
                    <Icon name="rotate_90_degrees_cw" size={13} />
                  </button>
                )}
                <button
                  className="photo-item-action-btn photo-item-action-btn--danger"
                  type="button"
                  title="Remove from list"
                  aria-label="Remove from list"
                  onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id) }}
                >
                  <Icon name="delete" size={13} />
                </button>
              </div>
            </div>
          )
        })}
        {hasMorePhotosToRender && (
          <button type="button" className="load-more-btn" onClick={() => setPhotoListLimit((cur) => Math.min(photos.length, cur + 250))}>
            + {photos.length - displayedPhotos.length} more
          </button>
        )}
      </div>

    </aside>
  )
}
