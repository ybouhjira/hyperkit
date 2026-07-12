// @refresh reload
import { createHandler, StartServer } from '@solidjs/start/server';
import { fjordTheme, serializeThemeVars } from '@ybouhjira/hyperkit';

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en" data-theme="fjord">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/hyperkit/img/favicon.svg" />
          {assets}
          {/* Default theme tokens inline so static HTML paints correctly
              before hydration (no FOUC). */}
          <style>{`:root{${serializeThemeVars(fjordTheme)}}`}</style>
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
