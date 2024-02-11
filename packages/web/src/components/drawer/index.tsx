import React from 'react'
import { useDisclosure } from '@mantine/hooks'
import { IconLogout } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AppShell, Burger, Button, Drawer, Loader, Flex, Text } from '@mantine/core'

import { useStoreBase } from '@src/store'
import { ROUTES } from '@src/constants/routes'
import { UserType } from '@global/types/src/user'

import { DataRepo } from '@src/db'

export default function Protected() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useStoreBase((state) => state)
  const [opened, { open, close }] = useDisclosure()

  const userQuery = useQuery<UserType | null, Error>({
    enabled: !user,
    queryKey: ['user'],
    queryFn: async () => await DataRepo.getUser(),
  })

  React.useEffect(() => {
    if ([ROUTES.LOGIN, ROUTES.REGISTER].includes(location.pathname)) return

    if (userQuery.isSuccess && !userQuery.data) {
      navigate(ROUTES.LOGIN)
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
    <AppShell header={{ height: 60 }} padding="md">
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
              close()
              DataRepo.logoutUser()
            }}
          >
            Cerrar sesión
          </Button>
        </Flex>
      </Drawer>
      <AppShell.Header>
        <div className="h-full flex justify-start items-center pl-4">
          <Burger opened={opened} onClick={open} />
          <div className="ml-4">
            <Text>{user.email}</Text>
          </div>
        </div>
      </AppShell.Header>
      <AppShell.Main className="w-full">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
