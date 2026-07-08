import { createMemo } from 'solid-js';
import { useDevTools } from '../context/DevToolsProvider';
import { traceElementStyles } from '../engine/CssVariableTracer';
import type { InspectedProperty } from '../context/types';

/**
 * Returns reactive list of InspectedProperty for the currently inspected element.
 */
export function useElementStyles(): () => InspectedProperty[] {
  const { state, themeName } = useDevTools();

  return createMemo(() => {
    const el = state.inspectedElement;
    if (!el) return [];
    return traceElementStyles(el, themeName());
  });
}
