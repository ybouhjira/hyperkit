import type { DesktopAdapter } from '../types';

export class WebAdapter implements DesktopAdapter {
  readonly capabilities: ReadonlySet<never> = new Set();
}
