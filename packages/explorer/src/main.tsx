import { render } from 'solid-js/web'
import { ThemeProvider, KeyboardProvider } from '@ybouhjira/hyperkit'
import { installTestHook } from '@ybouhjira/hyperkit-test/hook'
import { App } from './App'
import '@ybouhjira/hyperkit/dist/index.css'

installTestHook()

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

render(
  () => (
    <ThemeProvider>
      <KeyboardProvider>
        <App />
      </KeyboardProvider>
    </ThemeProvider>
  ),
  root
)
