import { createMemo } from 'solid-js';
import { useDevTools } from '../context/DevToolsProvider';
import { traceVarChain } from '../engine/CssVariableTracer';
import type { CssVarTrace } from '../context/types';

/**
 * Trace a CSS value's var() chain against the inspected element.
 */
export function useCssVarTrace(rawValue: () => string): () => CssVarTrace[] {
  const { state, themeName } = useDevTools();

  return createMemo(() => {
    const el = state.inspectedElement;
    const value = rawValue();
    if (!el || !value) return [];
    return traceVarChain(el, value, themeName());
  });
}
