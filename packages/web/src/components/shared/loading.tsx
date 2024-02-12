import { Center, Flex, Loader, Text } from '@mantine/core'
import React from 'react'

type LoadingProps = {
  text?: string | React.ReactNode
  loadingSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}
const Loading = ({ text, loadingSize = 'xl' }: LoadingProps) => {
  return (
    <Center h="100%" w="100%">
      <Flex align="center" direction="column" justify="center">
        <Loader size={loadingSize} />
        {React.isValidElement(text) ? text : <Text fz="lg">{text}</Text>}
      </Flex>
    </Center>
  )
}

export default Loading
