import React from 'react'
import { toPng, toBlob } from 'html-to-image'
import {
  Button,
  Flex,
  Grid,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
  Transition,
  Modal,
  ActionIcon,
  Center,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'

import type { Step1Type } from '@global/types/src/bingoUnique'
import type { PredictionBingoType } from '@global/types/src/discord'
import { Logger } from '@global/utils'

import Kojima from '@assets/images/Kojima.webp'
import { useCounter } from '@mantine/hooks'
import { IconMinus, IconPlus } from '@tabler/icons-react'

type TableUniqueProps = {
  table: Step1Type
  playing?: boolean
  onUpdate?: (table: Step1Type) => void
}

const LAYOUT = 5

const Table = (props: TableUniqueProps) => {
  const { title, description, predictions } = props.table

  const tableRef = React.useRef<HTMLDivElement>(null)

  const [predModal, setPredModal] = React.useState<
    (PredictionBingoType & { index: number }) | null
  >(null)

  const [predCounter, handlerCounter] = useCounter(
    predModal?.condition?.targetCounter?.target || 0,
    {
      min: 0,
    },
  )

  React.useEffect(() => {
    if (predModal) {
      handlerCounter.set(predModal.condition?.targetCounter?.counter || 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predModal])

  const tableMemo = React.useMemo(
    () => (
      <Grid align="center" className="cd-h-full" gutter="xs" justify="center">
        {Array.from({ length: 25 }).map((_, index) => {
          const pred = predictions[index]

          let item = (
            <Text size="xl">
              <Image alt="Kojima" h={50} src={Kojima} w={50} />
            </Text>
          )

          if (pred) {
            item = (
              <Tooltip
                multiline
                withArrow
                label={
                  <Flex direction="column" gap={0}>
                    {pred.image && <Text size="lg">{pred.title}</Text>}
                    <Text>{pred.description}</Text>
                  </Flex>
                }
                transitionProps={{ duration: 200 }}
                w={220}
              >
                <div className="cd-relative cd-w-full cd-h-full">
                  {pred.image ? (
                    <Image fit="cover" flex="1" h="100%" src={pred.image} w="100%" />
                  ) : (
                    <Center className="cd-h-full">
                      <Text size="xl">{pred.title}</Text>
                    </Center>
                  )}
                  {pred.condition?.targetCounter && (
                    <Text
                      className="cd-absolute cd-bottom-0 cd-right-0 cd-bg-black cd-opacity-80 cd-text-white cd-rounded-tl-lg !cd-px-[1rem] !cd-py-1"
                      style={{ zIndex: 1 }}
                    >
                      {pred.condition.targetCounter.counter} / {pred.condition.targetCounter.target}
                    </Text>
                  )}
                  <Transition
                    duration={400}
                    mounted={isMarked(pred)}
                    timingFunction="ease"
                    transition="fade"
                  >
                    {(styles) => (
                      <div className="cd-flex cd-items-center cd-justify-center" style={styles}>
                        <div
                          className="cd-absolute cd-top-0 cd-left-0 cd-bottom-0 cd-right-0 cd-bg-black cd-opacity-40 cd-rounded-lg"
                          style={{ zIndex: 1 }}
                        />
                        <Image
                          alt="Kojima"
                          className="cd-absolute cd-right-[0.5rem] cd-bottom-[0.5rem]"
                          h={50}
                          src={Kojima}
                          style={{ zIndex: 2 }}
                          w={50}
                        />
                      </div>
                    )}
                  </Transition>
                </div>
              </Tooltip>
            )
          }

          return (
            <Grid.Col
              className="!cd-cursor-pointer"
              h={175}
              key={index}
              span={12 / LAYOUT}
              onClick={() => {
                if (!props.playing) return

                if (pred.condition?.targetCounter) {
                  setPredModal({ ...pred, index })
                  return
                }

                handleMarker(index)
              }}
            >
              <div className="cd-relative cd-flex cd-items-center cd-justify-center cd-h-full cd-w-ful cd-border-gray-500 cd-border-solid cd-border-[1px] cd-rounded-lg">
                {item}
              </div>
            </Grid.Col>
          )
        })}
      </Grid>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleMarker, predictions, props.playing, props.table],
  )

  return (
    <div className="cd-w-full">
      <Paper withBorder className="cd-h-full cd-w-full" p="lg" ref={tableRef} shadow="sm">
        <Stack className="cd-w-full cd-h-full cd-flex cd-flex-col cd-items-center cd-justify-center">
          <Title order={3}>{title}</Title>
          <Text>{description}</Text>
          {tableMemo}
        </Stack>
      </Paper>
      {!window && props.playing && (
        <Group className="cd-mt-[1rem]" justify="center">
          <Button color="teal" variant="light" onClick={handleActions.bind(null, 'copy')}>
            Copiar tabla
          </Button>
          <Button variant="light" onClick={handleActions.bind(null, 'download')}>
            Descargar tabla
          </Button>
        </Group>
      )}
      <Modal
        centered
        opened={Boolean(predModal)}
        title={predModal?.title}
        onClose={() => setPredModal(null)}
      >
        {predModal && (
          <React.Fragment>
            <Text>{predModal.description}</Text>
            <Text mt="sm">
              Se han cumplido
              <Text
                inherit
                span
                c={predCounter === predModal.condition?.targetCounter?.target ? 'green' : 'red'}
                className="!cd-mx-[0.5rem]"
                fw={800}
              >
                {predCounter}
              </Text>
              de
              <Text inherit span className="!cd-mx-[0.5rem]" fw={800}>
                {predModal.condition?.targetCounter?.target}
              </Text>
              veces
            </Text>
            <Group className="cd-mt-[1rem]" justify="center">
              <ActionIcon
                color="green"
                disabled={predCounter === predModal.condition?.targetCounter?.target}
                size="xl"
                onClick={handlerCounter.increment}
              >
                <IconPlus />
              </ActionIcon>
              <ActionIcon
                c="red"
                color="gray"
                disabled={predCounter === 0}
                size="xl"
                onClick={handlerCounter.decrement}
              >
                <IconMinus />
              </ActionIcon>
            </Group>

            <Group className="cd-mt-[1rem] cd-w-full" justify="flex-end">
              <Button
                color="teal"
                onClick={() => {
                  const newPred = { ...predModal }

                  if (newPred.condition?.targetCounter) {
                    newPred.condition.targetCounter.counter = predCounter
                  }

                  const newTable = props.table
                  newTable.predictions[predModal.index] = newPred

                  props.onUpdate?.(newTable)
                  setPredModal(null)
                }}
              >
                Guardar
              </Button>
            </Group>
          </React.Fragment>
        )}
      </Modal>
    </div>
  )

  function isMarked(pred: PredictionBingoType) {
    if (!props.playing) return false

    if (!pred.condition?.targetCounter) {
      return Boolean(pred.marked)
    }

    return pred.condition.targetCounter.counter === pred.condition.targetCounter.target
  }

  function handleMarker(index: number) {
    if (!props.playing) return

    console.log('handleMarker', index)

    const newTable = props.table
    newTable.predictions[index].marked = !newTable.predictions[index].marked

    console.log('newTable', newTable)

    props.onUpdate?.(newTable)
  }

  function handleActions(action: 'copy' | 'download') {
    if (!tableRef.current) return

    if (action === 'copy') {
      toBlob(tableRef.current)
        .then((blob) => {
          if (!blob) {
            notifications.show({
              color: 'red',
              title: 'Error',
              message: 'No se pudo copiar la tabla',
            })
            return
          }
          navigator.clipboard
            .write([
              new ClipboardItem({
                'image/png': blob,
              }),
            ])
            .then(() =>
              notifications.show({
                color: 'teal',
                title: 'Copiado',
                message: 'Tabla copiada',
              }),
            )
            .catch((error) => {
              Logger.error(error)
              notifications.show({
                color: 'red',
                title: 'Error',
                message: 'No se pudo copiar la tabla',
              })
            })
        })
        .catch((error) => {
          Logger.error(error)
          notifications.show({
            color: 'red',
            title: 'Error',
            message: 'No se pudo copiar la tabla',
          })
        })
    } else if (action === 'download') {
      toPng(tableRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a')
          link.download = 'bingo-table.png'
          link.href = dataUrl
          link.click()

          notifications.show({
            color: 'teal',
            title: 'Descarga',
            message: 'Tabla descargada',
          })
        })
        .catch((error) => {
          Logger.error(error)
          notifications.show({
            color: 'red',
            title: 'Error',
            message: 'No se pudo descargar la tabla',
          })
        })
    }
  }
}

export default Table
