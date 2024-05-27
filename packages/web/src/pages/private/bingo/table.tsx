import React from 'react'
import { toPng, toBlob } from 'html-to-image'
import { Button, Grid, Group, Image, Paper, Stack, Text, Title, Transition } from '@mantine/core'
import { notifications } from '@mantine/notifications'

import type { Step1Type } from '@global/types/src/bingo'
import { Logger } from '@global/utils'

import { $ } from '@src/utils/styles'

import Kojima from '@assets/images/Kojima.webp'

type TableProps = {
  table: Step1Type & { id?: string }
  generated?: boolean
}

const Table = (props: TableProps) => {
  const { generated } = props
  const { title, description, sentences, layout } = props.table

  const parsedLayout = parseInt(layout)

  console.log('layout', layout, parsedLayout)

  const tableRef = React.useRef<HTMLDivElement>(null)

  const [markers, setMarkers] = React.useState<number[]>([])

  return (
    <div className="cd-w-full">
      <Paper withBorder className="cd-h-full cd-w-full" p="lg" ref={tableRef} shadow="sm">
        <Stack className="cd-w-full cd-h-full cd-flex cd-flex-col cd-items-center cd-justify-center">
          <Title order={3}>{title}</Title>
          <Text>{description}</Text>

          <Grid align="center" className="cd-h-full" gutter="xs" justify="center">
            {Array.from({ length: parsedLayout * parsedLayout }).map((_, index) => (
              <Grid.Col
                className={$(generated && '!cd-cursor-pointer')}
                h={175}
                key={index}
                span={12 / parsedLayout}
                onClick={handleMarker.bind(null, index)}
              >
                <div className="cd-relative cd-flex cd-items-center cd-justify-center cd-h-full cd-w-ful cd-border-gray-500 cd-border-solid cd-border-[1px] cd-rounded-lg">
                  <Text className="cd-text-center" fz={generated ? 'lg' : 'sm'}>
                    {sentences[index]}
                  </Text>
                  <Transition
                    duration={400}
                    mounted={Boolean(generated && markers.includes(index))}
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
                          h={generated ? 64 : 32}
                          src={Kojima}
                          style={{ zIndex: 2 }}
                          w={generated ? 64 : 32}
                        />
                      </div>
                    )}
                  </Transition>
                </div>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      </Paper>
      {generated && (
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
    if (!generated) return

    if (markers.includes(index)) {
      setMarkers((prev) => prev.filter((marker) => marker !== index))
    } else {
      setMarkers((prev) => [...prev, index])
    }
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
