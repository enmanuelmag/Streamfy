import { Center, Flex, Loader, Text } from '@mantine/core'
import React from 'react'

type LoadingProps = {
  text?: string | React.ReactNode
  loadingSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}
const Loading = ({ className, text, loadingSize = 'xl' }: LoadingProps) => {
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
