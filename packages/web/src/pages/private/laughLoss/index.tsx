import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDisclosure } from '@mantine/hooks'
import { useForm, zodResolver } from '@mantine/form'
import {
  Transition,
  Container,
  Divider,
  Select,
  Button,
  Center,
  Stack,
  Text,
  Image,
  Title,
} from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { type Step1Type, Step1Schema } from '@global/types/src/laughLoss'

import { DiscordRepo } from '@src/db'
import { useStoreBase, useStoreLaughLoss } from '@src/store'
import {
  ChannelResponseType,
  EmojiType,
  GetMessagesParamsType,
  MessageResponseType,
} from '@global/types/src/discord'
import { ROUTES } from '@src/constants/routes'

import Media from '@components/media'
import OverlayScreen from '@src/components/shared/OverlayScreen'
import Loading from '@components/shared/Loading'
import SliderHUD from '@components/shared/SliderHUD'

import { useSliderMedia } from '@hooks/slider'

import { ErrorService, Logger } from '@global/utils/src'
import { transitionView } from '@src/utils/viewTransition'

import { notifications } from '@mantine/notifications'
import { EMOJIS } from '@src/constants/emoji'
import { IconChevronLeft } from '@tabler/icons-react'

import LaughLossImg from '@assets/images/si_ries_pierdes.jpg'

const DELAY_TRANSITION = 250

