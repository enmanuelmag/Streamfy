/* eslint-disable react/display-name */
import React from 'react'
import { Flex, Group, Text, Title } from '@mantine/core'

import { $ } from '@src/utils/styles'

//import { HEIGHT_DRAWER } from '@src/components/drawer'

type OverlayScreenProps = {
  title: string
  description: string | React.ReactNode
  children?: React.ReactNode
  styles: React.CSSProperties
}

const OverlayScreen = (props: OverlayScreenProps) => {
  const { title, description, styles } = props
  return (
    <Flex
      align="center"
      className={$('cd-w-full cd-absolute cd-bg-black cd-bg-opacity-90 cd-z-50 cd-h-full')}
      direction="column"
      justify="center"
      style={styles}
    >
      <Title c="white">{title}</Title>
      {React.isValidElement(description) ? (
        description
      ) : (
        <Text c="white" mt={8} size="lg">
          {description}
        </Text>
      )}
      {/* <Group pt={16}>
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
      </Group> */}
      {props.children}
    </Flex>
  )
}

type ActionButtons = {
  children: React.ReactNode
}

OverlayScreen.ActionButtons = ({ children }: ActionButtons) => <Group pt={16}>{children}</Group>

OverlayScreen.displayName = 'OverlayScreen'

export default OverlayScreen
