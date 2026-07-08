import { createContext, useContext, type JSX } from 'solid-js';
import type { DesktopAdapter } from './types';
import { WebAdapter } from './adapters/WebAdapter';

const defaultAdapter = new WebAdapter();
const DesktopContext = createContext<DesktopAdapter>(defaultAdapter);

export interface DesktopProviderProps {
  adapter?: DesktopAdapter;
  children: JSX.Element;
}

export function DesktopProvider(props: DesktopProviderProps) {
  // eslint-disable-next-line solid/reactivity -- adapter is an immutable object, not a reactive signal
  const adapter = props.adapter ?? defaultAdapter;

  return <DesktopContext.Provider value={adapter}>{props.children}</DesktopContext.Provider>;
}

export function useDesktopContext(): DesktopAdapter {
  return useContext(DesktopContext);
}
