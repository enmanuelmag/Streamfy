import React from 'react'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'

import Loading from '@components/shared/Loading'

import { DiscordRepo } from '@src/db'
import { useStoreBase } from '@src/store'

import { ROUTES } from '@constants/routes'

export default function LoginCallback() {
  const navigate = useNavigate()
  const { setUser } = useStoreBase((state) => state)

  React.useEffect(() => {
    const discordCode = getCode(window.location.toString())
    if (discordCode) {
      DiscordRepo.loginWithCode(discordCode)
        .then((data) => {
          setUser(data)
          notifications.show({
            color: 'green',
            title: 'Bienvenido',
            message: data.username,
          })
          setTimeout(() => navigate(ROUTES.HOME), 500)
        })
        .catch((e) => {
          notifications.show({
            color: 'red',
            title: 'Error',
            message: 'Error al iniciar sesión',
          })
          console.log('Error', e)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Loading show text="Cargando información" />

  function getCode(link: string) {
    const url = new URL(link)
    return url.searchParams.get('code')
  }
}
