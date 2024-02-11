import { useForm } from '@mantine/form'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { zodResolver } from 'mantine-form-zod-resolver'
import { Text, Title, Paper, Button, Center, Divider, Anchor } from '@mantine/core'

import { DataRepo } from '@src/db'
import { useStoreBase } from '@src/store'
import { CreationUserSchema, CreationUserType, UserType } from '@global/types/src/user'

import { ROUTES } from '@constants/routes'

import Input from '@components/shared/Input'

export default function Register() {
  const { setUser } = useStoreBase((state) => state)
  const navigate = useNavigate()

  const form = useForm<CreationUserType>({
    validate: zodResolver(CreationUserSchema),
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const registerMutation = useMutation<UserType, Error, CreationUserType, CreationUserType>({
    networkMode: 'always',
    mutationFn: (values) => DataRepo.createUserByEmailAndPassword(values),
    onSuccess: (user) => {
      setUser(user)
      notifications.show({
        title: 'Bienvenido',
        message: user.email,
        color: 'green',
      })
      return setTimeout(() => navigate(ROUTES.HOME), 1000)
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: error.message || 'Error al iniciar sesión',
      })
      console.warn(error)
    },
  })

  return (
    <Center className="w-screen h-screen">
      <Paper withBorder className="w-1/4 max-w-[400px]" p="xl" radius="md" shadow="xs">
        <div>
          <Title className="title-form" order={2}>
            Securi
            <Text inherit c="violet.500" component="span">
              fy
            </Text>
          </Title>
        </div>
        <form onSubmit={form.onSubmit((values) => registerMutation.mutate(values))}>
          <Input
            inputsProps={form.getInputProps('email')}
            label="Email"
            name="email"
            placeholder="example@email.com"
            type="email"
          />
          <Input
            inputsProps={form.getInputProps('password')}
            label="Password"
            name="password"
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            type="password"
          />
          <Input
            label="Confirm Password"
            name="passwordConfirmation"
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            type="password"
          />
          <div className="pt-4">
            <Button fullWidth loading={registerMutation.isPending} type="submit">
              Registrarse
            </Button>
          </div>
        </form>
        <Divider my="xl" />
        <Text className="text-center" size="sm">
          Ya tiene una cuenta? <Anchor href={ROUTES.REGISTER}>Iniciar sesión</Anchor>
        </Text>
      </Paper>
    </Center>
  )
}
