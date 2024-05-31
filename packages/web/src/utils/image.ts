import { FileWithPath } from '@mantine/dropzone'

export const fileImageToBase64 = async (file: FileWithPath): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
