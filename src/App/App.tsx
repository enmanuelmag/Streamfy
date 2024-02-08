import { TextInput, Container } from '@mantine/core'
import { useInputState } from '@mantine/hooks'

const App = () => {
  const [stringValue, setStringValue] = useInputState('')

  return (
    <Container size="sm">
      <TextInput
        label="Discord bot"
        placeholder="Type something"
        value={stringValue}
        onChange={setStringValue}
      />
    </Container>
  )
}

export { App }
