import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import { ThemeProvider } from '@ybouhjira/hyperkit';
import '@ybouhjira/hyperkit/dist/index.css';

export default function App() {
  return (
    <Router
      root={(props) => (
        <ThemeProvider>
          <Suspense>{props.children}</Suspense>
        </ThemeProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
