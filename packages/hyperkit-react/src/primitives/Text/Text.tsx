import { createElement, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import {
  mapFontSize,
  mapFontWeight,
  mapSpace,
  mapTextColor,
  type FontSizeToken,
  type FontWeightToken,
  type SpaceToken,
  type TextColorToken,
} from '@ybouhjira/hyperkit-styles';
import '@ybouhjira/hyperkit-styles/primitives/Text/Text.css';

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'color'> {
  /** Element to render.
   * @default 'span' */
  as?: keyof HTMLElementTagNameMap;
  /** Font size token → var(--sk-font-size-*). */
  size?: FontSizeToken;
  /** Font weight token or raw numeric weight. */
  weight?: FontWeightToken | number;
  /** Text color token → var(--sk-text-*) / status colors. */
  color?: TextColorToken;
  /** Horizontal alignment modifier class. */
  align?: 'left' | 'center' | 'right';
  /** Single-line ellipsis truncation. */
  truncate?: boolean;
  /** Multi-line clamp — sets --sk-text-line-clamp. */
  lineClamp?: number;
  italic?: boolean;
  /** Font family modifier (e.g. 'mono'). */
  font?: 'ui' | 'mono' | 'heading';
  /** Margin-bottom space token. */
  mb?: SpaceToken;
  /** Margin-top space token. */
  mt?: SpaceToken;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Polymorphic text primitive rendering the same `sk-text` CSS contract as the
 * SolidJS package. Token-valued props resolve to var(--sk-*) references, so
 * every value is theme-reactive.
 */
export function Text({
  as = 'span',
  size,
  weight,
  color,
  align,
  truncate,
  lineClamp,
  italic,
  font,
  mb,
  mt,
  className,
  style,
  children,
  ...rest
}: TextProps) {
  const classes = ['sk-text'];
  if (align) classes.push(`sk-text--align-${align}`);
  if (truncate) classes.push('sk-text--truncate');
  if (lineClamp != null) classes.push('sk-text--clamp');
  if (italic) classes.push('sk-text--italic');
  if (font) classes.push(`sk-text--font-${font}`);
  if (className) classes.push(className);

  const computed: CSSProperties = {};
  if (size) computed.fontSize = mapFontSize(size);
  if (weight !== undefined) {
    computed.fontWeight = typeof weight === 'number' ? weight : mapFontWeight(weight);
  }
  if (color) computed.color = mapTextColor(color);
  if (lineClamp != null) {
    (computed as Record<string, unknown>)['--sk-text-line-clamp'] = String(lineClamp);
  }
  if (mb) computed.marginBottom = mapSpace(mb);
  if (mt) computed.marginTop = mapSpace(mt);

  return createElement(
    as,
    { className: classes.join(' '), style: { ...computed, ...style }, ...rest },
    children
  );
}
