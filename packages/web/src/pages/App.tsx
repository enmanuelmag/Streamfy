import { useMantineColorScheme } from '@mantine/core'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryCache, MutationCache, QueryClientProvider } from '@tanstack/react-query'

import { ROUTES } from '@constants/routes'

import Root from '@pages/public/root'
import BingoPlay from '@pages/public/bingoPlay'

import Login from '@pages/auth/login'
import Drawer from '@components/drawer'
import LoginCallback from '@pages/auth/loginCallback'

//Private
import Home from '@pages/private/home'
import Bingo from '@pages/private/bingo'
import BingoUnique from '@pages/private/bingoUnique'
import BingoUniquePlay from '@pages/private/bingoUniquePlay'
import LaughLoss from '@pages/private/laughLoss'
import Consultorio from '@pages/private/consultorio'

import './styles.scss'

export const queryClient = new QueryClient({
  queryCache: new QueryCache(),
  mutationCache: new MutationCache(),
})

const App = () => {
  useMantineColorScheme({
    keepTransitions: true,
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Login />} path={ROUTES.LOGIN} />
          <Route element={<LoginCallback />} path={ROUTES.LOGIN_CALLBACK} />
          <Route element={<Drawer />}>
            <Route element={<Home />} path={ROUTES.HOME} />
            <Route element={<Bingo />} path={ROUTES.BINGO} />
            <Route element={<BingoUnique />} path={ROUTES.BINGO_UNIQUE} />
            <Route element={<BingoUniquePlay />} path={ROUTES.BINGO_UNIQUE_PLAY} />
            <Route element={<LaughLoss />} path={ROUTES.LAUGH_LOSS} />
            <Route element={<Consultorio />} path={ROUTES.BAITY_CONSULTORIO} />
            <Route element={<Consultorio />} path={ROUTES.BAITY_CONSULTORIO} />
          </Route>
          <Route element={<Root />} path="/" />
          <Route element={<BingoPlay />} path={ROUTES.BINGO_PLAY} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export { App }
