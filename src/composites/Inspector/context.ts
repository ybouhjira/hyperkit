import { createContext, useContext } from 'solid-js';
import type { InspectorStorage } from './types';

export interface InspectorContextValue {
  storage: InspectorStorage;
}

export const InspectorContext = createContext<InspectorContextValue>();

export function useInspectorStorage(): InspectorStorage {
  const ctx = useContext(InspectorContext);
  if (!ctx) {
    throw new Error('useInspectorStorage must be used inside <InspectorProvider>');
  }
  return ctx.storage;
}
