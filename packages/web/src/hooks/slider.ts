import { MessageResponseType } from '@global/types/src/discord'
import React from 'react'

type SliderMediaProps = {
  messages?: MessageResponseType[] | null
  currentMessage?: MessageResponseType | null
  setCurrentMessage: (message: MessageResponseType) => void
}

export const useSliderMedia = (props: SliderMediaProps) => {
  const { messages, currentMessage, setCurrentMessage } = props

  const [currentIndex, setCurrentIndex] = React.useState<number>(0)

  const hasPrev = currentIndex > 0
  const hasNext = messages && currentIndex < messages.length - 1

  React.useEffect(() => {
    if (messages && currentMessage) {
      const index = messages.findIndex((message) => message.id === currentMessage.id)
      setCurrentIndex(index)
    }
  }, [messages, currentMessage])

  function nextMessage() {
    if (!hasNext || !messages) return

    setCurrentIndex((prev) => prev + 1)
    setCurrentMessage(messages[currentIndex + 1])
  }

  function prevMessage() {
    if (!hasPrev || !messages) return

    setCurrentIndex((prev) => prev - 1)
    setCurrentMessage(messages[currentIndex - 1])
  }

  return {
    nextMessage,
    prevMessage,
    currentIndex,
    hasPrev: currentIndex > 0,
    hasNext: messages && currentIndex < messages.length - 1,
  }
}
