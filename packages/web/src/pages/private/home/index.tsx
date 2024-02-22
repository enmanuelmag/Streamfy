import { Card, Center, Container, Flex, Image, Overlay, Text } from '@mantine/core'

import { ROUTES } from '@src/constants/routes'

import Reddit from '@assets/images/reddit.png'
import Doctor from '@assets/images/consultorio.png'
import LaughLoss from '@assets/images/si_ries_pierdes.jpg'

type CardProps = {
  image: string
  href: string
  title: string
  description: string
  comingSoon?: boolean
}

const Cards: CardProps[] = [
  {
    image: LaughLoss,
    title: 'Si te ríes pierdes',
    href: ROUTES.LAUGH_LOSS,
    description:
      'Actividad donde podemos sacarle dinero al Baity, esperemos que si cumpla :baitydedo:',
  },
  {
    image: Doctor,
    title: 'Baity consultorio',
    href: ROUTES.BAITY_CONSULTORIO,
    description:
      'Espacio para que el Baity lee los chisme de los Masturbaiters y nos da consejos :baitylove:',
  },
  {
    image: Reddit,
    title: 'Reddit',
    comingSoon: true,
    href: ROUTES.REDDIT,
    description: 'Actividad donde el Baity revisa memes del Reddit :baitymeme:',
  },
]

const Home = () => {
  return (
    <Container className="cd-w-full cd-h-full" size="md">
      <Center className="cd-w-full cd-h-full">
        <Flex align="center" direction="row" gap="lg" justify="center" wrap="wrap">
          {Cards.map((card, index) => (
            <Card
              withBorder
              className="cd-w-[450px]"
              component="a"
              href={card.href}
              key={`card-${index}`}
              padding="lg"
              radius="md"
              shadow="sm"
            >
              <Card.Section>
                <Image alt="No way!" h={225} src={card.image} />
              </Card.Section>
              {card.comingSoon && (
                <Overlay backgroundOpacity={0.6} color="dark">
                  <Center className="cd-h-[80%]">
                    <Text c="white" size="xl">
                      Próximamente
                    </Text>
                  </Center>
                </Overlay>
              )}
              <Text fw={500} mt="md" size="lg">
                {card.title}
              </Text>

              <Text c="dimmed" mt="xs" size="sm">
                {card.description}
              </Text>
            </Card>
          ))}
        </Flex>
      </Center>
    </Container>
  )
}

export default Home
