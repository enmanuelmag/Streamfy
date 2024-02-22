import React from 'react'
import ReactPlayer from 'react-player'
import { Center, Image, Text } from '@mantine/core'
import { TwitterTweetEmbed } from 'react-twitter-embed'

import { MessageResponseType } from '@global/types/src/discord'

import Loading from '@components/shared/Loading'

import './styles.scss'

type MediaProps = {
  autoPlay?: boolean
  message: MessageResponseType
  styles: React.CSSProperties
  useMediaControls?: boolean
  goNextMessage: () => void
  onVideoEnd: () => void
  onVideoPause?: () => void
  onVideoPlay?: () => void
}

const Media = (props: MediaProps) => {
  const {
    useMediaControls,
    autoPlay = false,
    styles,
    onVideoEnd,
    onVideoPause,
    onVideoPlay,
    goNextMessage,
    message,
  } = props

  const { attachments, content, id } = message

  let Component = null

  if (attachments.length === 0) {
    const tweetId = getTweetId(content)
    if (tweetId) {
      Component = (
        <TwitterTweetEmbed
          key={id}
          options={{
            width: 500,
          }}
          placeholder={<Loading className="cd-absolute" text="Cargando tweet" />}
          tweetId={tweetId}
        />
      )
    } else {
      Component = <Text>{content}</Text>
    }
  } else {
    const [{ contentType = '', url, description }] = attachments
    Component = (
      <React.Fragment>
        {isImage(contentType) && <Image alt={content || description || 'Imagen'} src={url} />}
        {isVideo(contentType) && (
          <ReactPlayer
            controls={useMediaControls}
            height="100%"
            pip={false}
            playing={autoPlay}
            url={url}
            width="100%"
            onEnded={() => {
              goNextMessage()
              onVideoEnd()
            }}
            onPause={onVideoPause}
            onPlay={onVideoPlay}
          />
        )}
      </React.Fragment>
    )
  }

  return (
    <Center className="cd-relative cd-h-full cd-w-full" style={styles}>
      {Component}
    </Center>
  )

  function getTweetId(content: string) {
    const contentHasTwitterUrl = content.includes('twitter.com') || content.includes('x.com')

    if (!contentHasTwitterUrl) return null

    return content.split('/').pop()?.split('?')[0]
  }

  function isImage(contentType: string | null) {
    return contentType?.includes('image')
  }

  function isVideo(contentType: string | null) {
    return contentType?.includes('video')
  }
}

export default Media
