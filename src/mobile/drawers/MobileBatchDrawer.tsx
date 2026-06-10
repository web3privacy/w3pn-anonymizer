import { BatchTaskSections, type BatchTaskSectionsProps } from '../../components/batch/BatchTaskSections'
import { Icon } from '../../components/Icon'
import { MobileToolDrawer } from '../MobileToolDrawer'

interface MobileBatchDrawerProps extends BatchTaskSectionsProps {
  open: boolean
  onClose: () => void
  onBack?: () => void
  processCount: number
  onProcess: () => void
  isNormalizing: boolean
}

export function MobileBatchDrawer({
  open,
  onClose,
  onBack,
  processCount,
  onProcess,
  isNormalizing,
  ...sectionsProps
}: MobileBatchDrawerProps) {
  const header = onBack ? (
    <div className="mobile-drawer-header mobile-drawer-header--with-back">
      <button type="button" className="mobile-drawer-back" onClick={onBack} aria-label="Back to library">
        <Icon name="arrow_back" size={20} />
      </button>
      <h2>Batch tasks</h2>
      <button type="button" className="mobile-drawer-close" onClick={onClose} aria-label="Close">
        <Icon name="close" size={18} />
      </button>
    </div>
  ) : undefined

  return (
    <MobileToolDrawer
      open={open}
      onClose={onClose}
      title="Batch tasks"
      variant="batch"
      header={header}
      footer={
        <button
          className="mobile-batch-process-btn"
          type="button"
          onClick={onProcess}
          disabled={isNormalizing || processCount === 0}
        >
          PROCESS {processCount} FILE{processCount !== 1 ? 'S' : ''}
        </button>
      }
    >
      <div className="mobile-batch-count">
        Selected: <strong>{sectionsProps.batch.selectedForBatch.size}</strong> · Will process: <strong>{processCount}</strong>
      </div>
      <BatchTaskSections {...sectionsProps} />
    </MobileToolDrawer>
  )
}
