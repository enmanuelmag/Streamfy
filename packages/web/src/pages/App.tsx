import {
  useQuery,
  QueryClient,
  QueryCache,
  MutationCache,
  QueryClientProvider,
} from '@tanstack/react-query'
import React from 'react'
import { Route, Routes, BrowserRouter, useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@constants/routes'

import Login from '@pages/auth/login'
import Register from '@pages/auth/register'
import Home from '@pages/private/home'
import { DataRepo } from '@src/db'
import { UserType } from '@global/types/src/user'
import { Center, Flex, Loader, Text, useMantineColorScheme } from '@mantine/core'

export const queryClient = new QueryClient({
  queryCache: new QueryCache(),
  mutationCache: new MutationCache(),
})

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Login />} path={ROUTES.LOGIN} />
          <Route element={<Register />} path={ROUTES.REGISTER} />
          <Route element={<Home />} path={ROUTES.HOME} />
          <Route element={<Root />} path="/" />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

function Root() {
  const location = useLocation()
  const navigate = useNavigate()

  useMantineColorScheme({
    keepTransitions: true,
  })

  const userQuery = useQuery<UserType | null, Error>({
    queryKey: ['user'],
    queryFn: async () => await DataRepo.getUser(),
  })

  React.useEffect(() => {
    if ([ROUTES.LOGIN, ROUTES.REGISTER].includes(location.pathname)) return

    if (userQuery.isSuccess && !userQuery.data) {
      navigate(ROUTES.LOGIN)
    } else if (userQuery.isSuccess && userQuery.data) {
      navigate(ROUTES.HOME)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userQuery.isPending, userQuery.data, userQuery.isSuccess, userQuery.isError])

  return (
    <Center h="100vh" w="100vw">
      <Flex align="center" direction="column" justify="center">
        <Loader size="xl" />
        <Text fz="lg" mt={4}>
          Loading your{' '}
          <Text span c="purple.500" fz="lg">
            Clips
          </Text>
        </Text>
      </Flex>
    </Center>
  )
}

export { App }
