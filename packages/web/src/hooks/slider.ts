import { MessageResponseType } from '@global/types/src/discord'
import { useDisclosure } from '@mantine/hooks'
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
  const [showAnimation, handlersShowAnimation] = useDisclosure(true)
  const [direction, setDirection] = React.useState<'left' | 'right'>('left')

  const hasPrev = Boolean(currentIndex > 0)
  const hasNext = Boolean(messages && currentIndex < messages.length - 1)

  React.useEffect(() => {
    if (messages && currentMessage) {
      const index = messages.findIndex((message) => message.id === currentMessage.id)
      setCurrentIndex(index)
    }
  }, [messages, currentMessage])

  function goNextMessage() {
    if (!hasNext || !messages) return

    if (useTransition) {
      setDirection('left')
      handlersShowAnimation.close()
      return setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setCurrentMessage(messages[currentIndex + 1])
        handlersShowAnimation.open()
      }, delay)
    }

    setCurrentIndex((prev) => prev + 1)
    setCurrentMessage(messages[currentIndex + 1])
  }

  function goPrevMessage() {
    if (!hasPrev || !messages) return

    if (useTransition) {
      setDirection('right')
      handlersShowAnimation.close()
      return setTimeout(() => {
        setCurrentIndex((prev) => prev - 1)
        setCurrentMessage(messages[currentIndex - 1])
        handlersShowAnimation.open()
      }, delay)
    }

    setCurrentIndex((prev) => prev - 1)
    setCurrentMessage(messages[currentIndex - 1])
  }

  return {
    hasPrev,
    hasNext,
    direction,
    currentIndex,
    showAnimation,
    goNextMessage,
    goPrevMessage,
  }
}
