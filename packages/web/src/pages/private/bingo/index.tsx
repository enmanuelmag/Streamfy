import { useNavigate } from 'react-router-dom'
import { useForm, zodResolver } from '@mantine/form'
import { Container, Center, Button, Stack, Title, Tabs, Grid, Textarea } from '@mantine/core'

import { type Step1Type, Step1Schema } from '@global/types/src/bingo'

import { ROUTES } from '@src/constants/routes'
import { LayoutTable } from '@src/constants/bingo'

import { useStoreConsultorio } from '@src/store'

import { transitionView } from '@src/utils/viewTransition'

import { IconChevronLeft, IconList, IconSquarePlus } from '@tabler/icons-react'

import Input from '@src/components/shared/Input'

import TableBingo from './table'

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

const Consultorio = () => {
  const { messages, currentMessage } = useStoreConsultorio((state) => state)

  const navigate = useNavigate()

  const form = useForm<Step1Type>({
    validate: zodResolver(Step1Schema),
    initialValues: {
      title: 'Bingo no-E3',
      description: 'Cartilla de bingo para el evento no-E3',
      sentences: SENTENCES_PLACEHOLDER.split('\n'),
      layout: '3',
    },
  })

  console.log(form.values)

  return (
    <Container fluid className="cd-w-full cd-h-full cd-relative" p={0}>
      {!messages?.length && (
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
      )}

      <Container
        className="cd-w-full cd-h-full cd-relative"
        fluid={currentMessage ? true : undefined}
        p={0}
        size="md"
      >
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
                    <form onSubmit={form.onSubmit((values) => console.log(values))}>
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
                    </form>
                  </Grid.Col>
                  <Grid.Col span={{ md: 12, lg: 8 }}>
                    <TableBingo generated table={form.values} />
                  </Grid.Col>
                </Grid>
              </Tabs.Panel>
              <Tabs.Panel value="view">Messages tab content</Tabs.Panel>
            </Tabs>
          </Stack>
        </Center>
      </Container>
    </Container>
  )
}

export default Consultorio
