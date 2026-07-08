import type { JSX } from 'solid-js';

/** Visual style for icon rendering */
export type IconStyle = 'fluent' | 'glossy' | 'frosted' | 'neumorphic' | 'neon' | 'gradient-stroke';

/** Icon category — determines color palette */
export type IconCategory = 'transform' | 'annotate' | 'convert' | 'security' | 'optimize' | 'ai';

/** Semantic role of each shape layer */
export type LayerRole = 'bg' | 'main' | 'accent' | 'detail';

/** A single SVG shape in an icon definition */
export interface ShapeLayer {
  tag: 'rect' | 'circle' | 'ellipse' | 'path' | 'text';
  role: LayerRole;
  attrs: Record<string, string | number>;
  /** Text content for <text> elements */
  children?: string;
}

/** Complete icon definition — geometry + metadata */
export interface IconDef {
  name: string;
  category: IconCategory;
  tags: string[];
  layers: ShapeLayer[];
}

/** Props for the <Icon> component */
export interface IconProps {
  /** The icon definition to render */
  def: IconDef;
  /** Size in pixels or token name */
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Visual style override (defaults to IconProvider context) */
  style?: IconStyle;
  /** Additional CSS class */
  class?: string;
}

/** Props for shorthand icon components (e.g., <MergeIcon />) */
export interface SimpleIconProps {
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  style?: IconStyle;
  class?: string;
}

/** Color palette for a category */
export interface CategoryPalette {
  primary: string;
  primaryDark: string;
  light: string;
}

/** Style renderer function signature */
export type StyleRenderer = (layers: ShapeLayer[], palette: CategoryPalette, size: number) => JSX.Element;
