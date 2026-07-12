// Token types that map to CSS custom properties
export type SpaceToken =
  '0' | 'px' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type BgToken =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'elevated'
  | 'accent'
  | 'accent-muted'
  | 'accent-subtle'
  | 'transparent';
export type TextColorToken =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'accent'
  | 'on-accent'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';
export type RadiusToken = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ShadowToken = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner';
export type ZToken =
  'base' | 'dropdown' | 'sticky' | 'overlay' | 'modal' | 'popover' | 'tooltip' | 'toast';
export type FontSizeToken =
  'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
export type FontWeightToken = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
