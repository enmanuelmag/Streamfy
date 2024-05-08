import { Anchor, AppShell, Avatar, Button, Text, Title, Container } from '@mantine/core'
import { ROUTES } from '@src/constants/routes'
import { useStoreBase } from '@src/store'
import { useNavigate } from 'react-router-dom'
import { TypeAnimation } from 'react-type-animation'

import '../styles.scss'

function Root() {
  const { user } = useStoreBase((state) => state)
  const navigate = useNavigate()
  console.log(user)

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
        </div>
      </AppShell.Header>
      <AppShell.Main>
        <Container>
          <div className="cd-mt-[4rem] cd-flex cd-flex-col cd-items-center cd-gap-[2rem]">
            <div className="cd-flex cd-flex-col cd-items-center">
              <TypeAnimation
                className="cd-text-violet-400 !cd-text-[2.125rem] !cd-font-bold text-animation-transition"
                repeat={Infinity}
                sequence={[
                  'La manera mas sencilla',
                  1000,
                  'La manera mas divertida',
                  1000,
                  'La manera mas fácil',
                  1000,
                  'La manera mas rápida',
                  1000,
                ]}
                speed={50}
                style={{ fontSize: '2em' }}
              />

              <Title c="white">de realizar actividades en stream!</Title>
            </div>
            <div>
              <Text c="gray" fz="xl" mt="xl">
                <Title c="white" mt="xl">
                  ¿Qué es Streamfy?
                </Title>
                Streamfy es una plataforma que te permite realizar actividades en stream de manera
                divertida y sencilla. Tales como Si te ríes pierdes, Reddit, entre otros.
              </Text>
            </div>
            <div>
              <Title c="white" mt="xl">
                ¿Qué esperas para comenzar?
              </Title>
              <Text c="gray" fz="xl">
                Streamfy usa la API de Discord para poder realizar actividades en stream. Por lo que
                los videos, imágenes y mensajes deben estar en un canal de Discord que luego puedes
                especificar en la plataforma.
              </Text>
            </div>
            <div>
              <Title c="white" mt="xl">
                Contacto
              </Title>
              <Text c="gray" fz="xl">
                Tiene alguna duda, sugerencia o petición. No dudes en contactarme a través de mi
                correo{' '}
                <Anchor c="violet.3" href="mailto:enmanuelmag@cardor.dev" size="xl">
                  enmanuelmag@cardor.dev
                </Anchor>
              </Text>
            </div>
          </div>
        </Container>
      </AppShell.Main>
    </AppShell>
  )

  function handleButtonLeft() {
    if (user) {
      navigate(ROUTES.HOME)
    } else {
      navigate(ROUTES.LOGIN)
    }
  }
}

export default Root
