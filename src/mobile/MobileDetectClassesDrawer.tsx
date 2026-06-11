import { DetectionClassListPanel } from '../components/tool-panels/DetectionClassListPanel'
import type { AppMobileBindings } from './bindings'
import { MobileToolDrawer } from './MobileToolDrawer'

interface MobileDetectClassesDrawerProps {
  b: AppMobileBindings
}

export function MobileDetectClassesDrawer({ b }: MobileDetectClassesDrawerProps) {
  const open = b.mobilePanel === 'tool-detect-classes'
  // Step back to the face drawer rather than closing everything.
  const close = () => b.setMobilePanel('tool-face')

  const setAll = (classNames: string[], enabled: boolean) => {
    b.setEnabledClasses((cur) => {
      if (enabled) return Array.from(new Set([...cur, ...classNames]))
      const remove = new Set(classNames)
      return cur.filter((c) => !remove.has(c))
    })
  }

  return (
    <MobileToolDrawer open={open} onClose={close} title="ALL CLASSES" variant="tool" elevated>
      <DetectionClassListPanel
        modelStatus={b.modelStatus}
        enabledClasses={b.enabledClasses}
        onToggleClass={b.toggleDetectionClass}
        onSetAll={setAll}
      />
    </MobileToolDrawer>
  )
}
