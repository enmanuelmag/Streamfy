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
} from '@mantine/core'

import { ROUTES } from '@src/constants/routes'
import { UserType } from '@global/types/src/user'
import { useStoreBase, useStoreLaughLoss } from '@src/store'

import { DataRepo } from '@src/db'
import { transitionView } from '@src/utils/viewTransition'

import { Logger } from '@global/utils/src'

export const HEIGHT_DRAWER = 50

export default function Protected() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, setUser } = useStoreBase((state) => state)
  const [opened, { open, close }] = useDisclosure()

  const userQuery = useQuery<UserType | null, Error>({
    //enabled: !user,
    queryKey: ['user'],
    queryFn: async () => await DataRepo.getUser(),
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
            <Burger opened={opened} onClick={open} />
            <Link
              className="home-link-transition"
              to={ROUTES.HOME}
              onClick={(e) => {
                e.preventDefault()
                transitionView(() => navigate(ROUTES.HOME))
              }}
            >
              <Title className="cd-title-form cd-text-white" order={3}>
                Stream
                <Text inherit c="violet" component="span">
                  fy
                </Text>
              </Title>
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

  function handleHelpModal() {
    modals.open({
      centered: true,
      title: 'Atajos de teclado',
      children: (
        <Stack className="cd-mb-[1rem]" gap="md">
          <Group className="cd-mt-[1rem]" justify="space-between">
            <Text>Ir al siguiente video/mensaje</Text>
            <Box>
              <Kbd>Ctrl</Kbd> + <Kbd>.</Kbd>
            </Box>
          </Group>
          <Group className="cd-mt-[1rem]" justify="space-between">
            <Text>Ir al anterior video/mensaje</Text>
            <Box>
              <Kbd>Ctrl</Kbd> + <Kbd>,</Kbd>
            </Box>
          </Group>
          <Divider className="cd-my-[0.5rem]" />
          <Group justify="space-between">
            <Text>Repetir vídeo</Text>
            <Box>
              <Kbd>Ctrl</Kbd> + <Kbd>R</Kbd>
            </Box>
          </Group>
          <Group className="cd-mt-[1rem]" justify="space-between">
            <Text>Pausar/Reproducir vídeo</Text>
            <Box>
              <Kbd>Ctrl</Kbd> + <Kbd>Space</Kbd>
            </Box>
          </Group>
        </Stack>
      ),
    })
  }
}
