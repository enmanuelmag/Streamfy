import { useForm, zodResolver } from '@mantine/form'
import { Modal, Group, Text, rem, Button, Switch, NumberInput } from '@mantine/core'
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react'
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone'
import { type PredictionBingoType, PredictionBingoSchema } from '@global/types/src/discord'
import Input from '@components/shared/Input'
import { useDisclosure } from '@mantine/hooks'
import { fileImageToBase64 } from '@src/utils/image'
import { notifications } from '@mantine/notifications'
import { Logger } from '@global/utils'
import React from 'react'

type PredictionModalProps = {
  opened: boolean
  predEdit?: (PredictionBingoType & { index: number }) | null
  onCreate: (values: PredictionBingoType & { index?: number }) => void
  onClose: () => void
}

const HEIGHT_DROPZONE = 100

const PredictionModal = (props: PredictionModalProps) => {
  const { opened, onClose, predEdit, onCreate } = props

  const [loadingFile, handlerLoading] = useDisclosure()

  const [hasCounterCond, handleCounterCondition] = useDisclosure()

  const form = useForm<PredictionBingoType>({
    validate: zodResolver(PredictionBingoSchema),
    initialValues: {
      title: predEdit?.title || '',
      description: predEdit?.description || '',
      image: predEdit?.image || '',
      condition: predEdit?.condition || {},
    },
  })

  React.useEffect(() => {
    form.setValues({
      title: predEdit?.title || '',
      description: predEdit?.description || '',
      image: predEdit?.image || '',
      condition: predEdit?.condition || {},
    })

    if (predEdit?.condition?.targetCounter) {
      handleCounterCondition.open()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predEdit])

  return (
    <Modal centered opened={opened} size="lg" title="Predicción" onClose={onClose}>
      <form
        onSubmit={form.onSubmit((pred) => {
          if (!form.isValid()) return
          onCreate({ ...pred, index: predEdit?.index })
          form.reset()
        })}
      >
        <Input
          component="textInput"
          inputsProps={form.getInputProps('title')}
          label="Título"
          name="title"
          placeholder="Escribe el título de la predicción"
        />
        <Input
          component="textInput"
          inputsProps={form.getInputProps('description')}
          label="Descripción"
          name="description"
          placeholder="Para que ni Baity o chat digan TONGO, escribe DETALLADAMENTE la predicción aquí"
        />

        <Text className="!cd-mb-1" mt={10} size="sm">
          Imagen (opcional)
        </Text>
        <Dropzone
          accept={IMAGE_MIME_TYPE}
          className="!cd-mb-4"
          loading={loadingFile}
          maxFiles={1}
          maxSize={5 * 1024 ** 2}
          onDrop={([file]) => {
            handlerLoading.open()
            fileImageToBase64(file)
              .then((base64) => {
                form.setFieldValue('image', base64)
                handlerLoading.close()
              })
              .catch((error) => {
                Logger.error('Error loading image', error)
                handlerLoading.close()
                notifications.show({
                  color: 'red',
                  title: 'Error',
                  message: 'Ocurrió un error al cargar la imagen',
                })
              })
          }}
          onReject={(files) => console.log('rejected files', files)}
        >
          <Group gap="xl" h={HEIGHT_DROPZONE} justify="center" style={{ pointerEvents: 'none' }}>
            <Dropzone.Accept>
              <IconUpload
                stroke={1.5}
                style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
              />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX
                stroke={1.5}
                style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
              />
            </Dropzone.Reject>

            {!form.values.image && (
              <React.Fragment>
                <Dropzone.Idle>
                  <IconPhoto
                    stroke={1.5}
                    style={{
                      width: rem(52),
                      height: rem(52),
                      color: 'var(--mantine-color-dimmed)',
                    }}
                  />
                </Dropzone.Idle>
                <div>
                  <Text inline size="xl">
                    Arrastra y suelta una imagen aquí
                  </Text>
                  <Text inline c="dimmed" mt={7} size="sm">
                    No se permiten archivos mayores a 5MB
                  </Text>
                </div>
              </React.Fragment>
            )}
            {form.values.image && (
              <img
                alt="preview"
                className="cd-w-[100%] cd-h-[100%] cd-object-contain"
                src={form.values.image}
              />
            )}
          </Group>
        </Dropzone>

        <Switch
          checked={hasCounterCond}
          className="!cd-mb-2 !cd-mt-8"
          label="Predicción con contador objetivo"
          onChange={() => {
            handleCounterCondition.toggle()
            form.setFieldValue('condition', {})
          }}
        />

        <NumberInput
          defaultValue={1}
          description="Número de veces que se debe cumplir la predicción"
          disabled={!hasCounterCond}
          label="Contador objetivo"
          min={1}
          placeholder="1"
          onChange={(value) => form.setFieldValue('condition', { targetCounter: Number(value) })}
        />

        <Button
          fullWidth
          className="cd-mt-8"
          disabled={!form.isValid()}
          type="submit"
          onClick={() => {}}
        >
          Guardar
        </Button>
      </form>
    </Modal>
  )
}

export default PredictionModal
