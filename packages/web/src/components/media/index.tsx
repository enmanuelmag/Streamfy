import React from 'react'
import ReactPlayer from 'react-player'
import { IconVolumeOff, IconVolume2, IconVolume } from '@tabler/icons-react'
import { Center, Container, Group, Image, Progress, Slider, Text, Transition } from '@mantine/core'
import { TwitterTweetEmbed } from 'react-twitter-embed'

import { MessageResponseType } from '@global/types/src/discord'

import Loading from '@components/shared/Loading'

import './styles.scss'
import { useCounter, useDisclosure, useHover } from '@mantine/hooks'
import { $ } from '@src/utils/styles'

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

  const [audio, handlers] = useCounter(0, { min: 0, max: 100 })

  const { hovered, ref } = useHover()

  const [showVolume, handlersShowVolume] = useDisclosure(false)

  React.useEffect(() => {
    if (hovered) {
      handlersShowVolume.open()
    }

    setTimeout(() => handlersShowVolume.close(), 5000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered])

  return (
    <React.Fragment>
      <Center className="cd-relative cd-w-full cd-h-[calc(100%-8px)]" style={styles}>
        <ReactPlayer
          controls={useMediaControls}
          height="100%"
          pip={false}
          playing={autoPlay}
          url={url}
          volume={audio / 100}
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
      {/* bg-controls-bottom-right */}
      <div
        className={$(
          'cd-absolute cd-bottom-0 cd-right-0 cd-z-50 cd-pl-[1rem] cd-pt-[4rem] cd-pr-[0rem] cd-pb-[1rem] bg-controls-bottom-left',
          'cd-w-[200px]',
        )}
        ref={ref}
        //style={{ opacity: showVolume ? 1 : 0 }}
      >
        <Transition duration={250} mounted={showVolume} transition="fade">
          {(styles) => (
            <Group gap="xs" style={styles}>
              {audio === 0 && <IconVolumeOff />}
              {audio > 0 && audio < 50 && <IconVolume2 />}
              {audio >= 50 && <IconVolume />}
              <Slider
                className="cd-w-[135px]"
                defaultValue={0}
                label={(value) => value.toFixed(0)}
                max={100}
                min={0}
                step={0.1}
                value={audio}
                onChange={handlers.set}
              />
            </Group>
          )}
        </Transition>
      </div>
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
