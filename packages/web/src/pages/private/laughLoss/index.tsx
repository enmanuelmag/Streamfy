import React from 'react'
import { IconPlayerTrackNextFilled, IconPlayerTrackPrevFilled } from '@tabler/icons-react'
import { ActionIcon, Container, Select, Switch } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useMutation, useQuery } from '@tanstack/react-query'

import { DiscordRepo } from '@src/db'
import { useStoreLaughLoss } from '@src/store'
import { type Step1Type, Step1Schema } from '@global/types/src/laughLoss'
import { ChannelResponseType, MessageResponseType } from '@global/types/src/discord'

import Media from '@src/components/media'
import Loading from '@src/components/shared/loading'

import { useSliderMedia } from '@hooks/slider'

import { Logger } from '@global/utils/src/log'
import { useDisclosure } from '@mantine/hooks'

const LaughLoss = () => {
  const {
    discordChannel,
    messages,
    currentMessage,
    setDiscordChannel,
    setCurrentMessage,
    setMessages,
  } = useStoreLaughLoss((state) => state)

  const form = useForm<Step1Type>({
    validate: zodResolver(Step1Schema),
    initialValues: {
      discordChannel: {
        id: '',
        name: '',
      },
    },
  })

  const channelQuery = useQuery<ChannelResponseType[] | null, Error>({
    queryKey: ['discordChannels'],
    enabled: !discordChannel,
    queryFn: () => DiscordRepo.getChannels({ channelType: 0 }),
  })

  const messagesMutation = useMutation<MessageResponseType[] | null, Error, string, string>({
    mutationFn: (channelId: string) => DiscordRepo.getMessages({ channelId }),
    onSuccess: (messages) => {
      setMessages(messages)
      setCurrentMessage(currentMessage || messages?.[0] || null)
    },
    onError: (error) => {
      Logger.error('Error getting messages', error)
    },
  })

  const [autoPlay, handlers] = useDisclosure(false)

  const { nextMessage, prevMessage } = useSliderMedia({
    messages,
    currentMessage,
    setCurrentMessage,
  })

  React.useEffect(() => {
    if (discordChannel && !messages) {
      messagesMutation.mutate(discordChannel.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discordChannel])

  console.log('currentMessage', currentMessage?.id)

  return (
    <Container
      className="cd-w-full cd-h-full cd-relative"
      fluid={currentMessage ? true : undefined}
      size="md"
    >
      {channelQuery.isLoading && <Loading text="Cargando canales" />}
      {messagesMutation.isPending && <Loading text="Cargando mensajes" />}
      {!discordChannel && channelQuery.data && (
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
          <Select
            data={channelQuery.data.map((c) => ({ value: c.id, label: c.name })) || []}
            label="Canal"
            value={form.values.discordChannel.id}
            {...form.getInputProps('discordChannel.id')}
            onChange={handleChannelChange}
          />
        </form>
      )}
      <div className="cd-absolute cd-top-0 cd-right-0 cd-z-50">
        <Switch checked={autoPlay} label="AutoPlay" onChange={handlers.toggle} />
      </div>
      {/* create a div absolute pos in the center vertically and left to show the prev butotn */}
      <div className="cd-absolute cd-top-[50%] cd-left-0 cd-z-50">
        <ActionIcon disabled={!prevMessage} size="xl" variant="subtle" onClick={prevMessage}>
          <IconPlayerTrackPrevFilled />
        </ActionIcon>
      </div>
      {/* create a div absolute pos in the center vertically and right to show the next butotn */}
      <div className="cd-absolute cd-top-[50%] cd-right-0 cd-z-50">
        <ActionIcon disabled={!nextMessage} size="xl" variant="subtle" onClick={nextMessage}>
          <IconPlayerTrackNextFilled />
        </ActionIcon>
      </div>
      {currentMessage && (
        <Media autoPlay={autoPlay} message={currentMessage} nextMessage={nextMessage} />
      )}
    </Container>
  )

  function handleChannelChange(channelId: string | null) {
    if (!channelId || !channelQuery.data) return

    const channel = channelQuery.data.find((c) => c.id === channelId)
    form.setFieldValue('discordChannel', {
      id: channelId,
      name: channel?.name || '',
    })
    setDiscordChannel(channel)
    messagesMutation.mutate(channelId)
  }
}

export default LaughLoss
