import { useMutation } from '@tanstack/react-query'

import type { BingoUserType } from '@global/types/src/discord'

import { ErrorService } from '@global/utils'
import { DiscordRepo } from '@src/db'
import { Button, Center, Container, Group, Modal, TextInput } from '@mantine/core'
import Table from '@src/pages/private/bingo/table'
import Loading from '@src/components/shared/Loading'
import React from 'react'
import { notifications } from '@mantine/notifications'
import { useForm } from '@mantine/form'

type GetBingoPlay = {
  userName: string
}

const BingoPlay = () => {
  const [table, setTable] = React.useState<BingoUserType | null>(null)

  const bingoMutation = useMutation<BingoUserType, ErrorService, GetBingoPlay, GetBingoPlay>({
    mutationKey: ['bingoMutation'],
    mutationFn: async ({ userName: userParam }) => {
      if (!table && localStorage.getItem('bingo')) {
        return JSON.parse(localStorage.getItem('bingo') || '') as BingoUserType
      }
      return await DiscordRepo.getBingo(getIdFromURL(), userParam.toLowerCase())
    },
  })

  const form = useForm({
    initialValues: {
      userName: '',
    },
  })

  React.useEffect(() => {
    if (bingoMutation.data) {
      localStorage.setItem('bingo', JSON.stringify(bingoMutation.data))
      setTable(bingoMutation.data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bingoMutation.data])

  return (
    <Container
      fluid
      className="cd-h-full cd-w-full !cd-px-[1rem] md:!cd-px-[3rem] lg:!cd-px-[6rem]"
    >
      <Center className="cd-w-full cd-h-full">
        <Loading
          loadingSize="lg"
          show={bingoMutation.isPending && !bingoMutation.isIdle}
          text="Cargando bingo"
        />
        {bingoMutation.data && <Table generated table={bingoMutation.data} />}
        <Modal
          centered
          opened={!bingoMutation.data && !bingoMutation.isPending && bingoMutation.isIdle}
          title="Ingresa tu nombre"
          onClose={() => {
            notifications.show({
              color: 'red',
              title: 'Error',
              message: 'No puedes jugar sin un nombre',
            })
          }}
        >
          <form onSubmit={form.onSubmit((data) => bingoMutation.mutate(data))}>
            <TextInput
              name="userName"
              placeholder="Nombre"
              value={form.values.userName}
              {...form.getInputProps('userName')}
            />
            <Group className="cd-mt-[1rem]" justify="flex-end">
              <Button type="submit">Jugar</Button>
            </Group>
          </form>
        </Modal>
      </Center>
    </Container>
  )

  function getIdFromURL() {
    const url = window.location.href
    const urlParts = url.split('/')
    return urlParts[urlParts.length - 1]
  }
}

export default BingoPlay
