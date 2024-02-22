import { Card, Center, Container, Flex, Image, Overlay, Text } from '@mantine/core'

import { ROUTES } from '@src/constants/routes'

import Reddit from '@assets/images/reddit.png'
import Doctor from '@assets/images/consultorio.png'
import LaughLoss from '@assets/images/si_ries_pierdes.jpg'
import { useNavigate } from 'react-router-dom'
import { transitionView } from '@src/utils/viewTransition'

type CardProps = {
  image: string
  href: string
  title: string
  description: string
  comingSoon?: boolean
  transitionClass?: string
}

const Cards: CardProps[] = [
  {
    image: LaughLoss,
    title: 'Si te ríes pierdes',
    transitionClass: 'laugh-loss-transition',
    href: ROUTES.LAUGH_LOSS,
    description:
      'Actividad donde podemos sacarle dinero al Baity, esperemos que si cumpla :baitydedo:',
  },
  {
    image: Doctor,
    title: 'Baity consultorio',
    transitionClass: 'baity-consultorio-transition',
    href: ROUTES.BAITY_CONSULTORIO,
    description:
      'Espacio para que el Baity lee los chisme de los Masturbaiters y nos da consejos :baitylove:',
  },
  {
    image: Reddit,
    title: 'Reddit',
    transitionClass: 'reddit-transition',
    comingSoon: true,
    href: ROUTES.REDDIT,
    description: 'Actividad donde el Baity revisa memes del Reddit :baitymeme:',
  },
]

const Home = () => {
  const navigate = useNavigate()
  return (
    <Container className="cd-w-full cd-h-full" size="md">
      <Center className="cd-w-full cd-h-full">
        <Flex align="center" direction="row" gap="lg" justify="center" wrap="wrap">
          {Cards.map((card, index) => (
            <Card
              withBorder
              className={`cd-w-[450px] ${card.transitionClass}`}
              component="a"
              href={card.href}
              key={`card-${index}`}
              padding="lg"
              radius="md"
              shadow="sm"
              onClick={(e) => {
                e.preventDefault()
                transitionView(() => navigate(card.href))
              }}
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
