import type { Plugin } from 'vite';
import type { SolidkitViewsConfig } from './types';

const PLUGIN_NAME = 'hyperkit-views';

export function hyperkitViews(config: SolidkitViewsConfig): Plugin {
  return {
    name: PLUGIN_NAME,

    buildStart() {
      console.log(`[${PLUGIN_NAME}] blueprints: ${config.blueprints}`);
      console.log(`[${PLUGIN_NAME}] output: ${config.output}`);
      console.log(`[${PLUGIN_NAME}] viewKit: ${config.viewKit}`);
      // Blueprint discovery, parsing, and codegen will be wired in future iterations
    },

    configureServer() {
      console.log(`[${PLUGIN_NAME}] dev mode — watching for blueprint changes`);
      // File watching will be added in future iterations
    },
  };
}
