import { IconBrandDiscordFilled } from '@tabler/icons-react'
import { Text, Title, Paper, Button, Center } from '@mantine/core'

export default function Login() {
  return (
    <Center className="cd-w-screen cd-h-screen">
      <Paper
        withBorder
        className="cd-min-w-[350px] md:cd-w-1/4 cd-max-w-[400px]"
        p="xl"
        radius="md"
        shadow="xs"
      >
        <div>
          <Title className="cd-title-form" order={2}>
            Stream
            <Text inherit c="violet" component="span">
              fy
            </Text>
          </Title>
        </div>
        <Text my="md">
          Para poder acceder a los mensajes de Discord, necesitamos que inicies sesión con tu cuenta
          de Discord.
        </Text>
        <Button
          fullWidth
          component="a"
          href={import.meta.env.VITE_LOGIN_WITH_DISCORD}
          leftSection={<IconBrandDiscordFilled />}
          mt="sm"
          size="md"
          variant="default"
        >
          Iniciar sesión con Discord
        </Button>
      </Paper>
    </Center>
  )
}
