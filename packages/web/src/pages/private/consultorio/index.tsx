import React from 'react'

import { useNavigate } from 'react-router-dom'
import { useDisclosure } from '@mantine/hooks'
import { useForm, zodResolver } from '@mantine/form'
import { Transition, Container, Select, Center } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { type Step1Type, Step1Schema } from '@global/types/src/consultorio'

import { DiscordRepo } from '@src/db'
import { ROUTES } from '@src/constants/routes'
import { useStoreConsultorio } from '@src/store'
import { ChannelResponseType, MessageResponseType } from '@global/types/src/discord'

import Media from '@src/components/media'
import Loading from '@src/components/shared/loading'
import SliderHUD from '@src/shared/SliderHUD'

import { useSliderMedia } from '@hooks/slider'

import { Logger } from '@global/utils/src/log'
import EndGame from '@src/shared/EndGame'

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

  const { showAnimation, goNextMessage, goPrevMessage, currentIndex, hasNext, hasPrev } =
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
          <EndGame
            description="Espero que les haya funcionado los consejos o terapia :baitylove:"
            handleGoHome={() => {
              handleReset()
              navigate(ROUTES.HOME)
            }}
            handleReset={handleReset}
            styles={styles}
            title="¡Fin del consultorio!"
          />
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
          <SliderHUD
            currentIndex={currentIndex}
            currentMessage={currentMessage}
            goNextMessage={hasNext ? goNextMessage : handleGameOver}
            goPrevMessage={goPrevMessage}
            handleReset={handleReset}
            hasNext={!gameOver}
            hasPrev={hasPrev}
            labelCounter="mensajes"
            messages={messages}
          />
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
                    goNextMessage={goNextMessage}
                    message={currentMessage}
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
