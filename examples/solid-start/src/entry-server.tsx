// @refresh reload
import { createHandler, StartServer } from '@solidjs/start/server';
import { themePresets } from '@ybouhjira/hyperkit/src/theme/presets';
import { generateThemeCSS } from './utils/theme-ssr';

export default createHandler(() => {
  // Use the default theme for SSR (prevents FOUC)
  const defaultTheme = themePresets['zed-dark'];
  const themeCSS = generateThemeCSS(defaultTheme);

  return (
    <StartServer
      document={({ assets, children, scripts }) => (
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
            {assets}
            {/* Inject theme CSS variables for SSR to prevent FOUC */}
            <style>{themeCSS}</style>
          </head>
          <body>
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      )}
    />
  );
});
