import { useDesktopContext } from './DesktopProvider';
import type { DesktopAdapter, DesktopCapability } from './types';

export interface UseDesktopReturn {
  adapter: DesktopAdapter;
  hasCapability(cap: DesktopCapability): boolean;
}

export function useDesktop(): UseDesktopReturn {
  const adapter = useDesktopContext();
  return {
    adapter,
    hasCapability: (cap: DesktopCapability) => adapter.capabilities.has(cap),
  };
}
