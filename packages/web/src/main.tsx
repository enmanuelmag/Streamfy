import { createRoot } from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
//import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'

import { App } from '@pages/App'

import './index.css'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'

const theme = createTheme({
  primaryColor: 'violet',
  fontFamily: 'Open Sans, sans-serif',
})

const AppWrapper = () => (
  <MantineProvider defaultColorScheme="auto" theme={theme}>
    <Notifications />
    <App />
  </MantineProvider>
)

const root = createRoot(document.getElementById('root') as HTMLElement)

if (import.meta.env.MODE === 'test') {
  import('@src/__mocks__/browser')
    .then(({ worker }) => {
      worker.start()
    })
    .then(() => {
      root.render(<AppWrapper />)
    })
} else {
  root.render(<AppWrapper />)
}

// Uncomment if you want to see the Lighthouse report in the console
// import reportWebVitals from './reportWebVitals'
// reportWebVitals(console.log)
