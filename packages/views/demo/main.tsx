import { render } from 'solid-js/web';
import { ThemeProvider } from '@ybouhjira/hyperkit';
import { App } from './App';

render(
  () => (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  ),
  document.getElementById('app')!
);
