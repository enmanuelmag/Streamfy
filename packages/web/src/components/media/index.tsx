import React from 'react'
import ReactPlayer from 'react-player'
import { Center, Image, Loader, Stack, Text } from '@mantine/core'
import { TwitterTweetEmbed } from 'react-twitter-embed'

import { REGEX_TWITTER_URL } from '@src/constants/media'
import { MessageResponseType } from '@global/types/src/discord'

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

  const Component = React.useMemo(() => {
    if (attachments.length === 0) {
      const tweetId = getTweetId(content)
      if (tweetId) {
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
            tweetId={tweetId}
          />
        )
      }
      return <Text>{content}</Text>
    }

    const [{ contentType = '', url, description }] = attachments

    return (
      <React.Fragment>
        {isImage(contentType) && <Image alt={content || description || 'Imagen'} src={url} />}
        {isVideo(contentType) && (
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
        )}
      </React.Fragment>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message?.id])

  return (
    <Center className="cd-relative cd-h-full cd-w-full" style={styles}>
      {Component}
    </Center>
  )

  function getTweetId(content: string) {
    const match = REGEX_TWITTER_URL.exec(content)
    return match ? match[2] : null
  }

  function isImage(contentType: string | null) {
    return contentType?.includes('image')
  }

  function isVideo(contentType: string | null) {
    return contentType?.includes('video')
  }
}

export default Media
