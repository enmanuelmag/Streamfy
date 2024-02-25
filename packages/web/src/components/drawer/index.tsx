import React from 'react'
import { useDisclosure } from '@mantine/hooks'
import { IconLogout } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AppShell, Burger, Button, Drawer, Loader, Flex, Text, Title } from '@mantine/core'

import { useStoreBase, useStoreLaughLoss } from '@src/store'
import { ROUTES } from '@src/constants/routes'
import { UserType } from '@global/types/src/user'

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
        <div className="cd-h-full cd-flex cd-justify-start cd-items-center cd-pl-4">
          <Burger opened={opened} onClick={open} />
          <div className="cd-ml-4">
            <Link
              className="home-link-transition"
              to={ROUTES.HOME}
              onClick={(e) => {
                e.preventDefault()
                transitionView(() => navigate(ROUTES.HOME))
              }}
            >
              <Title className="cd-title-form cd-text-white" order={2}>
                Stream
                <Text inherit c="violet" component="span">
                  fy
                </Text>
              </Title>
            </Link>
          </div>
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
}
