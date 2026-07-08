import type { StorybookConfig } from 'storybook-solidjs-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: 'storybook-solidjs-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal(config) {
    config.build ??= {};
    config.build.rollupOptions ??= {};
    (config.build.rollupOptions as { external?: string[] }).external = [
      '@ybouhjira/hyperkit-devtools',
    ];
    return config;
  },
};

export default config;
