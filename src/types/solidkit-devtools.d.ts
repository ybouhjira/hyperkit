/**
 * Type declarations for @ybouhjira/hyperkit-devtools.
 *
 * This workspace package depends on hyperkit (circular), so its dist/
 * may not exist during the main package's tsc pass. These ambient
 * declarations let TypeScript resolve the lazy import without needing
 * the built output.
 */
declare module '@ybouhjira/hyperkit-devtools' {
  import type { Component } from 'solid-js';

  export interface DevToolsProps {
    themeName?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    product?: string;
    version?: string;
    [key: string]: unknown;
  }

  export const DevTools: Component<DevToolsProps>;
}
