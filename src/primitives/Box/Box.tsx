import { Component, JSX, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import {
  SpaceToken,
  BgToken,
  TextColorToken,
  RadiusToken,
  ShadowToken,
  ZToken,
  mapSpace,
  mapBg,
  mapTextColor,
  mapRadius,
  mapShadow,
  mapZ,
  resolveSize,
} from '../layout';

/**
 * Native HTML attributes forwarded to the underlying element.
 * Keys that Box defines with its own (narrower or tokenized) types are omitted
 * so our explicit typings win: spacing/sizing/color props, class/style,
 * event handlers Box wires itself, and `children`/`ref`.
 */
type BoxNativeAttrs = Omit<
  JSX.HTMLAttributes<HTMLElement>,
  // Box-defined / conflicting keys
  | 'style'
  | 'class'
  | 'classList'
  | 'children'
  | 'ref'
  | 'color'
  | 'onClick'
  | 'onMouseDown'
  | 'onDragOver'
  | 'onDragLeave'
  | 'onDrop'
  | 'onSubmit'
  | 'onReset'
  | 'onChange'
  | 'onMouseEnter'
  | 'onMouseLeave'
>;

export interface BoxProps extends BoxNativeAttrs {
  // Spacing
  /** Padding on all sides. */
  p?: SpaceToken;
  /** Horizontal padding (left and right). */
  px?: SpaceToken;
  /** Vertical padding (top and bottom). */
  py?: SpaceToken;
  /** Padding top. */
  pt?: SpaceToken;
  /** Padding right. */
  pr?: SpaceToken;
  /** Padding bottom. */
  pb?: SpaceToken;
  /** Padding left. */
  pl?: SpaceToken;
  /** Margin on all sides. */
  m?: SpaceToken;
  /** Horizontal margin (left and right). */
  mx?: SpaceToken;
  /** Vertical margin (top and bottom). */
  my?: SpaceToken;
  /** Margin top. */
  mt?: SpaceToken;
  /** Margin right. */
  mr?: SpaceToken;
  /** Margin bottom. */
  mb?: SpaceToken;
  /** Margin left. */
  ml?: SpaceToken;
  // Sizing
  /** Width. Accepts CSS value or number (converts to px). */
  w?: string | number;
  /** Height. Accepts CSS value or number (converts to px). */
  h?: string | number;
  /** Minimum width. Accepts CSS value or number (converts to px). */
  minW?: string | number;
  /** Minimum height. Accepts CSS value or number (converts to px). */
  minH?: string | number;
  /** Maximum width. Accepts CSS value or number (converts to px). */
  maxW?: string | number;
  /** Maximum height. Accepts CSS value or number (converts to px). */
  maxH?: string | number;
  // Appearance
  /** Background color token. Maps to theme CSS variables. */
  bg?: BgToken;
  /** Text color token. Maps to theme CSS variables. */
  color?: TextColorToken;
  /** Border radius token. Maps to theme CSS variables. */
  borderRadius?: RadiusToken;
  /** Box shadow token. Maps to theme CSS variables. */
  shadow?: ShadowToken;
  // Border
  /** Enable border on all sides.
   * @default false */
  border?: boolean;
  /** Border color variant.
   * @default 'default' */
  borderColor?: 'default' | 'subtle' | 'accent';
  /** Enable bottom border only.
   * @default false */
  borderBottom?: boolean;
  /** Enable top border only.
   * @default false */
  borderTop?: boolean;
  /** Enable left border only.
   * @default false */
  borderLeft?: boolean;
  /** Enable right border only.
   * @default false */
  borderRight?: boolean;
  // Position
  /** CSS position property. */
  position?: 'relative' | 'absolute' | 'fixed' | 'sticky';
  /** Top offset. Accepts CSS value or number (converts to px). */
  top?: string | number;
  /** Right offset. Accepts CSS value or number (converts to px). */
  right?: string | number;
  /** Bottom offset. Accepts CSS value or number (converts to px). */
  bottom?: string | number;
  /** Left offset. Accepts CSS value or number (converts to px). */
  left?: string | number;
  /** Inset shorthand for top/right/bottom/left. Accepts CSS value or number (converts to px). */
  inset?: string | number;
  /** Z-index. Accepts ZToken or raw number. */
  zIndex?: ZToken | number;
  // Display
  /** Overflow behavior. */
  overflow?: 'hidden' | 'auto' | 'scroll' | 'visible';
  /** Display type. */
  display?: 'block' | 'flex' | 'grid' | 'inline' | 'inline-flex' | 'inline-block' | 'none';
  // Interactive (hover via JS like Card pattern)
  /** Background color token on hover. Applied via JavaScript. */
  hoverBg?: BgToken;
  /** Text color token on hover. Applied via JavaScript. */
  hoverColor?: TextColorToken;
  /** Cursor style. */
  cursor?: 'pointer' | 'default' | 'grab' | 'not-allowed';
  /** Enable transition animation on all properties.
   * @default false */
  transition?: boolean;
  // Visual
  /** Opacity value (0-1). */
  opacity?: number;
  /** CSS backdrop-filter property. */
  backdropFilter?: string;
  /** CSS filter property. */
  filter?: string;
  /** CSS transform property. */
  transform?: string;
  /** Pointer events behavior. */
  pointerEvents?: 'none' | 'auto';
  // Animation
  /** CSS animation property. */
  animation?: string;
  // Background (raw)
  /** Raw CSS background property. Overrides bg token. */
  background?: string;
  // Border (extended)
  /** CSS border-width property. */
  borderWidth?: string;
  /** CSS border-style property. */
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  // Flex child
  /** CSS flex property for flex children. */
  flex?: string | number;
  /** Align-self for flex children. */
  alignSelf?: 'start' | 'center' | 'end' | 'stretch';
  // Polymorphic
  /** HTML element to render as.
   * @default 'div' */
  as?: string;
  // Standard
  /** Additional CSS classes. */
  class?: string;
  /** Inline styles. Merged with computed styles. */
  style?: JSX.CSSProperties;
  /** Content to render inside the box. */
  children?: JSX.Element;
  // Event handlers - pass through
  /** Click event handler. */
  onClick?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;
  /** Mouse down event handler. */
  onMouseDown?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;
  /** Drag over event handler. */
  onDragOver?: JSX.EventHandlerUnion<HTMLElement, DragEvent>;
  /** Drag leave event handler. */
  onDragLeave?: JSX.EventHandlerUnion<HTMLElement, DragEvent>;
  /** Drop event handler. */
  onDrop?: JSX.EventHandlerUnion<HTMLElement, DragEvent>;
  /** Form submit handler. Only meaningful when `as="form"`. */
  onSubmit?: JSX.EventHandlerUnion<HTMLFormElement, SubmitEvent>;
  /** Form reset handler. Only meaningful when `as="form"`. */
  onReset?: JSX.EventHandlerUnion<HTMLFormElement, Event>;
  /** Change event handler. Typed loosely to support form inputs bubbling. */
  onChange?: JSX.EventHandlerUnion<HTMLElement, Event>;
  /** Element ref callback or ref object. */
  ref?: HTMLElement | ((el: HTMLElement) => void);
}

/** Versatile layout primitive with comprehensive styling props. Supports polymorphic rendering, spacing tokens, and hover states. */
export const Box: Component<BoxProps> = (props) => {
  const [local, others] = splitProps(props, [
    'p',
    'px',
    'py',
    'pt',
    'pr',
    'pb',
    'pl',
    'm',
    'mx',
    'my',
    'mt',
    'mr',
    'mb',
    'ml',
    'w',
    'h',
    'minW',
    'minH',
    'maxW',
    'maxH',
    'bg',
    'color',
    'borderRadius',
    'shadow',
    'border',
    'borderColor',
    'borderBottom',
    'borderTop',
    'borderLeft',
    'borderRight',
    'position',
    'top',
    'right',
    'bottom',
    'left',
    'inset',
    'zIndex',
    'overflow',
    'display',
    'hoverBg',
    'hoverColor',
    'cursor',
    'transition',
    'opacity',
    'backdropFilter',
    'filter',
    'transform',
    'pointerEvents',
    'animation',
    'background',
    'borderWidth',
    'borderStyle',
    'flex',
    'alignSelf',
    'as',
    'class',
    'style',
    'children',
    'onClick',
    'onMouseDown',
    'onDragOver',
    'onDragLeave',
    'onDrop',
    'onSubmit',
    'onReset',
    'onChange',
    'ref',
  ]);

  const computedStyle = (): JSX.CSSProperties => {
    const style: JSX.CSSProperties = { ...local.style };

    // Padding
    if (local.p) {
      style.padding = mapSpace(local.p);
    }
    if (local.px) {
      style['padding-left'] = mapSpace(local.px);
      style['padding-right'] = mapSpace(local.px);
    }
    if (local.py) {
      style['padding-top'] = mapSpace(local.py);
      style['padding-bottom'] = mapSpace(local.py);
    }
    if (local.pt) style['padding-top'] = mapSpace(local.pt);
    if (local.pr) style['padding-right'] = mapSpace(local.pr);
    if (local.pb) style['padding-bottom'] = mapSpace(local.pb);
    if (local.pl) style['padding-left'] = mapSpace(local.pl);

    // Margin
    if (local.m) {
      style.margin = mapSpace(local.m);
    }
    if (local.mx) {
      style['margin-left'] = mapSpace(local.mx);
      style['margin-right'] = mapSpace(local.mx);
    }
    if (local.my) {
      style['margin-top'] = mapSpace(local.my);
      style['margin-bottom'] = mapSpace(local.my);
    }
    if (local.mt) style['margin-top'] = mapSpace(local.mt);
    if (local.mr) style['margin-right'] = mapSpace(local.mr);
    if (local.mb) style['margin-bottom'] = mapSpace(local.mb);
    if (local.ml) style['margin-left'] = mapSpace(local.ml);

    // Sizing
    if (local.w != null) style.width = resolveSize(local.w);
    if (local.h != null) style.height = resolveSize(local.h);
    if (local.minW != null) style['min-width'] = resolveSize(local.minW);
    if (local.minH != null) style['min-height'] = resolveSize(local.minH);
    if (local.maxW != null) style['max-width'] = resolveSize(local.maxW);
    if (local.maxH != null) style['max-height'] = resolveSize(local.maxH);

    // Appearance
    if (local.bg) style.background = mapBg(local.bg);
    if (local.color) style.color = mapTextColor(local.color);
    if (local.borderRadius) style['border-radius'] = mapRadius(local.borderRadius);
    if (local.shadow) style['box-shadow'] = mapShadow(local.shadow);

    // Border
    if (local.border) {
      const borderColorValue =
        local.borderColor === 'subtle'
          ? 'var(--sk-border-subtle)'
          : local.borderColor === 'accent'
            ? 'var(--sk-accent)'
            : 'var(--sk-border)';
      style.border = `1px solid ${borderColorValue}`;
    }
    if (local.borderBottom) {
      const borderColorValue =
        local.borderColor === 'subtle'
          ? 'var(--sk-border-subtle)'
          : local.borderColor === 'accent'
            ? 'var(--sk-accent)'
            : 'var(--sk-border)';
      style['border-bottom'] = `1px solid ${borderColorValue}`;
    }
    if (local.borderTop) {
      const borderColorValue =
        local.borderColor === 'subtle'
          ? 'var(--sk-border-subtle)'
          : local.borderColor === 'accent'
            ? 'var(--sk-accent)'
            : 'var(--sk-border)';
      style['border-top'] = `1px solid ${borderColorValue}`;
    }
    if (local.borderLeft) {
      const borderColorValue =
        local.borderColor === 'subtle'
          ? 'var(--sk-border-subtle)'
          : local.borderColor === 'accent'
            ? 'var(--sk-accent)'
            : 'var(--sk-border)';
      style['border-left'] = `1px solid ${borderColorValue}`;
    }
    if (local.borderRight) {
      const borderColorValue =
        local.borderColor === 'subtle'
          ? 'var(--sk-border-subtle)'
          : local.borderColor === 'accent'
            ? 'var(--sk-accent)'
            : 'var(--sk-border)';
      style['border-right'] = `1px solid ${borderColorValue}`;
    }

    // Position
    if (local.position) style.position = local.position;
    if (local.top !== undefined) style.top = resolveSize(local.top);
    if (local.right !== undefined) style.right = resolveSize(local.right);
    if (local.bottom !== undefined) style.bottom = resolveSize(local.bottom);
    if (local.left !== undefined) style.left = resolveSize(local.left);
    if (local.inset !== undefined) style.inset = resolveSize(local.inset);
    if (local.zIndex !== undefined) {
      style['z-index'] = typeof local.zIndex === 'number' ? local.zIndex : mapZ(local.zIndex);
    }

    // Display
    if (local.overflow) style.overflow = local.overflow;
    if (local.display) style.display = local.display;

    // Interactive
    if (local.cursor) style.cursor = local.cursor;
    if (local.transition) {
      style.transition = 'all var(--sk-duration-fast) var(--sk-ease-default)';
    }

    // Visual
    if (local.opacity !== undefined) style.opacity = local.opacity;
    if (local.backdropFilter) style['backdrop-filter'] = local.backdropFilter;
    if (local.filter) style.filter = local.filter;
    if (local.transform) style.transform = local.transform;
    if (local.pointerEvents) style['pointer-events'] = local.pointerEvents;
    // Animation
    if (local.animation) style.animation = local.animation;
    // Background (raw - overrides bg token)
    if (local.background) style.background = local.background;
    // Border (extended)
    if (local.borderWidth) style['border-width'] = local.borderWidth;
    if (local.borderStyle) style['border-style'] = local.borderStyle;

    // Flex child
    if (local.flex !== undefined) {
      style.flex = typeof local.flex === 'number' ? local.flex : local.flex;
    }
    if (local.alignSelf) {
      style['align-self'] =
        local.alignSelf === 'start'
          ? 'flex-start'
          : local.alignSelf === 'end'
            ? 'flex-end'
            : local.alignSelf;
    }

    return style;
  };

  const handleMouseEnter = (e: MouseEvent) => {
    if (!local.hoverBg && !local.hoverColor) return;
    const target = e.currentTarget as HTMLElement;
    if (local.hoverBg) target.style.background = mapBg(local.hoverBg);
    if (local.hoverColor) target.style.color = mapTextColor(local.hoverColor);
  };

  const handleMouseLeave = (e: MouseEvent) => {
    if (!local.hoverBg && !local.hoverColor) return;
    const target = e.currentTarget as HTMLElement;
    if (local.hoverBg) target.style.background = local.bg ? mapBg(local.bg) : '';
    if (local.hoverColor) target.style.color = local.color ? mapTextColor(local.color) : '';
  };

  return (
    <Dynamic
      component={local.as || 'div'}
      class={local.class}
      style={computedStyle()}
      onClick={local.onClick}
      onMouseDown={local.onMouseDown}
      onDragOver={local.onDragOver}
      onDragLeave={local.onDragLeave}
      onDrop={local.onDrop}
      onSubmit={local.onSubmit}
      onReset={local.onReset}
      onChange={local.onChange}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={local.ref}
      {...others}
    >
      {local.children}
    </Dynamic>
  );
};
