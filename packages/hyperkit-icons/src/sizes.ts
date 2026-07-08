/** Maps SolidKit icon size tokens to pixel values (matches --sk-icon-*) */
export const ICON_SIZES: Record<string, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

export function resolveSize(size: number | string | undefined): number {
  if (size == null) return 24;
  if (typeof size === 'number') return size;
  return ICON_SIZES[size] ?? 24;
}
