import React from 'react'
import ReactPlayer from 'react-player'
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconVolumeOff,
  IconVolume2,
  IconVolume,
} from '@tabler/icons-react'
import {
  ActionIcon,
  Center,
  Container,
  Group,
  Image,
  ScrollArea,
  Slider,
  Stack,
  Text,
  Transition,
} from '@mantine/core'
import { TwitterTweetEmbed } from 'react-twitter-embed'

import { MessageResponseType } from '@global/types/src/discord'

import Loading from '@components/shared/Loading'

import './styles.scss'
import { useCounter, useDisclosure, useHover } from '@mantine/hooks'
import { $ } from '@src/utils/styles'

const KEYBINDINGS = {
  NEXT: 'ArrowRight', //'.',
  PREV: 'ArrowLeft', //',',
  REPEAT: 'r',
  PLAY_PAUSE: 'p',
  DEFAULT_TOGGLE: ' ',
}

type MediaProps = {
  index?: number
  autoPlay?: boolean
  disableSkipVideos?: boolean
  message: MessageResponseType
  styles: React.CSSProperties
  useMediaControls?: boolean
  goNextMessage: () => void
  goPrevMessage: () => void
  onVideoEnd: () => void
  onVideoPause?: () => void
  onVideoPlay?: () => void
}

