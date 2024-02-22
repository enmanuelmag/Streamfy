import { Button, Flex, Group, Text, Title } from '@mantine/core'

type EndGameProps = {
  title: string
  description: string
  styles: React.CSSProperties
  handleReset?: () => void
  handleGoHome?: () => void
  handleContinue?: () => void
}

const EndGame = (props: EndGameProps) => {
  const { title, description, handleGoHome, handleReset, handleContinue, styles } = props
  return (
    <Flex
      align="center"
      className="cd-h-full cd-w-full cd-absolute cd-bg-black cd-bg-opacity-90 cd-z-50"
      direction="column"
      justify="center"
      style={styles}
    >
      <Title c="white">{title}</Title>
      <Text fz="xl">{description}</Text>
      <Group pt={16}>
        {handleGoHome && (
          <Button variant="filled" onClick={handleGoHome}>
            Ir a Inicio
          </Button>
        )}
        {handleReset && (
          <Button variant="light" onClick={handleReset}>
            Repetir
          </Button>
        )}
        {handleContinue && (
          <Button variant="filled" onClick={handleContinue}>
            Continuar
          </Button>
        )}
      </Group>
    </Flex>
  )
}

export default EndGame
