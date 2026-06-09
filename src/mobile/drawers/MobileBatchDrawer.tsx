import { BatchTaskSections, type BatchTaskSectionsProps } from '../../components/batch/BatchTaskSections'
import { MobileToolDrawer } from '../MobileToolDrawer'

interface MobileBatchDrawerProps extends BatchTaskSectionsProps {
  open: boolean
  onClose: () => void
  processCount: number
  onProcess: () => void
  isNormalizing: boolean
}

export function MobileBatchDrawer({
  open,
  onClose,
  processCount,
  onProcess,
  isNormalizing,
  ...sectionsProps
}: MobileBatchDrawerProps) {
  return (
    <MobileToolDrawer
      open={open}
      onClose={onClose}
      title="Batch tasks"
      variant="batch"
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
