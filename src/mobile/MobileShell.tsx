import { useCallback, useEffect, type ReactNode } from 'react'
import { useMobileBindings } from './useMobileBindings'
import { MobileBatchDrawer } from './drawers/MobileBatchDrawer'
import { MobileGalleryDrawer } from './drawers/MobileGalleryDrawer'
import { MobileBottomToolbar } from './MobileBottomToolbar'
import { MobileEditorLayout } from './MobileEditorLayout'
import { MobileEditorToolbar } from './MobileEditorToolbar'
import { MobileHomeDefault } from './MobileHomeDefault'
import { MobileLiveMode } from './MobileLiveMode'
import { MobileToolDrawers } from './MobileToolDrawers'
import { MobileTopBar } from './MobileTopBar'
import './mobile.css'
import './mobile-redesign.css'
import './mobile-landscape.css'

interface MobileShellProps {
  fmtBytes: (n: number) => string
  setSidebarView: (v: 'grid' | 'list') => void
  sidebarView: 'grid' | 'list'
  toggleBatchSelect: (id: string) => void
  batchProcessCount: number
  embedEditor?: boolean
  documentViewer?: ReactNode
  audioViewer?: ReactNode
}

export function MobileShell({
  fmtBytes,
  setSidebarView,
  sidebarView,
  toggleBatchSelect,
  batchProcessCount,
  embedEditor = false,
  documentViewer,
  audioViewer,
}: MobileShellProps) {
  const b = useMobileBindings()
  const showHome = b.photos.length === 0 && b.mobileMode !== 'live'
  const showLive = b.mobileMode === 'live'
  const selectedProcessableCount = b.photos.filter((p) => b.selectedForBatch.has(p.id) && !p.isVideo).length

  // Auto-sync mobileMode with library state. Intentionally overrides stale modes
  // (e.g. home after addRecords, editor/video after activePhoto type change).
  useEffect(() => {
    if (b.photos.length > 0 && b.mobileMode === 'home') {
      b.setMobileMode(b.activePhoto?.isVideo ? 'video' : b.activePhoto?.isAudio ? 'audio' : b.activePhoto?.isDocument ? 'document' : 'editor')
    }
    if (b.photos.length === 0 && b.mobileMode !== 'live') {
      b.setMobileMode('home')
    }
  }, [b.photos.length, b.mobileMode, b.activePhoto?.isVideo, b.activePhoto?.isAudio, b.activePhoto?.isDocument, b.setMobileMode])

  useEffect(() => {
    const p = b.activePhoto
    if (!p) return
    const isImage = !p.isVideo && !p.isAudio && !p.isDocument
    if (p.isVideo && b.mobileMode === 'editor') {
      b.setMobileMode('video')
    } else if (p.isAudio && (b.mobileMode === 'editor' || b.mobileMode === 'video')) {
      b.setMobileMode('audio')
    } else if (p.isDocument && b.mobileMode !== 'document' && b.mobileMode !== 'live') {
      b.setMobileMode('document')
    } else if (isImage && (b.mobileMode === 'video' || b.mobileMode === 'audio' || b.mobileMode === 'document')) {
      b.setMobileMode('editor')
    }
  }, [b.activePhoto?.id, b.activePhoto?.isVideo, b.activePhoto?.isAudio, b.activePhoto?.isDocument, b.mobileMode, b.setMobileMode])

  const openGallery = useCallback(() => {
    b.setGalleryBatchSelect(false)
    b.setMobilePanel('gallery')
  }, [b.setGalleryBatchSelect, b.setMobilePanel])

  const handleCaptureSaved = useCallback((blob: Blob, type: 'photo' | 'video'): string | null => {
    const id = b.addLiveMediaToLibrary(blob, { stayInLive: true })
    if (type === 'video') {
      b.showMobileToast('Video saved to Library', { label: 'Open', onClick: openGallery })
    }
    return id
  }, [b.addLiveMediaToLibrary, b.showMobileToast, openGallery])

  const galleryDrawer = (
    <MobileGalleryDrawer
      open={b.mobilePanel === 'gallery'}
      onClose={() => b.setMobilePanel(null)}
      photos={b.photos}
      displayedPhotos={b.displayedPhotos}
      anonymizedPhotoIds={b.anonymizedPhotoIds}
      activePhotoId={b.activePhotoId}
      sidebarView={sidebarView}
      setSidebarView={setSidebarView}
      batchSelectMode={b.galleryBatchSelect}
      selectedForBatch={b.selectedForBatch}
      toggleBatchSelect={toggleBatchSelect}
      onDeletePhoto={b.deletePhoto}
      onSelectPhoto={(id) => {
        b.selectPhoto(id)
        const photo = b.photos.find((p) => p.id === id)
        b.setMobileMode(photo?.isVideo ? 'video' : photo?.isAudio ? 'audio' : photo?.isDocument ? 'document' : 'editor')
      }}
      onAddFiles={b.openUnifiedPicker}
      onSelectBatch={() => {
        b.setSelectedForBatch(new Set())
        b.setGalleryBatchSelect(true)
      }}
      onOpenBatch={() => {
        b.setMobilePanelReturnTo('gallery')
        b.setMobilePanel('batch')
      }}
      onDownloadAllZip={b.exportAllLibraryZip}
      onDownloadAllIndividual={b.exportAllLibraryIndividual}
      downloadAllDisabled={b.batch.isExporting || b.isBusy}
      exportProgress={b.exportLibraryProgress}
    />
  )

  const batchDrawer = (
    <MobileBatchDrawer
      open={b.mobilePanel === 'batch'}
      onClose={() => {
        b.setMobilePanel(null)
        b.setMobilePanelReturnTo(null)
      }}
      onBack={b.mobilePanelReturnTo === 'gallery' ? () => {
        b.setMobilePanel('gallery')
        b.setMobilePanelReturnTo(null)
      } : undefined}
      processCount={b.galleryBatchSelect ? selectedProcessableCount : batchProcessCount}
      onProcess={b.runNormalizeBatch}
      isNormalizing={b.batch.isNormalizing}
      batch={b.batch}
      toggleBatchTask={b.toggleBatchTask}
      toggleExpandBatchTask={b.toggleExpandBatchTask}
      updateNormalizeSetting={b.updateNormalizeSetting}
      setNormalizeSummary={b.setNormalizeSummary}
      exportNormalizeZip={b.exportNormalizeZip}
      selectPhoto={b.selectPhoto}
      colorAdj={b.batch.colorAdj}
      setColorPreset={b.setColorPreset}
      setColorAdj={b.setColorAdj}
      applyColorAdjToActive={b.applyColorAdjToActive}
      activePhoto={b.activePhoto}
      setNotice={b.setNotice}
      setIsNormalizeCropPicking={b.setIsNormalizeCropPicking}
      setNormalizeCropDraft={b.setNormalizeCropDraft}
      isNormalizeCropPicking={b.isNormalizeCropPicking}
      activeNormalizeCrop={b.activeNormalizeCrop}
      applyTemplateFromCurrentCrop={b.applyTemplateFromCurrentCrop}
      detectFrameOnActivePhoto={b.detectFrameOnActivePhoto}
      detectContentAwareCropOnActivePhoto={b.detectContentAwareCropOnActivePhoto}
      pointerSessionRef={b.pointerSessionRef}
      isBusy={b.isBusy}
      fmtBytes={fmtBytes}
    />
  )

  if (showLive) {
    return (
      <div className="mobile-shell mobile-shell-live">
        <MobileLiveMode
          onOpenLibrary={openGallery}
          onOpenCapturedPhoto={b.openPhotoInEditor}
          onExitToWorkspace={() => b.exitLiveToWorkspace()}
          onFallbackUpload={b.openUnifiedPicker}
          onCaptureSaved={handleCaptureSaved}
        />
        {galleryDrawer}
        {batchDrawer}
      </div>
    )
  }

  if (showHome) {
    return (
      <div className="mobile-shell">
        <MobileHomeDefault b={b} />
      </div>
    )
  }

  // Documents have their own viewer + redaction sidebar (rendered in the
  // workspace); the mobile shell only provides the top chrome and drawers — no
  // image editing toolbar or tool drawers.
  if (embedEditor && b.activePhoto?.isDocument) {
    return (
      <MobileEditorLayout
        chrome={(
          <MobileTopBar
            onAbout={() => b.setAboutOpen(true)}
            showGalleryButton
            onOpenGallery={openGallery}
          />
        )}
        bottom={null}
        drawers={<>{galleryDrawer}{batchDrawer}</>}
      >
        <div className="mobile-doc-viewer">{documentViewer}</div>
      </MobileEditorLayout>
    )
  }

  // Voice mode: render the audio viewer on its own (no image editing chrome).
  if (embedEditor && b.activePhoto?.isAudio) {
    return (
      <MobileEditorLayout
        chrome={(
          <MobileTopBar
            onAbout={() => b.setAboutOpen(true)}
            showGalleryButton
            onOpenGallery={openGallery}
            showLiveButton
            onLiveMode={() => {
              if (b.detectorLoading) { b.showMobileToast('Loading face detector…'); return }
              b.setMobileMode('live'); b.setMobilePanel(null)
            }}
          />
        )}
        bottom={null}
        drawers={<>{galleryDrawer}{batchDrawer}</>}
      >
        <div className="mobile-doc-viewer mobile-audio-viewer">{audioViewer}</div>
      </MobileEditorLayout>
    )
  }

  if (embedEditor) {
    return (
      <MobileEditorLayout
        chrome={(
          <>
            <MobileTopBar
              onAbout={() => b.setAboutOpen(true)}
              showGalleryButton
              onOpenGallery={openGallery}
              showLiveButton
              onLiveMode={() => {
                if (b.detectorLoading) { b.showMobileToast('Loading face detector…'); return }
                b.setMobileMode('live'); b.setMobilePanel(null)
              }}
            />
            <MobileEditorToolbar b={b} />
          </>
        )}
        bottom={<MobileBottomToolbar b={b} />}
        drawers={(
          <>
            {galleryDrawer}
            {batchDrawer}
            <MobileToolDrawers b={b} />
          </>
        )}
      />
    )
  }

  return null
}
