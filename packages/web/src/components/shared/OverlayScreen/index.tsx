import { Button, Flex, Group, Text, Title } from '@mantine/core'

import { $ } from '@src/utils/styles'

import { HEIGHT_DRAWER } from '@src/components/drawer'

type OverlayScreenProps = {
  title: string
  description: string
  styles: React.CSSProperties
  handleReset?: () => void
  handleGoHome?: () => void
  handleContinue?: () => void
}

const OverlayScreen = (props: OverlayScreenProps) => {
  const { title, description, handleGoHome, handleReset, handleContinue, styles } = props
  return (
    <Flex
      align="center"
      className={$(
        'cd-w-full cd-absolute cd-bg-black cd-bg-opacity-90 cd-z-50',
        `cd-h-[calc(100%-${HEIGHT_DRAWER}px)]`,
      )}
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

export default OverlayScreen
