// Core types
export type {
  IconStyle,
  IconCategory,
  LayerRole,
  ShapeLayer,
  IconDef,
  IconProps,
  SimpleIconProps,
  CategoryPalette,
  StyleRenderer,
} from './types';

// Core components
export { Icon } from './Icon';
export { IconProvider, useIconStyle } from './IconProvider';
export type { IconProviderProps } from './IconProvider';

// Factory
export { makeIcon } from './makeIcon';

// Data
export { CATEGORY_PALETTES } from './palettes';
export { ICON_SIZES, resolveSize } from './sizes';

// Icon definitions (raw data for custom rendering)
export * from './icons';

// Searchable icon catalog
export {
  ICON_CATALOG,
  ICON_COUNT,
  getIconById,
  getIconsByCategory,
  searchIcons,
} from './catalog';
export type { CatalogEntry } from './catalog';

// Shorthand icon components
export * from './components';
