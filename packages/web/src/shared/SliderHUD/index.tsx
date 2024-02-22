import React from 'react'
import { ActionIcon, Avatar, Flex, Switch, Text, Tooltip } from '@mantine/core'
import {
  IconPlayerTrackNextFilled,
  IconPlayerTrackPrevFilled,
  IconRestore,
} from '@tabler/icons-react'

import type { MessageResponseType } from '@global/types/src/discord'

import './styles.scss'
import { $ } from '@src/utils/styles'

type SliderHUDProps = {
  hasPrev: boolean
  hasNext: boolean
  autoPlay?: boolean
  currentIndex: number
  labelCounter?: string
  useShadowCorners?: boolean
  messages: MessageResponseType[]
  currentMessage?: MessageResponseType | null
  goPrevMessage: () => void
  goNextMessage: () => void
  handleReset: () => void
  handleAutoPlay?: () => void
}

const SliderHUD = (props: SliderHUDProps) => {
  const {
    hasPrev,
    hasNext,
    autoPlay,
    messages = [],
    currentIndex,
    handleAutoPlay,
    currentMessage,
    useShadowCorners,
    labelCounter = 'mensajes',
    goPrevMessage,
    goNextMessage,
    handleReset,
  } = props
  return (
    <React.Fragment>
      <React.Fragment>
        {/* bg-controls-right */}
        {currentMessage && (
          <div
            className={$(
              'cd-absolute cd-top-0 cd-left-0 cd-z-50 cd-pl-[1rem] cd-pt-[0.5rem] cd-pr-[10rem] cd-pb-[4rem]',
              useShadowCorners && 'bg-controls-right',
            )}
          >
            <Flex align="center" direction="row" gap="md" justify="center">
              <Avatar size="lg" src={currentMessage.author.avatar} />
              <Text>{currentMessage.author.globalName}</Text>
            </Flex>
          </div>
        )}

        {/* bg-controls-left */}
        <div
          className={$(
            'cd-absolute cd-top-0 cd-right-0 cd-z-50 cd-pl-[10rem] cd-pt-[0.5rem] cd-pr-[1rem] cd-pb-[4rem]',
            useShadowCorners && 'bg-controls-left',
          )}
        >
          <Flex align="flex-end" direction="column" gap="xs" justify="center">
            {handleAutoPlay && (
              <Switch checked={autoPlay} label="AutoPlay" onChange={handleAutoPlay} />
            )}
            <Text c="violet.3">
              {currentIndex + 1} / {messages.length} {labelCounter}
            </Text>
            <Tooltip label="Reiniciar actividad">
              <ActionIcon size="sm" variant="subtle" onClick={handleReset}>
                <IconRestore />
              </ActionIcon>
            </Tooltip>
          </Flex>
        </div>

        <div className="cd-absolute cd-top-[50%] cd-left-[16px] cd-z-50">
          <ActionIcon disabled={!hasPrev} size="xl" variant="subtle" onClick={goPrevMessage}>
            <IconPlayerTrackPrevFilled />
          </ActionIcon>
        </div>

        <div className="cd-absolute cd-top-[50%] cd-right-[16px] cd-z-50">
          <ActionIcon disabled={!hasNext} size="xl" variant="subtle" onClick={goNextMessage}>
            <IconPlayerTrackNextFilled />
          </ActionIcon>
        </div>
      </React.Fragment>
    </React.Fragment>
  )
}

export default SliderHUD
