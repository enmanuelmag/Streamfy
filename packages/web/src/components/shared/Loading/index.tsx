import { Center, Flex, Loader, Text } from '@mantine/core'
import React from 'react'

type LoadingProps = {
  show?: boolean
  text?: string | React.ReactNode
  loadingSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}
const Loading = ({ show, className, text, loadingSize = 'xl' }: LoadingProps) => {
  if (!show) return null

  return (
    <Center className={`${className} cd-h-full cd-w-full`}>
      <Flex align="center" direction="column" justify="center">
        <Loader size={loadingSize} />
        {React.isValidElement(text) ? (
          text
        ) : (
          <Text fz="lg" mt={8}>
            {text}
          </Text>
        )}
      </Flex>
    </Center>
  )
}

export default Loading