const LaughLoss = () => {
  const { selectedGuild } = useStoreBase((state) => state)
  const {
    messages,
    discordChannel,
    currentMessage,
    setEmoji,
    setMessages,
    setDiscordChannel,
    setCurrentMessage,
    reset,
  } = useStoreLaughLoss((state) => state)

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [autoPlay, handlersPlay] = useDisclosure(false)
  const [gameOver, handlersGameOver] = useDisclosure(false)
  const [alreadyPlayed, handlersPlayed] = useDisclosure(false)

  const form = useForm<Step1Type>({
    validate: zodResolver(Step1Schema),
    initialValues: {
      emoji: null,
      discordChannel: {
        id: '',
        name: '',
      },
    },
  })

  const emojisQuery = useQuery<EmojiType[] | null, ErrorService>({
    queryKey: ['discordEmojis'],
    queryFn: async () => DiscordRepo.getEmojis({ guildId: selectedGuild!.id }),
    enabled: !messages,
  })

  const channelQuery = useQuery<ChannelResponseType[] | null, ErrorService>({
    queryKey: ['discordChannels'],
    enabled: !discordChannel,
    queryFn: () => DiscordRepo.getChannels({ guildId: selectedGuild!.id, channelType: 0 }),
  })

  const messagesMutation = useMutation<
    MessageResponseType[] | null,
    ErrorService,
    GetMessagesParamsType['channels'],
    GetMessagesParamsType['channels']
  >({
    mutationFn: async (channels) =>
      await DiscordRepo.getMessages({
        guildId: selectedGuild!.id,
        channels,
        shuffle: true,
      }),
    onSuccess: (messages) => {
      setMessages(messages)
      setCurrentMessage(currentMessage || messages?.[0] || null)
    },
    onError: (error) => {
      Logger.error('Error getting messages', error)
      notifications.show({
        color: 'red',
        title: 'Error al obtener los mensajes',
        message: ErrorService.getMessageFromCode(error.code) || 'Error al obtener los mensajes',
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
        message:
          ErrorService.getMessageFromCode(channelQuery.error.code) ||
          'Error al obtener los canales',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelQuery.isError])

  return (
    <Container fluid className="cd-w-full cd-h-full cd-relative" p={0}>
      {!messages?.length && (
        <Button
          className="!cd-absolute cd-z-50"
          leftSection={<IconChevronLeft />}
          variant="transparent"
          onClick={() => {
            handleReset()
            transitionView(() => navigate(ROUTES.HOME))
          }}
        >
          Volver
        </Button>
      )}
      <Transition duration={650} mounted={gameOver} timingFunction="ease" transition="fade">
        {(styles) => (
          <OverlayScreen
            description={
              <Text>
                Has completado el reto, ahora paga{' '}
                <Image alt="Baity" className="!cd-inline" h={30} src={EMOJIS.BAITY_DEDO} w={30} />
              </Text>
            }
            styles={styles}
            title="¡Felicidades!"
          >
            <OverlayScreen.ActionButtons>
              <Button
                onClick={() => {
                  handleReset()
                  transitionView(() => navigate(ROUTES.HOME))
                }}
              >
                Ir al inicio
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reiniciar
              </Button>
            </OverlayScreen.ActionButtons>
          </OverlayScreen>
        )}
      </Transition>
      <Transition
        duration={650}
        mounted={alreadyPlayed && !autoPlay && !gameOver && Boolean(messages?.length)}
        timingFunction="ease"
        transition="fade"
      >
        {(styles) => (
          <OverlayScreen
            description={
              <Text>
                ¿Acaso Baity pausó la cadena de videos?{' '}
                <Image alt="Baity" className="!cd-inline" h={30} src={EMOJIS.BAITY_DEDO} w={30} />
              </Text>
            }
            styles={styles}
            title="¡TONGO!"
          >
            <OverlayScreen.ActionButtons>
              <Button
                onClick={() => {
                  //handlersPlayed.close()
                  handlersPlay.open()
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
        {!gameOver && !messages?.length && (
          <form
            className="cd-h-full cd-w-full"
            onSubmit={form.onSubmit(({ discordChannel }) =>
              messagesMutation.mutate([
                {
                  id: discordChannel.id,
                  filters: {
                    hasAttachments: true,
                    emojiName: form.values.emoji?.name,
                  },
                },
              ]),
            )}
          >
            <Center className="cd-pt-[4rem]">
              <Stack>
                <Title order={2}>Si te ríes pierdes</Title>
                <Image
                  alt="Si te ríes pierdes"
                  className="laugh-loss-transition"
                  fit="cover"
                  mah={300}
                  mih={300}
                  radius="md"
                  src={LaughLossImg}
                />
                <Divider orientation="horizontal" size="xs" />
                <Loading
                  className="cd-mt-[4rem]"
                  show={!gameOver && channelQuery.isLoading}
                  text="Cargando información"
                />
                {!gameOver && !messages?.length && channelQuery.data && emojisQuery.data && (
                  <React.Fragment>
                    <Select
                      clearable
                      searchable
                      className="cd-w-[450px]"
                      data={emojisQuery.data.map((e) => ({ value: e.name, label: e.name })) || []}
                      label="Emoji"
                      {...form.getInputProps('emoji')}
                      leftSection={
                        form.values.emoji?.imageURL ? (
                          <img
                            alt="emoji"
                            className="cd-w-6 cd-h-6"
                            src={form.values.emoji?.imageURL || ''}
                          />
                        ) : undefined
                      }
                      placeholder="Selecciona un emoji que será el sello de calidad"
                      renderOption={({ option: { value } }) => {
                        const e = emojisQuery.data!.find((e) => e.name === value)
                        if (!e) return null
                        return (
                          <div className="cd-flex cd-items-center cd-justify-start cd-gap-[0.5rem]">
                            <img alt={e.name} className="cd-w-8 cd-h-8" src={e.imageURL || ''} />
                            <Text fz="sm">{e.name}</Text>
                          </div>
                        )
                      }}
                      value={form.values.emoji?.name}
                      onChange={handleEmojiChange}
                    />
                    <Select
                      withAsterisk
                      data={channelQuery.data.map((c) => ({ value: c.id, label: c.name })) || []}
                      label="Canal"
                      placeholder="Selecciona un canal"
                      value={form.values.discordChannel.id}
                      {...form.getInputProps('discordChannel.id')}
                      className="cd-w-[450px]"
                      onChange={handleChannelChange}
                    />
                    <Button
                      fullWidth
                      className="cd-mt-[1rem]"
                      disabled={!form.isValid()}
                      loaderProps={{ type: 'dots' }}
                      loading={messagesMutation.isPending && !messagesMutation.isIdle}
                      type="submit"
                      variant="filled"
                    >
                      Obtener mensajes
                    </Button>
                  </React.Fragment>
                )}
              </Stack>
            </Center>
          </form>
        )}

        <SliderHUD
          useShadowCorners
          currentIndex={currentIndex}
          currentMessage={currentMessage}
          goNextMessage={goNextMessage}
          goPrevMessage={goPrevMessage}
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
                disableSkipVideos
                autoPlay={autoPlay}
                goNextMessage={goNextMessage}
                goPrevMessage={goPrevMessage}
                index={currentIndex}
                message={currentMessage}
                styles={styles}
                onVideoEnd={() => {
                  handlersPlay.open()
                  handleGameOver()
                }}
                onVideoPause={handlersPlay.close}
                onVideoPlay={() => {
                  handlersPlay.open()
                  handlersPlayed.open()
                }}
              />
            )}
          </Transition>
        )}
      </Container>
    </Container>
  )

  function handleEmojiChange(emojiId: string | null) {
    const isSameEmoji = emojiId === form.values.emoji?.id
    if (!emojisQuery.data || isSameEmoji) return

    const emoji = emojisQuery.data.find((e) => e.name === emojiId)
    form.setFieldValue('emoji', emoji)
    setEmoji(emoji)
  }

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
    handlersPlay.close()
    handlersGameOver.open()
    useStoreLaughLoss.persist.clearStorage()
  }

  function handleReset() {
    queryClient.invalidateQueries({
      queryKey: ['discordChannels'],
    })
    form.reset()
    reset()
    handlersPlay.close()
    handlersPlayed.close()
    handlersGameOver.close()
  }
}

export default LaughLoss
