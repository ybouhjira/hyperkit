import type { Preview } from 'storybook-solidjs';
import { themePresets } from '../src/theme/presets';
import { applyThemeToDOM } from '../src/theme/ThemeProvider';
import '../src/styles.css';
import './preview-scrollbar.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: Object.entries(themePresets).map(([id, theme]) => ({
          value: id,
          title: theme.name,
        })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'zed-dark',
  },
  decorators: [
    (Story, context) => {
      const themeId = context.globals.theme || 'zed-dark';
      const theme = themePresets[themeId];

      if (theme) {
        applyThemeToDOM(theme);
        document.body.style.fontFamily = theme.fonts.ui;
      }

      return Story();
    },
  ],
  parameters: {
    backgrounds: { disable: true },
  },
};

export default preview;
