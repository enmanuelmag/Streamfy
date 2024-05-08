import React from 'react'
import { modals } from '@mantine/modals'
import { useDisclosure } from '@mantine/hooks'
import { useQuery } from '@tanstack/react-query'
import { IconHelp, IconLogout } from '@tabler/icons-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AppShell,
  Burger,
  Button,
  Drawer,
  Loader,
  Flex,
  Text,
  Title,
  ActionIcon,
  Stack,
  Kbd,
  Box,
  Group,
  Divider,
  Breadcrumbs,
} from '@mantine/core'

import { ROUTES } from '@src/constants/routes'
import { UserDiscordType } from '@global/types/src/discord'
import { useStoreBase, useStoreLaughLoss } from '@src/store'

import { DataRepo, DiscordRepo } from '@src/db'
import { transitionView } from '@src/utils/viewTransition'

import { Logger } from '@global/utils/src'

export const HEIGHT_DRAWER = 50

export default function Protected() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, selectedGuild, setUser } = useStoreBase((state) => state)
  const [opened, { open, close }] = useDisclosure()

  const userQuery = useQuery<UserDiscordType | null, Error>({
    enabled: !user,
    queryKey: ['user'],
    queryFn: async () => await DiscordRepo.getUser(),
  })

  React.useEffect(() => {
    if ([ROUTES.LOGIN, ROUTES.REGISTER].includes(location.pathname)) return

    if (userQuery.isSuccess && !userQuery.data) {
      Logger.info('Drawer: No user found, redirecting to login')
      navigate(ROUTES.LOGIN)
    } else if (userQuery.data) {
      setUser(userQuery.data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userQuery.isPending, userQuery.data, userQuery.isSuccess, userQuery.isError])

  if (!user) {
    return (
      <Flex align="center" direction="column" gap="md" h="100vh" justify="center" wrap="wrap">
        <Loader color="blue" size="lg" type="dots" />
        <Text size="lg">Cargando su información, por favor espere</Text>
      </Flex>
    )
  }

  return (
    <AppShell header={{ height: HEIGHT_DRAWER }} padding="md">
      <Drawer
        offset={8}
        opened={opened}
        position="left"
        size="sm"
        style={{
          left: 0,
          zIndex: 1000,
          position: 'absolute',
          borderRadius: '20px',
        }}
        title="Menú"
        onClose={close}
      >
        <Flex direction="column" gap="md">
          <Button
            fullWidth
            color="red"
            leftSection={<IconLogout />}
            variant="subtle"
            onClick={() => {
              DataRepo.logoutUser()
              useStoreLaughLoss.persist.clearStorage()
              useStoreBase.persist.clearStorage()
              close()
              navigate(ROUTES.LOGIN)
            }}
          >
            Cerrar sesión
          </Button>
        </Flex>
      </Drawer>
      <AppShell.Header>
        <div className="cd-h-full cd-flex cd-justify-between cd-items-center cd-px-[1rem]">
          <Flex align="center" gap="xs" justify="flex-start">
            <Burger opened={opened} size="sm" onClick={open} />
            <Link
              className="home-link-transition"
              to={ROUTES.HOME}
              onClick={(e) => {
                e.preventDefault()
                transitionView(() => navigate(ROUTES.HOME))
              }}
            >
              <Breadcrumbs>{buildDrawerTitle()}</Breadcrumbs>
            </Link>
          </Flex>
          <Flex align="center" gap="md" justify="flex-end">
            <ActionIcon variant="transparent" onClick={handleHelpModal}>
              <IconHelp size="lg" />
            </ActionIcon>
          </Flex>
        </div>
      </AppShell.Header>
      <AppShell.Main
        className="cd-w-full cd-h-full cd-absolute cd-p-0"
        pb={0}
        pt={HEIGHT_DRAWER}
        px={0}
      >
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )

  function buildDrawerTitle() {
    const items: JSX.Element[] = []

    items.push(
      <Title className="cd-title-form cd-text-white" key="main-title" order={3}>
        Stream
        <Text inherit c="violet" component="span">
          fy
        </Text>
      </Title>,
    )

    if (selectedGuild && user) {
      items.push(
        <Text c="white" key="info-user" size="md">
          {user.username} @ {selectedGuild.name}
        </Text>,
      )
    }

    return items
  }

  function handleHelpModal() {
    modals.open({
      centered: true,
      title: 'Atajos de teclado',
      children: (
        <Stack className="cd-mb-[1rem]" gap="md">
          <Group className="cd-mt-[1rem]" justify="space-between">
            <Stack gap={0}>
              <Text>Ir al siguiente vídeo/mensaje</Text>
              <Text c="dimmed" size="xs">
                Se deshabilita para la activad &quot;Si te ries pierdes&quot;
              </Text>
            </Stack>
            <Box>
              <Kbd size="md">&rarr;</Kbd>
            </Box>
          </Group>
          <Group className="cd-mt-[1rem]" justify="space-between">
            <Stack gap={0}>
              <Text>Ir al vídeo/mensaje anterior</Text>
              <Text c="dimmed" size="xs">
                Se deshabilita para la activad &quot;Si te ries pierdes&quot;
              </Text>
            </Stack>
            <Box>
              <Kbd size="md">&larr;</Kbd>
            </Box>
          </Group>
          <Divider className="cd-my-[0.5rem]" />
          <Group justify="space-between">
            <Text>Repetir vídeo</Text>
            <Box>
              <Kbd size="md">R</Kbd>
            </Box>
          </Group>
          <Group className="cd-mt-[1rem]" justify="space-between">
            <Text>Pausar/Reproducir vídeo</Text>
            <Box>
              <Kbd size="md">Space</Kbd>
            </Box>
          </Group>
        </Stack>
      ),
    })
  }
}
