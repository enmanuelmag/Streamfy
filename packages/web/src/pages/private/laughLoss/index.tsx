import { useStoreBase } from '@src/store'
import { Container, Select, Text } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useMutation, useQuery } from '@tanstack/react-query'

import { DiscordRepo } from '@src/db'

import { ChannelResponseType } from '@global/types/src/discord'
import { type Step1Type, Step1Schema } from '@global/types/src/laughLoss'

import { Logger } from '@global/utils/src/log'
import React from 'react'

const LaughLoss = () => {
  const {
    laughLoss: { discordChannel, messages },
    setDiscordChannel,
    setMessages,
  } = useStoreBase((state) => state)

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

  const messagesMutation = useMutation({
    mutationFn: (channelId: string) => DiscordRepo.getMessages({ channelId }),
    onSuccess: (messages) => {
      Logger.info('Messages received', messages)
      setMessages('laughLoss', messages)
    },
    onError: (error) => {
      Logger.error('Error getting messages', error)
    },
  })

  React.useEffect(() => {
    if (discordChannel) {
      messagesMutation.mutate(discordChannel.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discordChannel])

  return (
    <Container fluid={Boolean(messages && messages.length)}>
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
      {messages &&
        messages.map((msg) => {
          const data = msg.attachments[0]
          return <Text key={msg.id}>{data && data.url}</Text>
        })}
    </Container>
  )

  function handleChannelChange(channelId: string | null) {
    if (!channelId || !channelQuery.data) return

    const channel = channelQuery.data.find((c) => c.id === channelId)
    form.setFieldValue('discordChannel', {
      id: channelId,
      name: channel?.name || '',
    })
    setDiscordChannel('laughLoss', { id: channelId, name: channel?.name || '' })
    messagesMutation.mutate(channelId)
  }
}

export default LaughLoss
