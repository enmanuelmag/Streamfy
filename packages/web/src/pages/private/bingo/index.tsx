import { useNavigate } from 'react-router-dom'
import { useForm, zodResolver } from '@mantine/form'
import { useMutation } from '@tanstack/react-query'
import { IconCheck, IconChevronLeft, IconCopy, IconList, IconSquarePlus } from '@tabler/icons-react'
import {
  Container,
  Center,
  Button,
  Stack,
  Title,
  Tabs,
  Grid,
  Textarea,
  Text,
  CopyButton,
  ActionIcon,
  Paper,
} from '@mantine/core'

import { type Step1Type, Step1Schema } from '@global/types/src/bingo'

import { ROUTES } from '@src/constants/routes'
import { LayoutTable } from '@src/constants/bingo'

import { useStoreBase } from '@src/store'

import { transitionView } from '@src/utils/viewTransition'

import Input from '@src/components/shared/Input'
import TableBingo from './table'
import { ErrorService, Logger } from '@global/utils'
import { DiscordRepo } from '@src/db'
import { notifications } from '@mantine/notifications'
import { BingoCreateParamsType, BingoResponseType } from '@global/types/src/discord'

const SENTENCES_PLACEHOLDER = `
Monográfico de Pokémon parte 3
La pesca en los videojuegos
Es CumSmart una estafa?
Imagina que tienes 2 vacas
Nomura cabrón
Silk Song cuando?
El mejor juego de la historia
VHS maldito
Roleo con los panas
`.trim()

const Bingo = () => {
  const navigate = useNavigate()

  const { user } = useStoreBase()

  const form = useForm<Step1Type>({
    validate: zodResolver(Step1Schema),
    initialValues: {
      title: 'Bingo no-E3',
      description: 'Cartilla de bingo para el evento no-E3',
      sentences: SENTENCES_PLACEHOLDER.split('\n'),
      layout: '3',
    },
  })

  const bingoCreateMutation = useMutation<
    BingoResponseType,
    ErrorService,
    BingoCreateParamsType,
    BingoCreateParamsType
  >({
    mutationKey: ['createBingo'],
    mutationFn: async (data) => await DiscordRepo.createBingo(data),
    onSuccess: (data) => {
      Logger.info('Bingo created', data)
      notifications.show({
        color: 'blue',
        title: 'Bingo creado',
        message: 'Se ha creado la tabla de bingo con éxito',
      })
    },
    onError: (error) => {
      Logger.error('Error creating bingo', error)
      notifications.show({
        color: 'red',
        title: 'Error creando bingo',
        message: error.message || 'Hubo un error creando el bingo, por favor intenta de nuevo',
      })
    },
  })

  Logger.info('Bingo page', bingoCreateMutation.data)

  return (
    <Container fluid className="cd-w-full cd-h-full cd-relative" p={0}>
      <Button
        className="!cd-absolute cd-z-50"
        leftSection={<IconChevronLeft />}
        variant="transparent"
        onClick={() => {
          transitionView(() => navigate(ROUTES.HOME))
        }}
      >
        Volver
      </Button>

      <Container className="cd-w-full cd-h-full cd-relative" p={0} size="lg">
        <Center className="cd-pt-[4rem] cd-min-w-[200px]">
          <Stack className="cd-w-full">
            <Title order={2}>Bingo!</Title>
            <Tabs defaultValue="create">
              <Tabs.List grow>
                <Tabs.Tab leftSection={<IconSquarePlus />} value="create">
                  Crear tabla
                </Tabs.Tab>
                <Tabs.Tab leftSection={<IconList />} value="view">
                  Ver tablas creadas
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel className="cd-mt-[2rem]" value="create">
                <Grid>
                  <Grid.Col span={{ md: 12, lg: 4 }}>
                    <form
                      onSubmit={form.onSubmit((data) => {
                        if (!user) {
                          Logger.error('User not found')
                          notifications.show({
                            color: 'red',
                            title: 'Error',
                            message: 'No se encontró el usuario, por favor intenta de nuevo',
                          })
                          return navigate(ROUTES.ROOT)
                        }

                        bingoCreateMutation.mutate({
                          discordUser: user.username,
                          ...data,
                        })
                      })}
                    >
                      <Input
                        inputsProps={form.getInputProps('title')}
                        label="Título"
                        name="title"
                        placeholder="Escriba el título"
                        value={form.values.title}
                      />
                      <Input
                        inputsProps={form.getInputProps('description')}
                        label="Descripción"
                        name="description"
                        placeholder="Escriba la descripción"
                        value={form.values.description}
                        {...form.getInputProps('description')}
                      />
                      <Input
                        allowDeselect={false}
                        className="cd-pb-4"
                        component="select"
                        defaultValue={form.values.layout}
                        inputsProps={form.getInputProps('layout')}
                        label="Layout"
                        name="layout"
                        options={LayoutTable}
                        placeholder="Selecciona el layout de la tabla"
                      />
                      <Textarea
                        autosize
                        className="cd-pb-4"
                        label="Frases"
                        minRows={SENTENCES_PLACEHOLDER.split('\n').length}
                        name="sentences"
                        placeholder={SENTENCES_PLACEHOLDER}
                        {...form.getInputProps('sentences')}
                        value={form.values.sentences.join('\n')}
                        onChange={(event) =>
                          form.setFieldValue('sentences', event.currentTarget.value.split('\n'))
                        }
                      />
                      <Button
                        fullWidth
                        loaderProps={{ type: 'dots' }}
                        loading={bingoCreateMutation.isPending && !bingoCreateMutation.isIdle}
                        type="submit"
                      >
                        Crear tabla
                      </Button>
                      {bingoCreateMutation.data && (
                        <Paper withBorder className="!cd-mt-[1.5rem] cd-h-full" p="md">
                          <Text>
                            Copia el link para compartir la tabla de bingo
                            <Center className="cd-w-full cd-mt-[0.5rem]">
                              <CopyButton
                                timeout={3500}
                                value={buildUrl(bingoCreateMutation.data.id)}
                              >
                                {({ copied, copy }) => (
                                  <Button
                                    color={copied ? 'teal' : 'gray'}
                                    leftSection={
                                      <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle">
                                        {copied ? (
                                          <IconCheck style={{ width: '1rem' }} />
                                        ) : (
                                          <IconCopy style={{ width: '1rem' }} />
                                        )}
                                      </ActionIcon>
                                    }
                                    onClick={copy}
                                  >
                                    {copied ? 'Link copiado url' : 'Copiar link'}
                                  </Button>
                                )}
                              </CopyButton>
                            </Center>
                          </Text>
                        </Paper>
                      )}
                    </form>
                  </Grid.Col>
                  <Grid.Col span={{ md: 12, lg: 8 }}>
                    <TableBingo table={form.values} />
                  </Grid.Col>
                </Grid>
              </Tabs.Panel>
              <Tabs.Panel className="cd-mt-[2rem]" value="view">
                Messages tab content
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Center>
      </Container>
    </Container>
  )

  function buildUrl(id: string) {
    return `${window.location.origin}${ROUTES.BINGO_PLAY.replace(':id', id)}`
  }
}

export default Bingo
