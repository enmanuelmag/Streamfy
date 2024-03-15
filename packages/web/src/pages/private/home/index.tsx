import React from 'react'
import { Card, Center, Container, Flex, Image, Overlay, Text } from '@mantine/core'

import { ROUTES } from '@src/constants/routes'

import Reddit from '@assets/images/reddit.png'
import Doctor from '@assets/images/consultorio.png'
import LaughLoss from '@assets/images/si_ries_pierdes.jpg'
import { useNavigate } from 'react-router-dom'
import { transitionView } from '@src/utils/viewTransition'
import { EMOJIS } from '@src/constants/emoji'
import { modals } from '@mantine/modals'

type CardProps = {
  image: string
  href: string
  title: string
  description: string | React.ReactNode
  comingSoon?: boolean
  transitionClass?: string
}

const Cards: CardProps[] = [
  {
    image: LaughLoss,
    title: 'Si te ríes pierdes',
    transitionClass: 'laugh-loss-transition',
    href: ROUTES.LAUGH_LOSS,
    description: (
      <Text c="dimmed" size="sm">
        Actividad donde podemos sacarle dinero al Baity, esperemos que si cumpla{' '}
        <Image alt="Baity" className="!cd-inline" h={20} src={EMOJIS.BAITY_DEDO} w={20} />
      </Text>
    ),
  },
  {
    image: Doctor,
    title: 'Baity consultorio',
    transitionClass: 'baity-consultorio-transition',
    href: ROUTES.BAITY_CONSULTORIO,
    description: (
      <Text c="dimmed" size="sm">
        Espacio para que el Baity lee los chisme de los Masturbaiters y nos da consejos{' '}
        <Image alt="Baity" className="!cd-inline" h={20} src={EMOJIS.BAITY_LOVE} w={20} />
      </Text>
    ),
  },
  {
    image: Reddit,
    title: 'Reddit',
    transitionClass: 'reddit-transition',
    comingSoon: true,
    href: ROUTES.REDDIT,
    description: (
      <Text c="dimmed" size="sm">
        Actividad donde el Baity revisa memes del Reddit{' '}
        <Image alt="Reddit" className="!cd-inline" h={20} src={EMOJIS.BAITY_MEME} w={20} />
      </Text>
    ),
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

                if (card.comingSoon) {
                  modals.open({
                    centered: true,
                    title: 'Próximamente',
                    children: (
                      <Text>
                        Esta actividad estará disponible en el futuro, lo prometo asi como las
                        promesas del Baity
                      </Text>
                    ),
                  })
                  return
                }
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

              {React.isValidElement(card.description) ? (
                card.description
              ) : (
                <Text c="dimmed" mt="sm">
                  {card.description}
                </Text>
              )}
            </Card>
          ))}
        </Flex>
      </Center>
    </Container>
  )
}

export default Home
