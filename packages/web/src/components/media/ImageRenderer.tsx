import React from 'react'
import { Image } from '@mantine/core'
import Loading from '@components/shared/Loading'
import { useDisclosure } from '@mantine/hooks'
import { ImageRendererProps } from '.'

function ImageRenderer(props: ImageRendererProps) {
  const { src, alt } = props

  const [loading, handlers] = useDisclosure(true)

  return (
    <React.Fragment>
      <Image alt={alt} src={src} onLoad={handlers.close} display={loading ? 'none' : 'block'} />
      <Loading show={loading} className="cd-absolute" text="Cargando imagen" />
    </React.Fragment>
  )

  function onLoad() {
    handlers.close()
  }
}
