import { useForm } from '@mantine/form'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { IconBrandGoogle } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { zodResolver } from 'mantine-form-zod-resolver'
import { Text, Title, Paper, Button, Center, Divider, Anchor } from '@mantine/core'

import { DataRepo } from '@src/db'
import { useStoreBase } from '@src/store'
import { LoginUserSchema, LoginUserType, UserType } from '@global/types/src/user'

import { ROUTES } from '@constants/routes'

import Input from '@components/shared/Input'

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useStoreBase((state) => state)

  const form = useForm<LoginUserType>({
    validate: zodResolver(LoginUserSchema),
    initialValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useMutation<UserType, Error, LoginUserType, LoginUserType>({
    networkMode: 'always',
    mutationFn: async (values) => {
      if (values.withGoogle) {
        return DataRepo.loginUserWithGoogle()
      }
      return DataRepo.loginUserByEmailAndPassword(values)
    },
    onSuccess: (user) => {
      setUser(user)
      notifications.show({
        color: 'green',
        title: 'Bienvenido',
        message: user.email,
      })
      return setTimeout(() => navigate(ROUTES.HOME), 500)
    },
    onError: (error) => {
      console.warn(error)
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Error al iniciar sesión',
      })
    },
  })

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
        <form onSubmit={form.onSubmit((values) => loginMutation.mutate(values))}>
          <Input
            inputsProps={form.getInputProps('email')}
            label="Email"
            name="email"
            placeholder="example@email.com"
          />
          <Input
            inputsProps={form.getInputProps('password')}
            label="Password"
            name="password"
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            type="password"
          />
          <div className="cd-pt-4">
            <Button
              fullWidth
              loading={
                loginMutation.isPending && Boolean(form.values.email && form.values.password)
              }
              type="submit"
            >
              Iniciar sesión
            </Button>
          </div>
          <Button
            fullWidth
            leftSection={<IconBrandGoogle />}
            loading={loginMutation.isPending && !form.values.email && !form.values.password}
            mt="sm"
            size="md"
            variant="default"
            onClick={() => loginMutation.mutate({ withGoogle: true, email: '', password: '' })}
          >
            Continuar con Google
          </Button>
        </form>
        <Divider my="xl" />
        <Center>
          <Text>
            No tiene cuenta? <Anchor href={ROUTES.REGISTER}>Registrarse</Anchor>
          </Text>
        </Center>
      </Paper>
    </Center>
  )
}
