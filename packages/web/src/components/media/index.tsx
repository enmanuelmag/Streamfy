import React from 'react'
import ReactPlayer from 'react-player'
import { Center, Image, Text } from '@mantine/core'

import { MessageResponseType } from '@global/types/src/discord'

type MediaProps = {
  autoPlay?: boolean
  message?: MessageResponseType | null
  styles: React.CSSProperties
  nextMessage: () => void
  onVideoEnd: () => void
}

const Media = (props: MediaProps) => {
  const { autoPlay = false, styles, onVideoEnd, nextMessage, message } = props

  if (!message) return null

  const { attachments, content } = message

  const [{ contentType, url, description }] = attachments

  if (contentType?.includes('image')) {
    return <Image alt={content || description || 'Imagen'} src={url} style={styles} />
  } else if (contentType?.includes('video')) {
    return (
      <Center className="cd-relative cd-h-full cd-w-full" style={styles}>
        <ReactPlayer
          controls
          // className="cd-absolute cd-top-0 cd-left-0"
          height="100%"
          pip={false}
          playing={autoPlay}
          url={url}
          width="100%"
          onEnded={() => {
            nextMessage()
            onVideoEnd()
          }}
        />
      </Center>
    )
  }

  return <Text>{contentType}</Text>
}

export default Media
