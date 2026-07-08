import type { ContentRef, NavigableResult, NavigationTarget } from './types';
import { useNavigation } from './NavigationContext';

/**
 * Makes any element navigable — click opens content in default panel,
 * Ctrl+Click (or Cmd+Click on Mac) shows "Open in..." context menu.
 */
export function useNavigable(
  contentRef: () => ContentRef,
  options?: {
    /** Custom handler for "Open in..." menu. If not provided, uses default NavigationMenu. */
    onOpenMenu?: (ref: ContentRef, position: { x: number; y: number }) => void;
    /** Override default navigation target for normal clicks */
    defaultTarget?: NavigationTarget;
  }
): NavigableResult {
  const nav = useNavigation();

  const onClick = (e: MouseEvent): void => {
    const ref = contentRef();

    // Ctrl+Click or Cmd+Click → show context menu
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      const pos = { x: e.clientX, y: e.clientY };
      options?.onOpenMenu?.(ref, pos);
      return;
    }

    // Normal click → open in default target
    nav.openContent(ref, options?.defaultTarget);
  };

  const onContextMenu = (e: MouseEvent): void => {
    // Right-click also shows navigation menu
    e.preventDefault();
    e.stopPropagation();
    const ref = contentRef();
    const pos = { x: e.clientX, y: e.clientY };
    options?.onOpenMenu?.(ref, pos);
  };

  const ref = contentRef();

  return {
    onClick,
    onContextMenu,
    props: {
      'data-navigable': 'true' as const,
      'data-content-type': ref.type,
      'data-content-id': ref.id,
    },
  };
}
