import { format } from '@formkit/tempo'
import { useNavigate } from 'react-router-dom'
import { useForm, zodResolver } from '@mantine/form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  IconCheck,
  IconChevronLeft,
  IconCopy,
  IconList,
  IconShare,
  IconSquarePlus,
  IconTrash,
  IconEdit,
} from '@tabler/icons-react'
import {
  Container,
  Center,
  Button,
  Stack,
  Title,
  Tabs,
  Grid,
  Text,
  CopyButton,
  ActionIcon,
  Paper,
  ScrollArea,
  AccordionControlProps,
  Accordion,
  List,
  Tooltip,
  Flex,
  Group,
} from '@mantine/core'

import { type Step1Type, Step1Schema } from '@global/types/src/bingoUnique'

import { ROUTES } from '@src/constants/routes'

import { useStoreBase } from '@src/store'

import { transitionView } from '@src/utils/viewTransition'

import Input from '@src/components/shared/Input'
import TableUniqueBingo from './tableUnique'
import { ErrorService, Logger } from '@global/utils'
import { DiscordRepo } from '@src/db'
import { notifications } from '@mantine/notifications'
import {
  BingoResponseType,
  BingoUniqueCreateParamsType,
  BingoUniqueResponseType,
  PredictionBingoType,
} from '@global/types/src/discord'
import Loading from '@src/components/shared/Loading'
import PredictionModal from './predictionModal'
import { useDisclosure } from '@mantine/hooks'
import React from 'react'

