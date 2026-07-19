import type { DocumentPickerAsset } from "expo-document-picker"

/**
 * Appends a picked document to FormData in a cross-platform way.
 *
 * On native, React Native's FormData accepts the `{ uri, name, type }` shape.
 * On web, that object is stringified to "[object Object]"; the browser needs a
 * real File/Blob instead, which expo-document-picker exposes on `asset.file`.
 */
export const appendPickedFile = (
  formData: FormData,
  asset: DocumentPickerAsset,
  fallbackType: string,
) => {
  const webFile = (asset as { file?: File }).file
  if (webFile) {
    formData.append("file", webFile, asset.name)
    return
  }

  formData.append("file", {
    uri: asset.uri,
    name: asset.name,
    type: asset.mimeType || fallbackType,
  } as unknown as Blob)
}
