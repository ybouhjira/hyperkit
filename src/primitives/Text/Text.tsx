import { Component, JSX, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import {
  TextColorToken,
  FontSizeToken,
  FontWeightToken,
  SpaceToken,
  mapTextColor,
  mapFontSize,
  mapFontWeight,
  mapSpace,
} from '../layout';
import './Text.css';

export interface TextProps {
  /** Font size token. Maps to theme typography scale. */
  size?: FontSizeToken;
  /** Font weight token or numeric value (100-900). */
  weight?: FontWeightToken | number;
  /** Text color token. Maps to theme color variables. */
  color?: TextColorToken;
  /** Text alignment. */
  align?: 'left' | 'center' | 'right';
  /** Truncate text with ellipsis on overflow.
   * @default false */
  truncate?: boolean;
  /** Limit text to specified number of lines with ellipsis. Overrides truncate. */
  lineClamp?: number;
  /** CSS gradient value for gradient text effect. Overrides color. */
  gradient?: string;
  /** CSS letter-spacing property. */
  letterSpacing?: string;
  /** Line height. Accepts CSS value or unitless number. */
  lineHeight?: string | number;
  /** Maximum width. Accepts CSS value or number (converts to px). */
  maxW?: string | number;
  /** White space handling. */
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap';
  /** Render text in italic.
   * @default false */
  italic?: boolean;
  /** Font family token. `'body'` uses the UI font (`--sk-font-ui`), `'mono'`
   * uses the monospace font (`--sk-font-code`) — ideal for timestamps, IDs,
   * shortcuts, and data.
   * @default 'body' */
  font?: 'body' | 'mono';
  /** HTML element to render as.
   * @default 'span' */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label' | 'div';
  /** Margin bottom spacing token. */
  mb?: SpaceToken;
  /** Margin top spacing token. */
  mt?: SpaceToken;
  /** Additional CSS class. */
  class?: string;
  /** Element id — anchors, aria-labelledby, tour targets. */
  id?: string;
  /** Inline styles. Merged with computed styles. */
  style?: JSX.CSSProperties;
  /** Text content. */
  children?: JSX.Element;
  /** Click event handler. */
  onClick?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;
  /** HTML title attribute for tooltip. */
  title?: string;
}

/**
 * Typography primitive for rendering text with theme-aware font sizes, weights, and colors.
 * Supports truncation, gradient text, and polymorphic rendering.
 *
 * @example
 * ```tsx
 * import { Text, Stack } from "@ybouhjira/hyperkit";
 *
 * // Page heading hierarchy
 * <Stack gap="xs">
 *   <Text as="h1" size="2xl" weight="bold">Project Overview</Text>
 *   <Text as="p" size="base" color="secondary">
 *     Review and manage all active projects across your organization.
 *   </Text>
 * </Stack>
 *
 * // Truncated filename in a table cell
 * <Text truncate maxW={200} color="primary" size="sm">
 *   very-long-filename-that-should-be-truncated.tsx
 * </Text>
 *
 * // Gradient hero headline
 * <Text
 *   as="h2"
 *   size="2xl"
 *   weight="bold"
 *   gradient="linear-gradient(135deg, var(--sk-accent), var(--sk-info))"
 * >
 *   Build faster with SolidKit
 * </Text>
 * ```
 *
 * @see Badge - for status labels
 * @see Stack - for composing text blocks with spacing
 */
export const Text: Component<TextProps> = (props) => {
  const [textProps, nativeProps] = splitProps(props, [
    'size',
    'weight',
    'color',
    'align',
    'truncate',
    'lineClamp',
    'gradient',
    'letterSpacing',
    'lineHeight',
    'maxW',
    'whiteSpace',
    'italic',
    'font',
    'as',
    'mb',
    'mt',
    'class',
    'style',
  ]);

  const computedClass = (): string => {
    const classes = ['sk-text'];

    if (textProps.align) classes.push(`sk-text--align-${textProps.align}`);
    if (textProps.truncate) classes.push('sk-text--truncate');
    if (textProps.lineClamp != null) classes.push('sk-text--clamp');
    if (textProps.whiteSpace) classes.push(`sk-text--ws-${textProps.whiteSpace}`);
    if (textProps.italic) classes.push('sk-text--italic');
    if (textProps.font) classes.push(`sk-text--font-${textProps.font}`);
    if (textProps.gradient) classes.push('sk-text--gradient');
    if (textProps.class) classes.push(textProps.class);

    return classes.join(' ');
  };

  const computedStyle = (): JSX.CSSProperties => {
    // Token-valued props resolve to var(--sk-*) references, so every value
    // below is theme-reactive; free-form props (letterSpacing, lineHeight,
    // maxW, numeric weight, gradient, lineClamp) are genuinely dynamic.
    const style: JSX.CSSProperties = {};

    if (textProps.size) {
      style['font-size'] = mapFontSize(textProps.size);
    }

    if (textProps.weight !== undefined) {
      style['font-weight'] =
        typeof textProps.weight === 'number' ? textProps.weight : mapFontWeight(textProps.weight);
    }

    if (textProps.color) {
      style.color = mapTextColor(textProps.color);
    }

    if (textProps.lineClamp != null) {
      style['--sk-text-line-clamp'] = String(textProps.lineClamp);
    }

    if (textProps.gradient) {
      style['--sk-text-gradient'] = textProps.gradient;
    }

    if (textProps.letterSpacing) {
      style['letter-spacing'] = textProps.letterSpacing;
    }

    if (textProps.lineHeight !== undefined) {
      style['line-height'] =
        typeof textProps.lineHeight === 'number'
          ? String(textProps.lineHeight)
          : textProps.lineHeight;
    }

    if (textProps.maxW !== undefined) {
      style['max-width'] =
        typeof textProps.maxW === 'number' ? `${textProps.maxW}px` : textProps.maxW;
    }

    if (textProps.mb) {
      style['margin-bottom'] = mapSpace(textProps.mb);
    }

    if (textProps.mt) {
      style['margin-top'] = mapSpace(textProps.mt);
    }

    // User style prop merges last so it can override computed values.
    return {
      ...style,
      ...textProps.style,
    };
  };

  return (
    <Dynamic
      component={textProps.as || 'span'}
      {...nativeProps}
      class={computedClass()}
      style={computedStyle()}
    />
  );
};
