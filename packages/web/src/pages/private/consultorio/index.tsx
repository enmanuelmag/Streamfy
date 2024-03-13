import React from 'react'

import { useNavigate } from 'react-router-dom'
import { useDisclosure } from '@mantine/hooks'
import { useForm, zodResolver } from '@mantine/form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Transition,
  Container,
  MultiSelect,
  Center,
  Button,
  Stack,
  Select,
  Text,
} from '@mantine/core'

import { type Step1Type, Step1Schema } from '@global/types/src/consultorio'

import { DiscordRepo } from '@src/db'
import { ROUTES } from '@src/constants/routes'
import { useStoreConsultorio } from '@src/store'
import { ChannelResponseType, EmojiType, MessageResponseType } from '@global/types/src/discord'

import Media from '@components/media'
import OverlayScreen from '@src/components/shared/OverlayScreen'
import Loading from '@components/shared/Loading'
import SliderHUD from '@components/shared/SliderHUD'

import { useSliderMedia } from '@hooks/slider'

import { Logger } from '@global/utils/src'
import { notifications } from '@mantine/notifications'

type MutateMessagesType = {
  channelIds: string[]
  emojiName?: string
}

const Consultorio = () => {
  const {
    emoji,
    messages,
    discordChannels,
    currentMessage,
    setEmoji,
    setMessages,
    setDiscordChannels,
    setCurrentMessage,
    reset,
  } = useStoreConsultorio((state) => state)

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [gameOver, handlersGameOver] = useDisclosure(false)

  const form = useForm<Step1Type>({
    validate: zodResolver(Step1Schema),
    initialValues: {
      emoji,
      discordChannels: [],
    },
  })

  const emojisQuery = useQuery<EmojiType[] | null, Error>({
    queryKey: ['discordEmojis'],
    queryFn: async () => DiscordRepo.getEmojis(),
    enabled: !discordChannels?.length || !messages,
  })

  const channelQuery = useQuery<ChannelResponseType[] | null, Error>({
    queryKey: ['discordChannels'],
    enabled: !discordChannels?.length || !messages,
    queryFn: () => DiscordRepo.getChannels({ channelType: 0 }),
  })

  const messagesMutation = useMutation<
    MessageResponseType[] | null,
    Error,
    MutateMessagesType,
    MutateMessagesType
  >({
    mutationFn: async ({ channelIds, emojiName }: MutateMessagesType) =>
      await DiscordRepo.getMessages({
        channelIds,
        shuffle: true,
        filters: {
          emojiName,
        },
      }),
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

  const { showAnimation, goNextMessage, goPrevMessage, currentIndex, hasNext, hasPrev } =
    useSliderMedia({
      messages,
      currentMessage,
      setCurrentMessage,
      useTransition: true,
    })

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

        {!gameOver && !messages?.length && channelQuery.data && emojisQuery.data && (
          <form
            className="cd-h-full cd-w-full"
            onSubmit={form.onSubmit(({ discordChannels }) =>
              messagesMutation.mutate({
                channelIds: discordChannels.map((c) => c.id),
                emojiName: emoji?.name || undefined,
              }),
            )}
          >
            <Center className="cd-h-full">
              <Stack>
                <Select
                  clearable
                  searchable
                  className="cd-w-[450px]"
                  data={emojisQuery.data.map((e) => ({ value: e.name, label: e.name })) || []}
                  label="Emoji"
                  {...form.getInputProps('emoji')}
                  leftSection={
                    emoji?.imageURL ? (
                      <img alt="emoji" className="cd-w-6 cd-h-6" src={emoji.imageURL || ''} />
                    ) : undefined
                  }
                  placeholder="Selecciona un emoji"
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
                <MultiSelect
                  clearable
                  hidePickedOptions
                  searchable
                  withAsterisk
                  data={channelQuery.data.map((c) => ({ value: c.id, label: c.name })) || []}
                  label="Canales de Discord"
                  placeholder="Selecciona uno o varios canales"
                  {...form.getInputProps('discordChannels')}
                  className="cd-w-[450px]"
                  comboboxProps={{ transitionProps: { transition: 'pop', duration: 250 } }}
                  value={form.values.discordChannels.map((c) => c.id) || []}
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

  function handleEmojiChange(emojiId: string | null) {
    const isSameEmoji = emojiId === form.values.emoji?.id
    if (!emojisQuery.data || isSameEmoji) return

    const emoji = emojisQuery.data.find((e) => e.name === emojiId)
    form.setFieldValue('emoji', emoji)
    setEmoji(emoji)
  }

  function handleChannelChange(channelIds: string[]) {
    if (!channelQuery.data) return

    const channels = channelQuery.data.filter((c) => channelIds.includes(c.id))
    form.setFieldValue('discordChannels', channels)
    setDiscordChannels(channels)
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
