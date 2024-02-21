import React from 'react'
import {
  IconRestore,
  IconPlayerTrackNextFilled,
  IconPlayerTrackPrevFilled,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useDisclosure } from '@mantine/hooks'
import { useForm, zodResolver } from '@mantine/form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Transition,
  ActionIcon,
  Container,
  Avatar,
  Select,
  Button,
  Group,
  Title,
  Text,
  Flex,
  Center,
} from '@mantine/core'

import { type Step1Type, Step1Schema } from '@global/types/src/consultorio'

import { DiscordRepo } from '@src/db'
import { ROUTES } from '@src/constants/routes'
import { useStoreConsultorio } from '@src/store'
import { ChannelResponseType, MessageResponseType } from '@global/types/src/discord'

import Media from '@src/components/media'
import Loading from '@src/components/shared/loading'

import { useSliderMedia } from '@hooks/slider'

import { Logger } from '@global/utils/src/log'

const Consultorio = () => {
  const {
    messages,
    discordChannel,
    currentMessage,
    setMessages,
    setDiscordChannel,
    setCurrentMessage,
    reset,
  } = useStoreConsultorio((state) => state)

  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
    mutationFn: async (channelId: string) => DiscordRepo.getMessages({ channelId }),
    onSuccess: (messages) => {
      setMessages(messages)
      setCurrentMessage(currentMessage || messages?.[0] || null)
    },
    onError: (error) => {
      Logger.error('Error getting messages', error)
    },
  })

  const [gameOver, handlersGameOver] = useDisclosure(false)

  const { showAnimation, nextMessage, prevMessage, currentIndex, hasNext, hasPrev } =
    useSliderMedia({
      messages,
      currentMessage,
      setCurrentMessage,
      useTransition: true,
    })

  // Clear storage if there are no more messages
  React.useEffect(() => {
    if (discordChannel && !messages) {
      messagesMutation.mutate(discordChannel.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discordChannel])

  return (
    <React.Fragment>
      <Transition duration={650} mounted={gameOver} timingFunction="ease" transition="fade">
        {(styles) => (
          <Flex
            align="center"
            className="cd-h-full cd-w-full cd-absolute cd-bg-black cd-bg-opacity-90 cd-z-50"
            direction="column"
            justify="center"
            style={styles}
          >
            <Title c="white">¡Felicidades!</Title>
            <Text fz="xl">Has completado el reto, ahora paga :baitydedo:</Text>
            <Group pt={16}>
              <Button
                variant="filled"
                onClick={() => {
                  handleReset()
                  navigate(ROUTES.HOME)
                }}
              >
                Ir a Inicio
              </Button>
              <Button variant="light" onClick={handleReset}>
                Repetir
              </Button>
            </Group>
          </Flex>
        )}
      </Transition>
      <Container
        className="cd-w-full cd-h-full cd-relative"
        fluid={currentMessage ? true : undefined}
        p={0}
        size="md"
      >
        {!gameOver && channelQuery.isLoading && <Loading text="Cargando canales" />}
        {!gameOver && messagesMutation.isPending && !currentMessage && (
          <Loading text="Cargando mensajes" />
        )}
        {!gameOver && !discordChannel && channelQuery.data && (
          <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <Select
              data={channelQuery.data.map((c) => ({ value: c.id, label: c.name })) || []}
              label="Canal"
              value={form.values.discordChannel.id}
              {...form.getInputProps('discordChannel.id')}
              className="cd-pt-8"
              onChange={handleChannelChange}
            />
          </form>
        )}
        {!gameOver && messages && Boolean(messages.length) && (
          <React.Fragment>
            {/* bg-controls-right */}
            {currentMessage && (
              <div className="cd-absolute cd-top-0 cd-left-0 cd-z-50 cd-pl-[1rem] cd-pt-[0.5rem] cd-pr-[10rem] cd-pb-[4rem]">
                <Flex align="center" direction="row" gap="md" justify="center">
                  <Avatar size="lg" src={currentMessage.author.avatar} />
                  <Text>{currentMessage.author.globalName}</Text>
                </Flex>
              </div>
            )}

            {/* bg-controls-left */}
            <div className="cd-absolute cd-top-0 cd-right-0 cd-z-50 cd-pl-[10rem] cd-pt-[0.5rem] cd-pr-[1rem] cd-pb-[4rem]">
              <Flex align="flex-end" direction="column" gap="xs" justify="center">
                <Text c="violet.3">
                  {currentIndex + 1} / {messages.length} mensajes
                </Text>
                <ActionIcon size="sm" variant="subtle" onClick={handleReset}>
                  <IconRestore />
                </ActionIcon>
              </Flex>
            </div>

            <div className="cd-absolute cd-top-[50%] cd-left-[16px] cd-z-50">
              <ActionIcon disabled={!hasPrev} size="xl" variant="subtle" onClick={prevMessage}>
                <IconPlayerTrackPrevFilled />
              </ActionIcon>
            </div>

            <div className="cd-absolute cd-top-[50%] cd-right-[16px] cd-z-50">
              <ActionIcon disabled={!hasNext} size="xl" variant="subtle" onClick={nextMessage}>
                <IconPlayerTrackNextFilled />
              </ActionIcon>
            </div>
          </React.Fragment>
        )}

        {currentMessage && (
          <Container className="cd-h-full cd-relative" size="md">
            <Center className="cd-h-full">
              <Transition
                duration={500}
                mounted={showAnimation}
                timingFunction="ease"
                transition="fade"
              >
                {(styles) => (
                  <Media
                    message={currentMessage}
                    nextMessage={nextMessage}
                    styles={styles}
                    onVideoEnd={handleGameOver}
                  />
                )}
              </Transition>
            </Center>
          </Container>
        )}
      </Container>
    </React.Fragment>
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

  function handleGameOver() {
    if (hasNext) return
    handlersGameOver.open()
    useStoreConsultorio.persist.clearStorage()
  }

  function handleReset() {
    queryClient.invalidateQueries({
      queryKey: ['discordChannels'],
    })
    form.reset()
    reset()
    handlersGameOver.close()
  }
}

export default Consultorio
