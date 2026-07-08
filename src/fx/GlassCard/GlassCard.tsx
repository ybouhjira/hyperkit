import { type Component, type JSX, splitProps } from 'solid-js';
import './GlassCard.css';

export interface GlassCardProps {
  /**
   * Backdrop blur radius in pixels
   * @default 12
   */
  blur?: number;
  /**
   * Background opacity (0-1)
   * @default 0.15
   */
  opacity?: number;
  /**
   * Show border
   * @default true
   */
  border?: boolean;
  /**
   * Tint color of the glass surface
   * @default 'light'
   */
  tint?: 'light' | 'dark' | 'accent';
  children: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

/**
 * GlassCard - Glassmorphism card with backdrop blur.
 *
 * @example
 * ```tsx
 * <GlassCard blur={16} opacity={0.2} tint="accent">
 *   <p>Frosted glass surface</p>
 * </GlassCard>
 * ```
 */
export const GlassCard: Component<GlassCardProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'blur',
    'opacity',
    'border',
    'tint',
    'children',
    'class',
    'style',
  ]);

  const blur = () => local.blur ?? 12;
  const opacity = () => local.opacity ?? 0.15;
  const tint = () => local.tint ?? 'light';
  const border = () => local.border ?? true;

  const tintVar = () => {
    switch (tint()) {
      case 'dark':
        return 'var(--sk-bg-primary)';
      case 'accent':
        return 'var(--sk-accent)';
      default:
        return 'var(--sk-bg-elevated, var(--sk-bg-secondary))';
    }
  };

  const classes = () =>
    ['sk-glass-card', border() && 'sk-glass-card--border', local.class].filter(Boolean).join(' ');

  const inlineStyle = (): JSX.CSSProperties =>
    ({
      '--sk-glass-blur': `${blur()}px`,
      '--sk-glass-opacity': String(opacity()),
      '--sk-glass-tint': tintVar(),
      ...local.style,
    }) as JSX.CSSProperties;

  return (
    <div class={classes()} style={inlineStyle()} {...rest}>
      {local.children}
    </div>
  );
};
