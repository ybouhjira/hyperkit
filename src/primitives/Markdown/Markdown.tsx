import {
  Component,
  createMemo,
  splitProps,
  Show,
  onMount,
  createEffect,
  on,
  untrack,
} from 'solid-js';
import type { JSX } from 'solid-js';
import { parse } from './core/parser';
import { renderAST } from './renderer';
import { MarkdownComponentsContext } from './context';
import type { MarkdownComponents } from './context';
import '@ybouhjira/hyperkit-styles/primitives/Markdown/Markdown.css';

export interface MarkdownProps {
  /** Markdown content string to render */
  content: string;
  /** Whether content is still streaming (shows cursor) */
  streaming?: boolean;
  /** Custom component overrides */
  components?: Partial<MarkdownComponents>;
  /** Additional CSS class */
  class?: string;
  /** Additional inline styles */
  style?: JSX.CSSProperties;
  /**
   * Apply Knuth-Plass optimal line breaking to paragraph and list-item
   * elements. Requires `text-align: justify` to be set on the container for
   * the inter-word spacing to be visible. Off by default to keep the
   * line-breaking engine out of the bundle when unused.
   */
  justify?: boolean;
}

/** @deprecated Use MarkdownProps instead */
export type MarkdownRendererProps = MarkdownProps;

/** Markdown renderer with syntax highlighting, streaming support, and custom components. */
export const Markdown: Component<MarkdownProps> = (props) => {
  const [local, others] = splitProps(props, [
    'content',
    'streaming',
    'components',
    'class',
    'style',
    'justify',
  ]);

  const ast = createMemo(() => {
    try {
      return parse(local.content);
    } catch {
      // Fallback: wrap content as single paragraph
      return {
        type: 'root' as const,
        children: [
          {
            type: 'paragraph' as const,
            children: [{ type: 'text' as const, content: local.content }],
            rawContent: local.content,
          },
        ],
        definitions: new Map(),
      };
    }
  });

  const rendered = createMemo(() => renderAST(ast()));

  let containerRef: HTMLDivElement | undefined;

  // Knuth-Plass justification — runs only when the opt-in prop is set.
  // Reading justify once at creation time is intentional: the prop is not
  // expected to toggle after mount, matching standard SolidJS hook semantics.
  if (untrack(() => local.justify)) {
    const runJustify = async (): Promise<void> => {
      if (!containerRef) return;
      const { justifyContent, unjustifyContent } = await import('../../typography/linebreak');
      const paragraphs = Array.from(containerRef.querySelectorAll<HTMLElement>('p, li'));
      if (paragraphs.length === 0) return;
      paragraphs.forEach((el) => {
        try {
          unjustifyContent(el);
        } catch {
          // Nothing to undo on first run
        }
      });
      justifyContent(paragraphs);
    };

    onMount(() => {
      requestAnimationFrame(() => {
        void runJustify();
      });
    });

    createEffect(
      on(
        () => local.content,
        () => {
          requestAnimationFrame(() => {
            void runJustify();
          });
        },
        { defer: true }
      )
    );
  }

  return (
    // eslint-disable-next-line solid/reactivity
    <MarkdownComponentsContext.Provider value={local.components ?? {}}>
      <div
        ref={containerRef}
        data-testid="markdown-renderer"
        class={`sk-markdown sk-prose ${local.class ?? ''}`}
        style={local.style}
        {...others}
      >
        {rendered()}
        <Show when={local.streaming}>
          <span class="sk-markdown__cursor" data-testid="markdown-cursor">
            ▊
          </span>
        </Show>
      </div>
    </MarkdownComponentsContext.Provider>
  );
};

/** @deprecated Use Markdown instead */
export const MarkdownRenderer = Markdown;
