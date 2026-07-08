import { onMount, onCleanup, createEffect, on } from 'solid-js';

/**
 * Post-processes paragraph and list-item elements within a container with
 * Knuth-Plass optimal line breaking. The engine is loaded via dynamic import
 * so it does not increase the bundle when the feature is unused.
 *
 * @param containerRef - accessor returning the container DOM element
 * @param content - reactive accessor for content (re-justifies when it changes)
 */
export function useKnuthPlass(
  containerRef: () => HTMLElement | undefined,
  content?: () => string | undefined
): void {
  let cleanupFn: (() => void) | null = null;

  const justify = async (): Promise<void> => {
    const container = containerRef();
    if (!container) return;

    const { justifyContent, unjustifyContent } = await import('./linebreak');

    const paragraphs = Array.from(container.querySelectorAll<HTMLElement>('p, li'));
    if (paragraphs.length === 0) return;

    // unjustifyContent accepts a single element, not a NodeList
    paragraphs.forEach((el) => {
      try {
        unjustifyContent(el);
      } catch {
        // Safe to ignore on first run — nothing to undo yet
      }
    });

    justifyContent(paragraphs);

    cleanupFn = () => {
      paragraphs.forEach((el) => {
        try {
          unjustifyContent(el);
        } catch {
          // Element may already be removed from DOM
        }
      });
    };
  };

  onMount(() => {
    // rAF ensures the browser has laid out the DOM before we measure widths
    requestAnimationFrame(() => {
      void justify();
    });
  });

  if (content) {
    createEffect(
      on(
        content,
        () => {
          requestAnimationFrame(() => {
            void justify();
          });
        },
        { defer: true }
      )
    );
  }

  onCleanup(() => {
    cleanupFn?.();
  });
}
