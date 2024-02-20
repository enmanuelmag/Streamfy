import React from 'react'
import ReactPlayer from 'react-player'
import { Center, Image, Loader, Stack, Text } from '@mantine/core'
import { TwitterTweetEmbed } from 'react-twitter-embed'

import { MessageResponseType } from '@global/types/src/discord'

import { Logger } from '@global/utils/src/log'

import './styles.scss'

type MediaProps = {
  autoPlay?: boolean
  message: MessageResponseType
  styles: React.CSSProperties
  nextMessage: () => void
  onVideoEnd: () => void
}

const Media = (props: MediaProps) => {
  const { autoPlay = false, styles, onVideoEnd, nextMessage, message } = props

  const { attachments, content, id } = message

  const Tweet = React.useMemo(() => {
    if (!isTweet(content)) return null
    Logger.info('Tweet detected', getTweetId(content))
    return (
      <TwitterTweetEmbed
        key={id}
        options={{
          width: 500,
        }}
        placeholder={
          <Center className="cd-h-full">
            <Stack align="center">
              <Loader />
              <Text>Loading tweet</Text>
            </Stack>
          </Center>
        }
        tweetId={getTweetId(content)}
      />
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message?.id])

  if (attachments.length === 0) {
    if (isTweet(content)) {
      Logger.info('Tweet detected', getTweetId(content))
      return (
        <Center className="cd-relative cd-h-full cd-w-full" style={styles}>
          {Tweet}
        </Center>
      )
    }

    return <Center style={styles}>{content && <Text>{content}</Text>}</Center>
  }

  if (attachments) {
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
  }

  function isTweet(content: string) {
    const regex = /https?:\/\/(www\.)?[x|twitter]+\.com\/[a-zA-Z0-9_]+\/status\/([0-9]+)\?s=[0-9]+/g
    return regex.test(content)
  }

  function getTweetId(content: string) {
    const regex = /https?:\/\/(www\.)?[x|twitter]+\.com\/[a-zA-Z0-9_]+\/status\/([0-9]+)\?s=[0-9]+/g
    const match = regex.exec(content)
    return match ? match[2] : ''
  }
}

export default Media