const Bingo = () => {
  const navigate = useNavigate()

  const { user } = useStoreBase()

  const queryClient = useQueryClient()

  const [openModal, handleModal] = useDisclosure()

  const [predEdit, setPredEdit] = React.useState<(PredictionBingoType & { index: number }) | null>(
    null,
  )

  const form = useForm<Step1Type>({
    validate: zodResolver(Step1Schema),
    initialValues: {
      title: '',
      description: '',
      predictions: [],
    },
  })

  const bingoCreateMutation = useMutation<
    BingoUniqueResponseType,
    ErrorService,
    BingoUniqueCreateParamsType,
    BingoUniqueCreateParamsType
  >({
    mutationKey: ['createBingoUnique'],
    mutationFn: async (data) => await DiscordRepo.createBingoUnique(data),
    onSuccess: (data) => {
      Logger.info('Bingo created', data)
      notifications.show({
        color: 'blue',
        title: 'Bingo creado',
        message: 'Se ha creado la tabla de bingo con éxito',
      })
      queryClient.invalidateQueries({
        queryKey: ['tablesBingoUnique'],
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

  const tablesBingoQuery = useQuery<BingoResponseType[], ErrorService>({
    enabled: false,
    queryKey: ['tablesBingoUnique'],
    queryFn: async () => {
      if (!user?.username) {
        Logger.error('User not found')
        notifications.show({
          color: 'red',
          title: 'Error',
          message: 'No se encontró el usuario, por favor intenta de nuevo',
        })
        navigate(ROUTES.ROOT)
      }
      return await DiscordRepo.getBingoTables(user!.username)
    },
  })

  return (
    <Container fluid className="cd-w-full cd-h-full cd-relative" p={0}>
      <Button
        className="!cd-absolute cd-z-50"
        leftSection={<IconChevronLeft />}
        variant="transparent"
        onClick={() => {
          transitionView(() => navigate(ROUTES.HOME))
          form.reset()
        }}
      >
        Volver
      </Button>

      <Container className="cd-w-full cd-h-full cd-relative" p={0} size="xl">
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
                      <Button
                        fullWidth
                        className="!cd-mb-4"
                        variant="light"
                        onClick={handleModal.open}
                      >
                        Añadir predicción
                      </Button>
                      <ScrollArea.Autosize mah={300} mx="auto">
                        {form.values.predictions.map((prediction, index) => (
                          <Paper withBorder className="cd-w-full" key={index} p="sm" shadow="md">
                            <Flex className="cd-w-full" justify="space-between">
                              <Flex direction="column">
                                <Text>{prediction.title}</Text>
                                <Text c="dimmed" lineClamp={2} size="sm" truncate="end">
                                  {prediction.description}
                                </Text>
                              </Flex>
                              <Group gap="xs">
                                <ActionIcon
                                  c="gray"
                                  variant="transparent"
                                  onClick={() => {
                                    setPredEdit({ ...prediction, index })
                                    handleModal.open()
                                  }}
                                >
                                  <IconEdit />
                                </ActionIcon>
                                <ActionIcon
                                  c="red"
                                  variant="transparent"
                                  onClick={() => {
                                    const newPreds = form.values.predictions
                                    newPreds.splice(index, 1)
                                    form.setFieldValue('predictions', newPreds)
                                  }}
                                >
                                  <IconTrash />
                                </ActionIcon>
                              </Group>
                            </Flex>
                          </Paper>
                        ))}
                      </ScrollArea.Autosize>

                      <Button
                        fullWidth
                        className="cd-mt-8"
                        //disabled={!form.isValid()}
                        loaderProps={{ type: 'dots' }}
                        loading={bingoCreateMutation.isPending && !bingoCreateMutation.isIdle}
                        type="submit"
                      >
                        Crear tabla
                      </Button>
                      {bingoCreateMutation.data && (
                        <Paper withBorder className="!cd-mt-[1.5rem] cd-h-full" p="md">
                          <Text>
                            El bingo ha sido creado, puedes verlo en el siguiente enlace:
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
                    <TableUniqueBingo table={form.values} />
                  </Grid.Col>
                </Grid>
              </Tabs.Panel>
              <Tabs.Panel className="cd-mt-[2rem]" value="view">
                <Text>Lista de Bingo creadas</Text>
                <Loading show={tablesBingoQuery.isLoading} text="Cargando tablas creadas" />
                {tablesBingoQuery.data && tablesBingoQuery.data.length > 0 && (
                  <ScrollArea.Autosize className="cd-mt-[1rem] cd-w-full">
                    <Accordion chevronPosition="left">
                      {tablesBingoQuery.data.map((table) => (
                        <Accordion.Item key={table.id} value={table.id}>
                          <AccordionControl table={table}>
                            <div>
                              <Text>{table.title}</Text>
                              <Text c="dimmed" fz="sm">
                                {table.description}
                              </Text>
                              <Text className="!cd-mt-[0.5rem]" fz="sm">
                                Creada: {format(new Date(table.createdAt), 'DD-MM-YYYY', 'en')}
                              </Text>
                            </div>
                          </AccordionControl>
                          <Accordion.Panel>
                            <Text className="cd-mt-[1rem]">Oraciones:</Text>
                            <List withPadding type="unordered">
                              {table.sentences.map((sentence, index) => (
                                <List.Item key={index}>- {sentence}</List.Item>
                              ))}
                            </List>
                          </Accordion.Panel>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </ScrollArea.Autosize>
                )}
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Center>
      </Container>
      <PredictionModal
        opened={openModal}
        predEdit={predEdit}
        onClose={() => {
          handleModal.close()
          setPredEdit(null)
        }}
        onCreate={(pred) => {
          if (predEdit) {
            const newPreds = form.values.predictions
            newPreds[predEdit.index] = pred
            form.setFieldValue('predictions', newPreds)
          } else {
            form.setFieldValue('predictions', [...form.values.predictions, pred])
          }
          handleModal.close()
          setPredEdit(null)
        }}
      />
    </Container>
  )

  function buildUrl(id: string) {
    return `${window.location.origin}${ROUTES.BINGO_UNIQUE_PLAY.replace(':id', id)}`
  }

  function AccordionControl(props: AccordionControlProps & { table: BingoResponseType }) {
    return (
      <Center>
        <Accordion.Control {...props} />
        <CopyButton timeout={400} value={buildUrl(props.table.id)}>
          {({ copied, copy }) => (
            <Tooltip withArrow label={copied ? 'Link copiado' : 'Copiar link'} position="right">
              <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                {copied ? <IconCheck /> : <IconShare />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      </Center>
    )
  }
}

export default Bingo
