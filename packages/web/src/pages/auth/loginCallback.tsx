import React from 'react'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'

import Loading from '@components/shared/Loading'

import { DiscordRepo } from '@src/db'
import { useStoreBase, useStoreConsultorio, useStoreLaughLoss } from '@src/store'

import { ROUTES } from '@constants/routes'
import { validateUserAccess } from '@src/utils/access'

export default function LoginCallback() {
  const navigate = useNavigate()
  const { setUser, reset: resetBase } = useStoreBase((state) => state)
  const { reset: resetLaughLoss } = useStoreLaughLoss((state) => state)
  const { reset: resetConsultorio } = useStoreConsultorio((state) => state)

  React.useEffect(() => {
    const discordCode = getCode(window.location.toString())
    if (discordCode) {
      DiscordRepo.loginWithCode(discordCode)
        .then((user) => {
          if (validateUserAccess(user.access)) {
            setUser(user)
            setTimeout(() => navigate(ROUTES.HOME), 500)
          } else {
            reset()
          }
        })
        .catch((e) => {
          notifications.show({
            color: 'red',
            title: 'Error',
            message: e?.message ?? 'Error al iniciar sesión',
          })
          navigate(ROUTES.ROOT)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Loading show text="Cargando información" />

  function getCode(link: string) {
    const url = new URL(link)
    return url.searchParams.get('code')
  }

  function reset() {
    resetBase()
    resetLaughLoss()
    resetConsultorio()
    localStorage.clear()
    navigate(ROUTES.ROOT)
  }
}
