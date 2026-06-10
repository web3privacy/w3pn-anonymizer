import { useCallback, useEffect } from 'react'
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
}

export function MobileShell({
  fmtBytes,
  setSidebarView,
  sidebarView,
  toggleBatchSelect,
  batchProcessCount,
  embedEditor = false,
}: MobileShellProps) {
  const b = useMobileBindings()
  const showHome = b.photos.length === 0 && b.mobileMode !== 'live'
  const showLive = b.mobileMode === 'live'
  const selectedProcessableCount = b.photos.filter((p) => b.selectedForBatch.has(p.id) && !p.isVideo).length

  // Auto-sync mobileMode with library state. Intentionally overrides stale modes
  // (e.g. home after addRecords, editor/video after activePhoto type change).
  useEffect(() => {
    if (b.photos.length > 0 && b.mobileMode === 'home') {
      b.setMobileMode(b.activePhoto?.isVideo ? 'video' : 'editor')
    }
    if (b.photos.length === 0 && b.mobileMode !== 'live') {
      b.setMobileMode('home')
    }
  }, [b.photos.length, b.mobileMode, b.activePhoto?.isVideo, b.setMobileMode])

  useEffect(() => {
    if (b.activePhoto?.isVideo && b.mobileMode === 'editor') {
      b.setMobileMode('video')
    } else if (b.activePhoto && !b.activePhoto.isVideo && b.mobileMode === 'video') {
      b.setMobileMode('editor')
    }
  }, [b.activePhoto?.id, b.activePhoto?.isVideo, b.mobileMode, b.setMobileMode])

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
      activePhotoId={b.activePhotoId}
      sidebarView={sidebarView}
      setSidebarView={setSidebarView}
      batchSelectMode={b.galleryBatchSelect}
      selectedForBatch={b.selectedForBatch}
      toggleBatchSelect={toggleBatchSelect}
      onDeletePhoto={b.deletePhoto}
      onSelectPhoto={(id) => {
        b.selectPhoto(id)
        b.setMobileMode('editor')
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
