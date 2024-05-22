import { useNavigate } from 'react-router-dom'
import { useForm, zodResolver } from '@mantine/form'
import { Container, Center, Button, Stack, Title, Tabs, Grid, Textarea } from '@mantine/core'

import { type Step1Type, Step1Schema } from '@global/types/src/bingo'

import { ROUTES } from '@src/constants/routes'
import { useStoreConsultorio } from '@src/store'

import { transitionView } from '@src/utils/viewTransition'

import { IconChevronLeft, IconList, IconSquarePlus } from '@tabler/icons-react'

import Input from '@src/components/shared/Input'

const SENTENCES_PLACEHOLDER = `
Monográfico de Pokémon parte 3
La pesca en los videojuegos
Es CumSmart una estafa?
Imagina que tienes 2 vacas
Nomura cabrón
Silk Song cuando?`.trim()

const Consultorio = () => {
  const { messages, currentMessage } = useStoreConsultorio((state) => state)

  const navigate = useNavigate()

  const form = useForm<Step1Type>({
    validate: zodResolver(Step1Schema),
    initialValues: {
      title: '',
      description: '',
      sentences: '',
      layout: '3x3',
    },
  })

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

              <Tabs.Panel value="create">
                <Grid className="cd-mt-[2rem]">
                  <Grid.Col span={{ md: 12, lg: 6 }}>
                    <form
                      className="lg:cd-basis-1/2"
                      onSubmit={form.onSubmit((values) => console.log(values))}
                    >
                      <Input
                        label="Título"
                        name="title"
                        placeholder="Escriba el título"
                        {...form.getInputProps('title')}
                      />
                      <Input
                        label="Descripción"
                        name="description"
                        placeholder="Escriba la descripción"
                        {...form.getInputProps('description')}
                      />
                      <Input
                        allowDeselect={false}
                        className="cd-pb-4"
                        component="select"
                        defaultValue={form.values.layout}
                        label="Layout"
                        name="layout"
                        options={['3x3', '4x4', '5x5', '6x6']}
                        placeholder="Selecciona el layout de la tabla"
                        {...form.getInputProps('layout')}
                      />
                      <Textarea
                        autosize
                        label="Frases"
                        minRows={SENTENCES_PLACEHOLDER.split('\n').length}
                        name="sentences"
                        placeholder={SENTENCES_PLACEHOLDER}
                        {...form.getInputProps('sentences')}
                      />
                    </form>
                  </Grid.Col>
                  <Grid.Col span={{ md: 12, lg: 6 }}>
                    <div className="lg:cd-basis-1/2">Aqui la preview</div>
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
