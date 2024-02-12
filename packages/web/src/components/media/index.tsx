import React from 'react'
import ReactPlayer from 'react-player'
import { Image, Text } from '@mantine/core'

import { MessageResponseType } from '@global/types/src/discord'

type MediaProps = {
  autoPlay?: boolean
  message: MessageResponseType
  nextMessage: () => void
}

const Media = (props: MediaProps) => {
  const { attachments, content } = props.message

  const [{ contentType, url, description }] = React.useMemo(() => attachments, [attachments])

  if (contentType?.includes('image')) {
    return <Image alt={content || description || 'Imagen'} src={url} />
  } else if (contentType?.includes('video')) {
    return (
      <div className="cd-relative cd-h-full cd-w-full">
        <ReactPlayer
          controls
          className="cd-absolute cd-top-0 cd-left-0"
          height="100%"
          pip={false}
          playing={props.autoPlay}
          url={url}
          volume={0.05}
          width="100%"
          onEnded={props.nextMessage}
        />
      </div>
    )
  }

  return <Text>{contentType}</Text>
}

export default Media
