import { type JSX, type Component, splitProps } from 'solid-js';
import './ScrollArea.css';

type ScrollAreaNativeAttrs = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'style' | 'class' | 'classList' | 'children'
>;

/** Props for the ScrollArea component. */
export interface ScrollAreaProps extends ScrollAreaNativeAttrs {
  /** Content to render inside the scrollable area. */
  children: JSX.Element;
  /** Maximum height before scrolling (CSS value or pixels). */
  maxHeight?: string | number;
  /** Additional CSS classes. */
  class?: string;
  /** Reactive class list merged with the base class. */
  classList?: Record<string, boolean | undefined>;
  /**
   * Inline styles merged onto the outer scroll container.
   * Useful for sizing ScrollArea as a flex child
   * (e.g. `<ScrollArea style={{ flex: '1 1 0', 'min-height': 0 }} />`)
   * without needing a wrapper Box/Flex.
   */
  style?: JSX.CSSProperties;
}

/**
 * Scrollable container with custom scrollbar styling and max-height control.
 *
 * Accepts `style`, `class`, `classList`, and all standard HTML div attributes,
 * so it can be composed directly (e.g. as a flex-1 child) without a wrapper.
 *
 * @example
 * ```tsx
 * <Flex direction="column" style={{ height: '100vh' }}>
 *   <Header />
 *   <ScrollArea style={{ flex: '1 1 0', 'min-height': 0 }}>
 *     <LongContent />
 *   </ScrollArea>
 * </Flex>
 * ```
 */
export const ScrollArea: Component<ScrollAreaProps> = (props) => {
  const [local, others] = splitProps(props, [
    'children',
    'maxHeight',
    'class',
    'classList',
    'style',
  ]);

  const computedStyle = (): JSX.CSSProperties => {
    const style: JSX.CSSProperties = { ...local.style };
    if (local.maxHeight !== undefined) {
      style['max-height'] =
        typeof local.maxHeight === 'number' ? `${local.maxHeight}px` : local.maxHeight;
    }
    return style;
  };

  return (
    <div
      class={`sk-scroll-area${local.class ? ` ${local.class}` : ''}`}
      classList={local.classList}
      style={computedStyle()}
      {...others}
    >
      {local.children}
    </div>
  );
};
