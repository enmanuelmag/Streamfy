import { useStoreBase } from '@src/store'
import { ROUTES } from '@src/constants/routes'
import { useNavigate } from 'react-router-dom'
import { TypeAnimation } from 'react-type-animation'
import { IconBrandDiscordFilled } from '@tabler/icons-react'
import {
  Anchor,
  AppShell,
  Avatar,
  Button,
  Text,
  Title,
  Container,
  Center,
  Paper,
} from '@mantine/core'

import '../styles.scss'

const CURSOR_CLASS_NAME = 'custom-type-animation-cursor'

type SequenceElement = string | number | ((element: HTMLElement | null) => void | Promise<void>)
type Sequence = Array<SequenceElement>

function Root() {
  const { user } = useStoreBase((state) => state)
  const navigate = useNavigate()

  return (
    <AppShell
      header={{ height: 60 }}
      //navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      withBorder={false}
    >
      <AppShell.Header bg="violet" c="violet">
        <div className="cd-flex cd-h-full cd-justify-between">
          <div className="cd-flex cd-justify-start cd-items-center cd-h-full cd-pl-[2rem] cd-gap-[4rem]">
            <Title className="cd-title-form cd-text-white cd-h-[2rem]" key="main-title" order={3}>
              Streamfy
            </Title>
          </div>
          {Boolean(user) && (
            <div className="cd-h-full cd-flex cd-justify-end cd-items-center cd-pr-[2rem]">
              <Button
                leftSection={
                  user && (
                    <Avatar alt={user.username} color="white" radius="xl" src={user?.avatar}>
                      {user?.username.charAt(0)}
                    </Avatar>
                  )
                }
                variant="subtle"
                onClick={handleButtonLeft}
              >
                <Text c="white">{user ? 'Dashboard' : 'Iniciar sesión'}</Text>
              </Button>
            </div>
          )}
        </div>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="lg">
          <div className="cd-mt-[6rem] cd-flex cd-flex-col cd-items-center cd-gap-[2rem]">
            <div className="cd-flex cd-flex-col cd-items-center">
              <div className="cd-flex cd-flex-col md:cd-flex-row cd-items-center cd-gap-[0.75rem]">
                <Title c="white" className="!cd-text-[3rem] cd-text-center">
                  La manera mas
                </Title>
                <TypeAnimation
                  className={`cd-text-violet-400 !cd-text-[3rem] !cd-font-bold text-animation-transition ${CURSOR_CLASS_NAME}`}
                  cursor={false}
                  repeat={Infinity}
                  sequence={buildSequence()}
                  speed={50}
                  style={{ fontSize: '2em' }}
                />
              </div>
              <Title c="white" className="!cd-text-[3rem] cd-text-center">
                de realizar actividades en stream!
              </Title>
            </div>
            <div className="cd-text-center lg:cd-px-[6rem] md:cd-px-[3rem] sm:cd-px-[1rem]">
              <Text c="gray" fz="xl" mt="md">
                Streamfy es una plataforma que te permite realizar actividades en stream de manera
                divertida y sencilla. Tales como Si te ríes pierdes, Reddit, entre otros. Todo esto
                a través de la API de Discord.
              </Text>
              <Center className="cd-mt-[3rem]">
                <Button
                  component="a"
                  href={import.meta.env.VITE_LOGIN_WITH_DISCORD}
                  leftSection={<IconBrandDiscordFilled />}
                  mt="sm"
                  size="lg"
                  variant="filled"
                >
                  Iniciar sesión con Discord
                </Button>
              </Center>
            </div>
            <Paper
              withBorder
              className="cd-mt-[3rem] lg:!cd-px-[6rem] lg:!cd-py-[4rem] md:!cd-px-[3rem] md:!cd-py-[2rem] sm:!cd-px-[1rem] sm:!cd-py-[1rem]"
              p="xl"
              radius="md"
            >
              <div>
                <Title c="white">¿Qué esperas para comenzar?</Title>
                <Text c="gray" fz="xl">
                  Streamfy usa la API de Discord para poder realizar actividades en stream. Por lo
                  que los videos, imágenes y mensajes deben estar en un canal de Discord que luego
                  puedes especificar en la plataforma.
                </Text>
              </div>
              <div>
                <Title c="white" mt="xl">
                  Contacto
                </Title>
                <Text c="gray" fz="xl">
                  Tienes alguna duda, sugerencia o petición para solicitar el uso de la plataforma?
                  Contáctame a través de mi correo{' '}
                  <Anchor c="violet.3" href="mailto:enmanuelmag@cardor.dev" size="xl">
                    enmanuelmag@cardor.dev
                  </Anchor>
                </Text>
              </div>
            </Paper>
          </div>
        </Container>
      </AppShell.Main>
    </AppShell>
  )

  function buildSequence(): Sequence {
    const sequence = ['sencilla', 'divertida', 'fácil', 'rápida']

    const last = sequence.at(-1)

    let idx = 0
    let current = null
    const newSequence: Sequence = []

    while (current !== last) {
      current = sequence.at(idx) as string
      newSequence.push(
        current,
        (el) => el?.classList.remove(CURSOR_CLASS_NAME),
        1750,
        (el) => el?.classList.add(CURSOR_CLASS_NAME),
      )
      idx++
    }

    return newSequence
  }

  function handleButtonLeft() {
    if (user) {
      navigate(ROUTES.HOME)
    } else {
      navigate(ROUTES.LOGIN)
    }
  }
}

export default Root