const Media = (props: MediaProps) => {
  const {
    index,
    disableSkipVideos,
    useMediaControls,
    autoPlay = false,
    styles,
    onVideoEnd,
    onVideoPause,
    onVideoPlay,
    goNextMessage,
    goPrevMessage,
    message,
  } = props

  const { attachments = [], content, id } = message

  React.useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const isVideo = attachments.length
        ? Boolean(attachments[0].contentType?.includes('video'))
        : false

      if (disableSkipVideos && isVideo) return

      if (event.key === KEYBINDINGS.PREV) {
        goPrevMessage()
      } else if (event.key === KEYBINDINGS.NEXT) {
        goNextMessage()
      }
    }

    window.addEventListener('keydown', handleKeydown)

    return () => window.removeEventListener('keydown', handleKeydown)
  }, [disableSkipVideos, attachments, goNextMessage, goPrevMessage])

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
    }
  } else {
    const [{ contentType = '', url, description }] = attachments

    if (isType(contentType, 'image')) {
      Component = (
        <Container size="lg">
          <ImageRenderer alt={content || description || 'Imagen'} src={url} />
        </Container>
      )
    } else if (isType(contentType, 'video')) {
      return (
        <VideoPlayer
          autoPlay={autoPlay}
          goNextMessage={goNextMessage}
          index={index}
          styles={styles}
          url={url}
          useMediaControls={useMediaControls}
          onVideoEnd={onVideoEnd}
          onVideoPause={onVideoPause}
          onVideoPlay={onVideoPlay}
        />
      )
    } else {
      Component = <Text size="lg">Media type {contentType} not supported</Text>
    }
  }

  return (
    <Center className="cd-relative cd-w-full cd-h-full" style={styles}>
      <ScrollArea.Autosize mah="90%">
        {Boolean(content.length) && (
          <Container className="cd-h-[80%] cd-mb-[2rem]" size="lg">
            <Text className="cd-whitespace-pre-wrap !cd-mx-[1rem]" size="lg">
              {content}
            </Text>
          </Container>
        )}
        {Component}
      </ScrollArea.Autosize>
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

type ImageRendererProps = {
  src: string
  alt: string
}

function ImageRenderer(props: ImageRendererProps) {
  const { src, alt } = props

  const [loading, handlers] = useDisclosure(true)

  return (
    <React.Fragment>
      <Image
        alt={alt}
        className="cd-max-h-full cd-max-w-full"
        display={loading ? 'none' : 'block'}
        src={src}
        onLoad={handlers.close}
      />
      <Loading show={loading} text="Cargando imagen" />
    </React.Fragment>
  )
}

type MediaPlayerProps = {
  url: string
  index?: number
  autoPlay?: boolean
  useMediaControls?: boolean
  onVideoEnd: () => void
  onVideoPause?: () => void
  onVideoPlay?: () => void
  goNextMessage: () => void
  styles: React.CSSProperties
}

function VideoPlayer(props: MediaPlayerProps) {
  const {
    url,
    index,
    autoPlay = false,
    useMediaControls,
    onVideoEnd,
    onVideoPause,
    onVideoPlay,
    goNextMessage,
    styles,
  } = props

  const refVideo = React.useRef<ReactPlayer>(null)
  const { hovered: hoveredPlay, ref: refPlay } = useHover()
  const { hovered: hoveredVolumen, ref: refVolumen } = useHover()

  const mediaControlsHover = hoveredPlay || hoveredVolumen

  const [showPlay, handlersShowPlay] = useDisclosure(index === 0)
  const [showVolume, handlersShowVolume] = useDisclosure(index === 0)

  const [audio, handlers] = useCounter(33, { min: 0, max: 100 })
  const [videoProgress, handlersVideoProgress] = useCounter(0, { min: 0, max: 100 })

  React.useEffect(() => {
    if (mediaControlsHover) {
      handlersShowPlay.open()
      handlersShowVolume.open()
    }
    const idTimeout = setTimeout(() => {
      if (mediaControlsHover) return
      handlersShowPlay.close()
      handlersShowVolume.close()
    }, 5500)

    return () => clearTimeout(idTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaControlsHover])

  // R (repeat video), Space (play/pause)
  React.useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === KEYBINDINGS.REPEAT) {
        refVideo.current?.seekTo(0)
        onVideoPlay?.()
      } else if ([KEYBINDINGS.PLAY_PAUSE, KEYBINDINGS.DEFAULT_TOGGLE].includes(event.key)) {
        if (autoPlay) {
          onVideoPause?.()
        } else {
          onVideoPlay?.()
        }
      }
    }

    window.addEventListener('keydown', handleKeydown)

    return () => window.removeEventListener('keydown', handleKeydown)
  }, [autoPlay, onVideoPause, onVideoPlay])

  return (
    <React.Fragment>
      <div
        className={$(
          'cd-absolute cd-bottom-0 cd-left-0 cd-z-50 cd-pr-[1rem] cd-pt-[4rem] cd-pl-[0.5rem] cd-pb-[1.5rem] bg-controls-bottom-left',
          'cd-w-[500px]',
        )}
        ref={refPlay}
      >
        <Transition duration={250} mounted={showPlay} transition="fade">
          {(styles) => (
            <ActionIcon
              className="cd-cursor-pointer"
              size="lg"
              style={styles}
              variant="subtle"
              onClick={autoPlay ? onVideoPause : onVideoPlay}
            >
              {autoPlay ? <IconPlayerPauseFilled size={30} /> : <IconPlayerPlayFilled size={30} />}
            </ActionIcon>
          )}
        </Transition>
      </div>
      <Center className="cd-relative cd-w-full cd-h-[calc(100%-8px)]" style={styles}>
        <ReactPlayer
          controls={useMediaControls}
          height="100%"
          pip={false}
          playing={autoPlay}
          ref={refVideo}
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
          'cd-absolute cd-bottom-0 cd-right-0 cd-z-50 cd-pl-[1rem] cd-pt-[4rem] cd-pr-[0rem] cd-pb-[2rem] bg-controls-bottom-left',
          'cd-w-[500px]',
        )}
        ref={refVolumen}
        //style={{ opacity: showVolume ? 1 : 0 }}
      >
        <Transition duration={250} mounted={showVolume} transition="fade">
          {(styles) => (
            <Group className="cd-pr-[1rem]" gap="xs" justify="flex-end" style={styles}>
              {audio === 0 && <IconVolumeOff />}
              {audio > 0 && audio < 50 && <IconVolume2 />}
              {audio >= 50 && <IconVolume />}
              <Slider
                className="cd-w-[135px]"
                defaultValue={0}
                label={(value) => (value === 33 ? 'Me repites ese numerin?' : value.toFixed(0))}
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
      <Slider
        className="cd-absolute cd-bottom-[0.5rem] cd-right-0 cd-w-full cd-z-50"
        label={(value) => (value === 33 ? 'Me repites ese numerin?' : null)}
        size="md"
        value={videoProgress}
        onChange={handleSeek}
        onChangeEnd={onVideoPlay}
      />
    </React.Fragment>
  )

  function handleSeek(value: number) {
    const player = refVideo.current
    onVideoPause?.()

    if (player) {
      player.seekTo(value / 100)
    }
    handlersVideoProgress.set(value)
  }
}

export default Media
