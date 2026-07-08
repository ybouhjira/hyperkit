import { createEffect, onCleanup } from 'solid-js';
import { useDevTools } from '../context/DevToolsProvider';
import { isSolidKitElement } from '../engine/ComponentIdentifier';

/**
 * Manages inspect mode mouse interactions.
 * When inspect mode is on:
 *   - mouseover → set hovered element (if sk-* component)
 *   - click → lock selection (set inspected element, exit inspect mode)
 *   - Escape → cancel inspect mode
 */
export function useInspectMode() {
  const { state, dispatch } = useDevTools();

  createEffect(() => {
    if (!state.inspectMode) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = findSolidKitAncestor(e.target as HTMLElement);
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        dispatch({ type: 'SET_HOVERED_ELEMENT', payload: target });
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = findSolidKitAncestor(e.target as HTMLElement);
      if (target) {
        dispatch({ type: 'SET_INSPECTED_ELEMENT', payload: target });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'SET_INSPECT_MODE', payload: false });
      }
    };

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);

    onCleanup(() => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    });
  });
}

/**
 * Walk up from target to find nearest element with sk-* class.
 */
function findSolidKitAncestor(el: HTMLElement | null): HTMLElement | null {
  let current = el;
  while (current && current !== document.body) {
    if (isSolidKitElement(current)) return current;
    current = current.parentElement;
  }
  return null;
}
