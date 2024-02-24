import React from 'react'
import ReactPlayer from 'react-player'
import { Center, Container, Image, Progress, Text } from '@mantine/core'
import { TwitterTweetEmbed } from 'react-twitter-embed'

import { MessageResponseType } from '@global/types/src/discord'

import Loading from '@components/shared/Loading'

import './styles.scss'
import { useCounter } from '@mantine/hooks'

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
          placeholder={<Loading show className="cd-absolute" text="Cargando tweet" />}
          tweetId={tweetId}
        />
      )
    } else {
      Component = (
        <Container size="lg">
          <Text>{content}</Text>
        </Container>
      )
    }
  } else {
    const [{ contentType = '', url, description }] = attachments

    if (isType(contentType, 'image')) {
      Component = (
        <Container size="lg">
          <Image alt={content || description || 'Imagen'} src={url} />
        </Container>
      )
    } else if (isType(contentType, 'video')) {
      return (
        <VideoPlayer
          autoPlay={autoPlay}
          goNextMessage={goNextMessage}
          styles={styles}
          url={url}
          useMediaControls={useMediaControls}
          onVideoEnd={onVideoEnd}
          onVideoPause={onVideoPause}
          onVideoPlay={onVideoPlay}
        />
      )
    } else {
      Component = (
        <Container size="lg">
          <Text>
            Media type {contentType} not supported: {content}
          </Text>
        </Container>
      )
    }
  }

  return (
    <Center className="cd-relative cd-w-full cd-h-full" style={styles}>
      {Component}
    </Center>
  )

  function getTweetId(content: string) {
    const contentHasTwitterUrl = content.includes('twitter.com') || content.includes('x.com')

    if (!contentHasTwitterUrl) return null

    return content.split('/').pop()?.split('?')[0]
  }

  function isType(contentType: string | null, type: 'image' | 'video') {
    return contentType?.includes(type)
  }
}

type MediaPlayerProps = {
  autoPlay?: boolean
  url: string
  useMediaControls?: boolean
  onVideoEnd: () => void
  onVideoPause?: () => void
  onVideoPlay?: () => void
  goNextMessage: () => void
  styles: React.CSSProperties
}

function VideoPlayer(props: MediaPlayerProps) {
  const {
    autoPlay = false,
    url,
    useMediaControls,
    onVideoEnd,
    onVideoPause,
    onVideoPlay,
    goNextMessage,
    styles,
  } = props

  const [videoProgress, handlersVideoProgress] = useCounter(0, { min: 0, max: 100 })

  return (
    <React.Fragment>
      <Center className="cd-relative cd-w-full cd-h-[calc(100%-8px)]" style={styles}>
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
          onProgress={(state) => handlersVideoProgress.set(state.played * 100)}
        />
      </Center>
      <Progress
        className="cd-absolute cd-bottom-0 cd-w-full cd-z-50"
        radius="xs"
        transitionDuration={250}
        value={videoProgress}
      />
    </React.Fragment>
  )
}

export default Media
