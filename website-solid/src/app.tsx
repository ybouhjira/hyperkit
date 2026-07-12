import { MetaProvider, Title } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import { ThemeProvider, fjordTheme } from '@ybouhjira/hyperkit';
import { SiteLayout } from './components/SiteLayout';
import '@ybouhjira/hyperkit/dist/index.css';
import './site.css';

export default function App() {
  return (
    <Router
      base="/hyperkit"
      root={(props) => (
        <MetaProvider>
          <Title>HyperKit — The application platform for SolidJS</Title>
          <ThemeProvider theme={fjordTheme}>
            <SiteLayout>
              <Suspense>{props.children}</Suspense>
            </SiteLayout>
          </ThemeProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
