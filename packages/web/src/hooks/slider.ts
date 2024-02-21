import { MessageResponseType } from '@global/types/src/discord'
import React from 'react'

type SliderMediaProps = {
  delay?: number
  useTransition?: boolean
  messages?: MessageResponseType[] | null
  currentMessage?: MessageResponseType | null
  setCurrentMessage: (message: MessageResponseType) => void
}

export const useSliderMedia = (props: SliderMediaProps) => {
  const { delay = 500, useTransition, messages, currentMessage, setCurrentMessage } = props

  const [currentIndex, setCurrentIndex] = React.useState<number>(0)
  const [direction, setDirection] = React.useState<'left' | 'right'>('left')

  const hasPrev = currentIndex > 0
  const hasNext = messages && currentIndex < messages.length - 1

  const [showAnimation, setShowAnimation] = React.useState<boolean>(true)

  React.useEffect(() => {
    if (messages && currentMessage) {
      const index = messages.findIndex((message) => message.id === currentMessage.id)
      setCurrentIndex(index)
    }
  }, [messages, currentMessage])

  function nextMessage() {
    if (!hasNext || !messages) return

    if (useTransition) {
      setDirection('left')
      setShowAnimation(false)
      return setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setCurrentMessage(messages[currentIndex + 1])
        setShowAnimation(true)
      }, delay)
    }

    setCurrentIndex((prev) => prev + 1)
    setCurrentMessage(messages[currentIndex + 1])
  }

  function prevMessage() {
    if (!hasPrev || !messages) return

    if (useTransition) {
      setDirection('right')
      setShowAnimation(false)
      return setTimeout(() => {
        setCurrentIndex((prev) => prev - 1)
        setCurrentMessage(messages[currentIndex - 1])
        setShowAnimation(true)
      }, delay)
    }

    setCurrentIndex((prev) => prev - 1)
    setCurrentMessage(messages[currentIndex - 1])
  }

  return {
    direction,
    nextMessage,
    prevMessage,
    currentIndex,
    showAnimation,
    hasPrev: currentIndex > 0,
    hasNext: messages && currentIndex < messages.length - 1,
  }
}
