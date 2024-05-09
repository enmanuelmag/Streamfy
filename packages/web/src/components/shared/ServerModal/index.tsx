import { DiscordGuildsType } from '@global/types/src/discord'
import { Button, Group, Modal, Select } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useStoreBase } from '@src/store'
import React from 'react'

export default function SelectModal() {
  const { selectedGuild, setSelectedGuild, user } = useStoreBase((state) => state)

  const listGuilds = user?.guilds || []

  const [innerSelectedGuild, setInnerSelectedGuild] = React.useState<
    DiscordGuildsType | undefined | null
  >(selectedGuild)

  return (
    <Modal
      centered
      opened={Boolean(!selectedGuild && listGuilds.length)}
      size="lg"
      title="Servidor de Discord"
      onClose={() => {
        if (!selectedGuild && !innerSelectedGuild) {
          notifications.show({
            color: 'red',
            title: 'Error',
            message: 'Debes seleccionar un servidor de Discord para continuar',
          })
        }
        if (innerSelectedGuild) {
          setSelectedGuild(innerSelectedGuild)
        }
      }}
    >
      <Select
        data={listGuilds.map((guild) => ({ value: guild.id, label: guild.name }))}
        placeholder="Escribe para buscar"
        size="md"
        value={innerSelectedGuild?.id || null}
        onChange={(value) => {
          const innerGuild = listGuilds.find((g) => g.id === value)
          if (!innerGuild) return
          setInnerSelectedGuild(innerGuild)
        }}
      />
      <Group justify="flex-end" mt="xl">
        <Button
          onClick={() => {
            if (!innerSelectedGuild) {
              notifications.show({
                color: 'red',
                title: 'Error',
                message: 'Debes seleccionar un servidor',
              })
              return
            }
            setSelectedGuild(innerSelectedGuild)
          }}
        >
          Guardar
        </Button>
      </Group>
    </Modal>
  )
}
