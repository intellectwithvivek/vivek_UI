import { FileUpload } from '@the_viveksingh/vivek-ui'

export default function FileUploadPreview({ name }: { name: string }) {
  if (name === 'constrained') {
    return (
      <FileUpload
        accept="image/png,image/jpeg"
        maxSize={2 * 1024 * 1024}
        maxFiles={3}
        multiple
        size="sm"
        label="Screenshots"
        hint="PNG or JPEG, up to 2 MB each, 3 files maximum."
      />
    )
  }
  return (
    <FileUpload
      multiple
      label="Attachments"
      hint="Drop files here, or click to browse. Keyboard users can activate the drop zone with Enter."
    />
  )
}
