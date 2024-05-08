import React from 'react'

import { useNavigate } from 'react-router-dom'
import { useDisclosure } from '@mantine/hooks'
import { useForm, zodResolver } from '@mantine/form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Transition,
  Container,
  Center,
  Button,
  Stack,
  Select,
  Text,
  Divider,
  Image,
  Title,
} from '@mantine/core'

import { type Step1Type, Step1Schema } from '@global/types/src/consultorio'

import { DiscordRepo } from '@src/db'
import { ROUTES } from '@src/constants/routes'
import { useStoreBase, useStoreConsultorio } from '@src/store'
import {
  ChannelResponseType,
  EmojiType,
  GetMessagesParamsType,
  MessageResponseType,
} from '@global/types/src/discord'

import Media from '@components/media'
import OverlayScreen from '@src/components/shared/OverlayScreen'
import Loading from '@components/shared/Loading'
import SliderHUD from '@components/shared/SliderHUD'

import { useSliderMedia } from '@hooks/slider'

import { Logger } from '@global/utils/src'
import { transitionView } from '@src/utils/viewTransition'

import { notifications } from '@mantine/notifications'
import { EMOJIS } from '@src/constants/emoji'
import { IconChevronLeft } from '@tabler/icons-react'

import Doctor from '@assets/images/consultorio.png'

const Consultorio = () => {
  const { selectedGuild } = useStoreBase((state) => state)
  const {
    emoji,
    messages,
    publicChannel,
    privateChannel,
    currentMessage,
    setEmoji,
    setMessages,
    setDiscordChannel,
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
      publicChannel,
      privateChannel,
    },
  })

  const emojisQuery = useQuery<EmojiType[] | null, Error>({
    queryKey: ['discordEmojis'],
    queryFn: async () => DiscordRepo.getEmojis({ guildId: selectedGuild!.id }),
    enabled: !messages,
  })

  const channelQuery = useQuery<ChannelResponseType[] | null, Error>({
    queryKey: ['discordChannels'],
    enabled: !messages,
    queryFn: () => DiscordRepo.getChannels({ guildId: selectedGuild!.id, channelType: 0 }),
  })

  const messagesMutation = useMutation<
    MessageResponseType[] | null,
    Error,
    GetMessagesParamsType['channels'],
    GetMessagesParamsType['channels']
  >({
    mutationFn: async (channels) =>
      await DiscordRepo.getMessages({
        guildId: selectedGuild!.id,
        shuffle: true,
        channels,
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
                Espero que les haya funcionado los consejos o terapia{' '}
                <Image alt="Reddit" className="!cd-inline" h={30} src={EMOJIS.BAITY_LOVE} w={30} />
              </Text>
            }
            styles={styles}
            title="¡Fin del consultorio!"
          >
            <OverlayScreen.ActionButtons>
              <Button
                onClick={() => {
                  handleReset()
                  transitionView(() => navigate(ROUTES.HOME))
                }}
              >
                Ir a Inicio
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reiniciar
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
        <Loading show={!gameOver && channelQuery.isLoading} text="Cargando información" />

        {!gameOver && !messages?.length && channelQuery.data && emojisQuery.data && (
          <form
            className="cd-h-full cd-w-full"
            onSubmit={form.onSubmit(({ emoji, privateChannel, publicChannel }) => {
              const channels: GetMessagesParamsType['channels'] = []

              if (privateChannel) channels.push({ id: privateChannel.id })

              if (publicChannel)
                channels.push({
                  id: publicChannel.id,
                  filters: {
                    emojiName: emoji?.name,
                  },
                })

              return messagesMutation.mutate(channels)
            })}
          >
            <Center className="cd-pt-[4rem]">
              <Stack>
                <Title order={2}>Baity consultorio</Title>
                <Image
                  alt="Consultorio"
                  className="baity-consultorio-transition"
                  fit="cover"
                  mah={300}
                  mih={300}
                  radius="md"
                  src={Doctor}
                />
                <Divider orientation="horizontal" size="xs" />
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
                  clearable
                  searchable
                  data={channelQuery.data.map((c) => ({ value: c.id, label: c.name })) || []}
                  label="Canal público"
                  placeholder="Selecciona un canal público"
                  {...form.getInputProps('discordChannels')}
                  className="cd-w-[450px]"
                  comboboxProps={{ transitionProps: { transition: 'pop', duration: 250 } }}
                  value={form.values.publicChannel?.id}
                  onChange={(channelId) => handleChannelChange('publicChannel', channelId)}
                />
                <Divider mt="xs" orientation="horizontal" size="xs" variant="dashed" />
                <Select
                  clearable
                  searchable
                  data={channelQuery.data.map((c) => ({ value: c.id, label: c.name })) || []}
                  label="Canal privado"
                  placeholder="Selecciona un canal privado"
                  {...form.getInputProps('discordChannels')}
                  className="cd-w-[450px]"
                  comboboxProps={{ transitionProps: { transition: 'pop', duration: 250 } }}
                  value={form.values.privateChannel?.id}
                  onChange={(channelId) => handleChannelChange('privateChannel', channelId)}
                />
                <Button
                  className="cd-mt-4"
                  disabled={
                    !form.isValid() ||
                    Boolean(!form.values.privateChannel && !form.values.publicChannel)
                  }
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
                goNextMessage={hasNext ? goNextMessage : handleGameOver}
                goPrevMessage={goPrevMessage}
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

  function handleChannelChange(type: 'publicChannel' | 'privateChannel', channelId: string | null) {
    if (!channelQuery.data) return

    const channel = channelQuery.data.find((c) => channelId === c.id)
    form.setFieldValue(type, channel)
    setDiscordChannel(type, channel)
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
