import React from 'react'

import { useNavigate } from 'react-router-dom'
import { useDisclosure } from '@mantine/hooks'
import { useForm, zodResolver } from '@mantine/form'
import { Transition, Container, Select, Center, Button } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { type Step1Type, Step1Schema } from '@global/types/src/consultorio'

import { DiscordRepo } from '@src/db'
import { ROUTES } from '@src/constants/routes'
import { useStoreConsultorio } from '@src/store'
import { ChannelResponseType, MessageResponseType } from '@global/types/src/discord'

import { backTransition } from '@utils/viewTransition'

import Media from '@components/media'
import OverlayScreen from '@src/components/shared/OverlayScreen'
import Loading from '@components/shared/Loading'
import SliderHUD from '@components/shared/SliderHUD'

import { useSliderMedia } from '@hooks/slider'

import { Logger } from '@global/utils/src'
import { notifications } from '@mantine/notifications'

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
      notifications.show({
        color: 'red',
        title: 'Error al obtener mensajes',
        message: error.message || 'Error al obtener mensajes',
      })
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

  React.useEffect(() => {
    backTransition(() => navigate(-1))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Clear storage if there are no more messages
  React.useEffect(() => {
    if (discordChannel && !messages) {
      messagesMutation.mutate(discordChannel.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discordChannel])

  React.useEffect(() => {
    if (channelQuery.isError) {
      Logger.error('Error getting channels', channelQuery.error)
      notifications.show({
        color: 'red',
        title: 'Error al obtener canales',
        message: channelQuery.error.message || 'Error al obtener canales',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelQuery.isError])

  return (
    <Container fluid className="cd-w-full cd-h-full cd-relative baity-consultorio-transition" p={0}>
      <Transition duration={650} mounted={gameOver} timingFunction="ease" transition="fade">
        {(styles) => (
          <OverlayScreen
            description="Espero que les haya funcionado los consejos o terapia :baitylove:"
            styles={styles}
            title="¡Fin del consultorio!"
          >
            <OverlayScreen.ActionButtons>
              <Button
                onClick={() => {
                  handleReset()
                  navigate(ROUTES.HOME)
                }}
              >
                Ir a Inicio
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Repetir
              </Button>
            </OverlayScreen.ActionButtons>
          </OverlayScreen>
        )}
      </Transition>

      <Container
        className="cd-w-full cd-h-full cd-relative"
        fluid={currentMessage ? true : undefined}
        p={0}
        size="md"
      >
        <Loading show={!gameOver && channelQuery.isLoading} text="Cargando canales" />

        <Loading
          show={!gameOver && messagesMutation.isPending && !currentMessage}
          text="Cargando mensajes"
        />

        {!gameOver && !discordChannel && channelQuery.data && (
          <form
            className="cd-h-full cd-w-full"
            onSubmit={form.onSubmit((values) => console.log(values))}
          >
            <Center className="cd-h-full">
              <Select
                data={channelQuery.data.map((c) => ({ value: c.id, label: c.name })) || []}
                label="Canal"
                placeholder="Selecciona un canal"
                value={form.values.discordChannel.id}
                {...form.getInputProps('discordChannel.id')}
                className="cd-w-[400px]"
                onChange={handleChannelChange}
              />
            </Center>
          </form>
        )}

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
          show={!gameOver && messages && Boolean(messages.length)}
        />

        {currentMessage && (
          <Transition
            duration={500}
            mounted={showAnimation}
            timingFunction="ease"
            transition="fade"
          >
            {(styles) => (
              <Media
                useMediaControls
                goNextMessage={goNextMessage}
                message={currentMessage}
                styles={styles}
                onVideoEnd={handleGameOver}
              />
            )}
          </Transition>
        )}
      </Container>
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
