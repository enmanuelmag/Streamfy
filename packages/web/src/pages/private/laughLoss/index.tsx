import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDisclosure } from '@mantine/hooks'
import { useForm, zodResolver } from '@mantine/form'
import { Transition, Container, Select, Button, Center, Stack } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { type Step1Type, Step1Schema } from '@global/types/src/laughLoss'

import { DiscordRepo } from '@src/db'
import { useStoreLaughLoss } from '@src/store'
import { ChannelResponseType, MessageResponseType } from '@global/types/src/discord'
import { ROUTES } from '@src/constants/routes'

import Media from '@components/media'
import OverlayScreen from '@src/components/shared/OverlayScreen'
import Loading from '@components/shared/Loading'
import SliderHUD from '@components/shared/SliderHUD'

import { useSliderMedia } from '@hooks/slider'

import { Logger } from '@global/utils/src'

import { notifications } from '@mantine/notifications'

const DELAY_TRANSITION = 250

const LaughLoss = () => {
  const {
    messages,
    discordChannel,
    currentMessage,
    setMessages,
    setDiscordChannel,
    setCurrentMessage,
    reset,
  } = useStoreLaughLoss((state) => state)

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [autoPlay, handlers] = useDisclosure(false)
  const [gameOver, handlersGameOver] = useDisclosure(false)
  const [alreadyPlayed, handlersPlayed] = useDisclosure(false)

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
    mutationFn: async (channelId: string) => {
      const messages = await DiscordRepo.getMessages({ channelIds: [channelId] })
      return messages?.filter((m) => m.attachments.length) || null
    },
    onSuccess: (messages) => {
      setMessages(messages)
      setCurrentMessage(currentMessage || messages?.[0] || null)
    },
    onError: (error) => {
      Logger.error('Error getting messages', error)
      notifications.show({
        color: 'red',
        title: 'Error al obtener los mensajes',
        message: error.message || 'Error al obtener los mensajes',
      })
    },
  })

  const { showAnimation, goNextMessage, goPrevMessage, currentIndex, hasNext, hasPrev } =
    useSliderMedia({
      messages,
      currentMessage,
      setCurrentMessage,
      useTransition: true,
      delay: DELAY_TRANSITION,
    })

  React.useEffect(() => {
    if (channelQuery.isError) {
      Logger.error('Error getting channels', channelQuery.error)
      notifications.show({
        color: 'red',
        title: 'Error al obtener los canales',
        message: channelQuery.error.message || 'Error al obtener los canales',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelQuery.isError])

  return (
    <Container fluid className="cd-w-full cd-h-full cd-relative laugh-loss-transition" p={0}>
      <Transition duration={650} mounted={gameOver} timingFunction="ease" transition="fade">
        {(styles) => (
          <OverlayScreen
            description="Has completado el reto, ahora paga :baitydedo:"
            styles={styles}
            title="¡Felicidades!"
          >
            <OverlayScreen.ActionButtons>
              <Button
                onClick={() => {
                  handleReset()
                  navigate(ROUTES.HOME)
                }}
              >
                Ir al inicio
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Repetir
              </Button>
            </OverlayScreen.ActionButtons>
          </OverlayScreen>
        )}
      </Transition>
      <Transition
        duration={650}
        mounted={alreadyPlayed && !autoPlay && Boolean(messages?.length)}
        timingFunction="ease"
        transition="fade"
      >
        {(styles) => (
          <OverlayScreen
            description="¿Acaso Baity pausó la cadena de videos? :baitydedo:"
            styles={styles}
            title="¡TONGO!"
          >
            <OverlayScreen.ActionButtons>
              <Button
                onClick={() => {
                  handlersPlayed.close()
                  handlers.open()
                }}
              >
                Continuar
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

        {!gameOver && !messages?.length && channelQuery.data && (
          <form
            className="cd-h-full cd-w-full"
            onSubmit={form.onSubmit(({ discordChannel }) =>
              messagesMutation.mutate(discordChannel.id),
            )}
          >
            <Center className="cd-h-full">
              <Stack>
                <Select
                  data={channelQuery.data.map((c) => ({ value: c.id, label: c.name })) || []}
                  label="Canal"
                  placeholder="Selecciona un canal"
                  value={form.values.discordChannel.id}
                  {...form.getInputProps('discordChannel.id')}
                  className="cd-w-[400px]"
                  onChange={handleChannelChange}
                />
                <Button
                  className="cd-mt-4"
                  disabled={!form.isValid()}
                  loaderProps={{ type: 'dots' }}
                  loading={messagesMutation.isPending && !messagesMutation.isIdle}
                  type="submit"
                  variant="filled"
                >
                  Obtener mensajes
                </Button>
              </Stack>
            </Center>
          </form>
        )}

        <SliderHUD
          useShadowCorners
          autoPlay={autoPlay}
          currentIndex={currentIndex}
          currentMessage={currentMessage}
          goNextMessage={goNextMessage}
          goPrevMessage={goPrevMessage}
          handleAutoPlay={() => {
            handlers.toggle()
            handlersPlayed.open()
          }}
          handleReset={handleReset}
          hasNext={hasNext}
          hasPrev={hasPrev}
          labelCounter="videos"
          messages={messages}
          show={!gameOver && messages && Boolean(messages.length)}
        />

        {currentMessage && (
          <Transition
            duration={DELAY_TRANSITION}
            mounted={showAnimation}
            timingFunction="ease"
            transition="fade"
          >
            {(styles) => (
              <Media
                autoPlay={autoPlay}
                goNextMessage={goNextMessage}
                message={currentMessage}
                styles={styles}
                onVideoEnd={() => {
                  handlers.open()
                  handleGameOver()
                }}
                //onVideoPause={handlers.close}
                onVideoPlay={() => {
                  handlers.open()
                  handlersPlayed.open()
                }}
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
  }

  function handleGameOver() {
    if (hasNext) return
    handlersGameOver.open()
    useStoreLaughLoss.persist.clearStorage()
  }

  function handleReset() {
    queryClient.invalidateQueries({
      queryKey: ['discordChannels'],
    })
    form.reset()
    reset()
    handlers.close()
    handlersPlayed.close()
    handlersGameOver.close()
  }
}

export default LaughLoss
