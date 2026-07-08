import {
  SpaceToken,
  BgToken,
  TextColorToken,
  RadiusToken,
  ShadowToken,
  ZToken,
  FontSizeToken,
  FontWeightToken,
} from './types';

export function mapSpace(token: SpaceToken): string {
  if (token === '0') return '0';
  return `var(--sk-space-${token})`;
}

export function mapBg(token: BgToken): string {
  if (token === 'transparent') return 'transparent';
  if (token === 'accent') return 'var(--sk-accent)';
  if (token === 'accent-muted') return 'var(--sk-accent-muted)';
  if (token === 'accent-subtle') return 'var(--sk-accent-subtle)';
  return `var(--sk-bg-${token})`;
}

export function mapTextColor(token: TextColorToken): string {
  if (token === 'accent') return 'var(--sk-accent)';
  if (token === 'on-accent') return 'var(--sk-text-on-accent)';
  if (token === 'error') return 'var(--sk-error)';
  if (token === 'success') return 'var(--sk-success)';
  if (token === 'warning') return 'var(--sk-warning)';
  if (token === 'info') return 'var(--sk-info)';
  return `var(--sk-text-${token})`;
}

export function mapRadius(token: RadiusToken): string {
  if (token === 'full') return '9999px';
  return `var(--sk-radius-${token})`;
}

export function mapShadow(token: ShadowToken): string {
  return `var(--sk-shadow-${token})`;
}

export function mapZ(token: ZToken): string {
  return `var(--sk-z-${token})`;
}

export function mapFontSize(token: FontSizeToken): string {
  return `var(--sk-font-size-${token})`;
}

export function mapFontWeight(token: FontWeightToken): string {
  return `var(--sk-font-weight-${token})`;
}

export function resolveSize(val: string | number): string {
  return typeof val === 'number' ? `${val}px` : val;
}
