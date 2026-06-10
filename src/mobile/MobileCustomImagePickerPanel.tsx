import { CustomImagePickerPanel } from '../components/CustomImagePickerPanel'
import type { AppMobileBindings } from './bindings'
import type { CustomImageSource } from '../types'

interface MobileCustomImagePickerPanelProps {
  b: AppMobileBindings
}

export function MobileCustomImagePickerPanel({ b }: MobileCustomImagePickerPanelProps) {
  const onSelectSource = (source: CustomImageSource) => {
    b.setSelectedEffect('custom-image')
    void b.loadCustomImagePreset(source)
  }

  return (
    <CustomImagePickerPanel
      customImageRandom={b.customImageRandom}
      customImageSource={b.customImageSource}
      customImageAssets={b.customImageAssets}
      selectedCustomImageId={b.selectedCustomImageId}
      loading={b.customImagePresetLoading}
      onToggleRandom={b.onToggleCustomRandom}
      onPickImage={b.onPickCustomImage}
      onSelectSource={onSelectSource}
      onUpload={b.openCustomImagePicker}
      sourceMenuVariant="sheet"
    />
  )
}
