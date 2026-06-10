import type { RefObject } from 'react'
import { Icon } from './Icon'

interface PickerChoiceDialogProps {
  dialogRef: RefObject<HTMLDivElement>
  folderBtnRef: RefObject<HTMLButtonElement>
  busy: boolean
  onClose: () => void
  onOpenFolder: () => void
  onOpenFiles: () => void
}

/**
 * "Add media" dialog letting the user pick individual files or open a folder.
 * The focus-trap effect lives in App.tsx and reuses the passed refs.
 */
export function PickerChoiceDialog({
  dialogRef, folderBtnRef, busy, onClose, onOpenFolder, onOpenFiles,
}: PickerChoiceDialogProps) {
  return (
    <div className="picker-choice-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className="picker-choice-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-choice-title"
        data-dialog-focus-trap="true"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="about-modal-close" type="button" onClick={onClose} aria-label="Close">
          <Icon name="close" size={18} />
        </button>
        <h2 id="picker-choice-title" className="picker-choice-title">Add media</h2>
        <p className="picker-choice-desc">
          Choose individual files or open a folder with disk write access for overwrite/export workflows.
        </p>
        <div className="picker-choice-actions">
          <button
            ref={folderBtnRef}
            className="btn btn-primary picker-choice-primary"
            type="button"
            disabled={busy}
            onClick={onOpenFolder}
          >
            <Icon name="folder_open" size={15} /> Open folder
          </button>
          <button
            className="btn picker-choice-secondary"
            type="button"
            disabled={busy}
            onClick={onOpenFiles}
          >
            <Icon name="upload_file" size={15} /> Select files
          </button>
        </div>
      </div>
    </div>
  )
}
