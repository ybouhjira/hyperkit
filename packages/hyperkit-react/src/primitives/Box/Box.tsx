import { createElement, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import {
  mapBg,
  mapRadius,
  mapShadow,
  mapSpace,
  mapTextColor,
  resolveSize,
  type BgToken,
  type RadiusToken,
  type ShadowToken,
  type SpaceToken,
  type TextColorToken,
} from '@ybouhjira/hyperkit-styles';

export interface BoxProps extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'color'> {
  /** Element to render.
   * @default 'div' */
  as?: keyof HTMLElementTagNameMap;
  /** Padding — space token → var(--sk-space-*). */
  p?: SpaceToken;
  px?: SpaceToken;
  py?: SpaceToken;
  m?: SpaceToken;
  mx?: SpaceToken;
  my?: SpaceToken;
  /** Width/height — numbers become px. */
  w?: string | number;
  h?: string | number;
  bg?: BgToken;
  color?: TextColorToken;
  radius?: RadiusToken;
  shadow?: ShadowToken;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Base polymorphic container — token props resolve to var(--sk-*) inline
 * styles, matching the SolidJS Box mapping.
 */
export function Box({
  as = 'div',
  p,
  px,
  py,
  m,
  mx,
  my,
  w,
  h,
  bg,
  color,
  radius,
  shadow,
  className,
  style,
  children,
  ...rest
}: BoxProps) {
  const computed: CSSProperties = {};
  if (p) computed.padding = mapSpace(p);
  if (px) {
    computed.paddingLeft = mapSpace(px);
    computed.paddingRight = mapSpace(px);
  }
  if (py) {
    computed.paddingTop = mapSpace(py);
    computed.paddingBottom = mapSpace(py);
  }
  if (m) computed.margin = mapSpace(m);
  if (mx) {
    computed.marginLeft = mapSpace(mx);
    computed.marginRight = mapSpace(mx);
  }
  if (my) {
    computed.marginTop = mapSpace(my);
    computed.marginBottom = mapSpace(my);
  }
  if (w !== undefined) computed.width = resolveSize(w);
  if (h !== undefined) computed.height = resolveSize(h);
  if (bg) computed.background = mapBg(bg);
  if (color) computed.color = mapTextColor(color);
  if (radius) computed.borderRadius = mapRadius(radius);
  if (shadow) computed.boxShadow = mapShadow(shadow);

  return createElement(as, { className, style: { ...computed, ...style }, ...rest }, children);
}
