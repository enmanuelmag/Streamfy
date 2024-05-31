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
} from '@mantine/core'
import { notifications } from '@mantine/notifications'

import type { Step1Type } from '@global/types/src/bingoUnique'
import { Logger } from '@global/utils'

import Kojima from '@assets/images/Kojima.webp'

type TableUniqueProps = {
  table: Step1Type
  playing?: boolean
}

const LAYOUT = 5

const MARKERS_KEY = 'bingo-markers'

const Table = (props: TableUniqueProps) => {
  const { title, description, predictions } = props.table

  const tableRef = React.useRef<HTMLDivElement>(null)

  const [markers, setMarkers] = React.useState<number[]>(
    JSON.parse(localStorage.getItem(MARKERS_KEY) || '[]'),
  )

  React.useEffect(() => {
    if (!props.playing) return
    const storedMarkers = JSON.parse(localStorage.getItem(MARKERS_KEY) || '[]')
    setMarkers(storedMarkers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="cd-w-full">
      <Paper withBorder className="cd-h-full cd-w-full" p="lg" ref={tableRef} shadow="sm">
        <Stack className="cd-w-full cd-h-full cd-flex cd-flex-col cd-items-center cd-justify-center">
          <Title order={3}>{title}</Title>
          <Text>{description}</Text>

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
                        <Text size="lg">{pred.title}</Text>
                        <Text>{pred.description}</Text>
                      </Flex>
                    }
                    transitionProps={{ duration: 200 }}
                    w={220}
                  >
                    <div>
                      <Image alt={pred.title} h={150} src={pred.image} w={150} />
                      <Transition
                        duration={400}
                        mounted={markers.includes(index)}
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
                  onClick={handleMarker.bind(null, index)}
                >
                  <div className="cd-relative cd-flex cd-items-center cd-justify-center cd-h-full cd-w-ful cd-border-gray-500 cd-border-solid cd-border-[1px] cd-rounded-lg">
                    {item}
                  </div>
                </Grid.Col>
              )
            })}
          </Grid>
        </Stack>
      </Paper>
      {props.playing && (
        <Group className="cd-mt-[1rem]" justify="center">
          <Button color="teal" variant="light" onClick={handleActions.bind(null, 'copy')}>
            Copiar tabla
          </Button>
          <Button variant="light" onClick={handleActions.bind(null, 'download')}>
            Descargar tabla
          </Button>
        </Group>
      )}
    </div>
  )

  function handleMarker(index: number) {
    if (!props.playing) return
    let newMarkers = [...markers]
    if (markers.includes(index)) {
      newMarkers = newMarkers.filter((marker) => marker !== index)
    } else {
      newMarkers.push(index)
    }

    localStorage.setItem(MARKERS_KEY, JSON.stringify(newMarkers))
    setMarkers(newMarkers)
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
