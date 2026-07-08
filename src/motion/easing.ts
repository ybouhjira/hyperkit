import type { EasingPreset } from './types';

/**
 * Maps SK easing preset names to CSS cubic-bezier strings.
 * All values align with the `--sk-ease-*` token family.
 */
export const easingMap: Record<EasingPreset, string> = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.6, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  spring: 'cubic-bezier(0.43, 0.195, 0.02, 1.0)',
};

/**
 * Resolves an easing value: if it matches a SK preset key, returns the
 * mapped CSS string. Otherwise passes the raw value through as-is so
 * arbitrary CSS easing strings are supported.
 */
export function resolveEasing(easing?: string): string {
  if (!easing) return easingMap.default;
  return (easingMap as Record<string, string>)[easing] ?? easing;
}
