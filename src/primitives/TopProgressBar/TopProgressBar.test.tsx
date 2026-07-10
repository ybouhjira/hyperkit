import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { createSignal } from 'solid-js';
import { TopProgressBar } from './TopProgressBar';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'TopProgressBar.css'),
  'utf8'
);

const getBar = () => document.querySelector('[data-sk-top-progress]') as HTMLElement | null;
const getFill = () => document.querySelector('[data-sk-top-progress-fill]') as HTMLElement | null;

describe('TopProgressBar', () => {
  it('does not render when inactive initially', () => {
    render(() => <TopProgressBar active={false} />);
    expect(getBar()).toBeNull();
  });

  it('renders when active with indeterminate mode by default', () => {
    render(() => <TopProgressBar active={true} />);
    const bar = getBar();
    expect(bar).not.toBeNull();
    expect(bar!.getAttribute('data-mode')).toBe('indeterminate');
    expect(bar!.classList.contains('sk-top-progress--indeterminate')).toBe(true);
  });

  it('applies the sk-top-progress class on the root element', () => {
    render(() => <TopProgressBar active={true} />);
    expect(getBar()!.classList.contains('sk-top-progress')).toBe(true);
  });

  it('renders the fill element with its BEM class', () => {
    render(() => <TopProgressBar active={true} />);
    const fill = getFill();
    expect(fill).not.toBeNull();
    expect(fill!.classList.contains('sk-top-progress__fill')).toBe(true);
  });

  it('marks determinate mode and exposes progress via CSS custom property', () => {
    render(() => <TopProgressBar active={true} progress={0.5} />);
    const bar = getBar()!;
    expect(bar.getAttribute('data-mode')).toBe('determinate');
    expect(bar.classList.contains('sk-top-progress--determinate')).toBe(true);
    expect(bar.style.getPropertyValue('--sk-top-progress-value')).toBe('0.5');
  });

  it('clamps progress above 1', () => {
    render(() => <TopProgressBar active={true} progress={5} />);
    expect(getBar()!.style.getPropertyValue('--sk-top-progress-value')).toBe('1');
  });

  it('clamps progress below 0', () => {
    render(() => <TopProgressBar active={true} progress={-2} />);
    expect(getBar()!.style.getPropertyValue('--sk-top-progress-value')).toBe('0');
  });

  it('sets aria attributes for determinate progress', () => {
    render(() => <TopProgressBar active={true} progress={0.42} />);
    const bar = getBar()!;
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('1');
    expect(bar.getAttribute('aria-valuenow')).toBe('0.42');
  });

  it('omits numeric aria-valuenow in indeterminate mode', () => {
    render(() => <TopProgressBar active={true} />);
    const bar = getBar()!;
    expect(bar.getAttribute('aria-valuenow')).toBeNull();
  });

  it('applies custom color via CSS custom property', () => {
    render(() => <TopProgressBar active={true} color="tomato" />);
    expect(getBar()!.style.getPropertyValue('--sk-top-progress-color')).toBe('tomato');
  });

  it('does not set the color custom property by default (accent fallback in CSS)', () => {
    render(() => <TopProgressBar active={true} />);
    expect(getBar()!.style.getPropertyValue('--sk-top-progress-color')).toBe('');
  });

  it('applies custom height via CSS custom property', () => {
    render(() => <TopProgressBar active={true} height={4} />);
    expect(getBar()!.style.getPropertyValue('--sk-top-progress-height')).toBe('4px');
  });

  it('defaults to 2px height in the stylesheet', () => {
    render(() => <TopProgressBar active={true} />);
    expect(getBar()!.style.getPropertyValue('--sk-top-progress-height')).toBe('');
    expect(css).toContain('height: var(--sk-top-progress-height, 2px)');
  });

  it('merges custom style into container', () => {
    render(() => <TopProgressBar active={true} style={{ 'z-index': '123' }} />);
    expect(getBar()!.style.zIndex).toBe('123');
  });

  it('custom style prop can override component-set custom properties', () => {
    render(() => (
      <TopProgressBar active={true} height={4} style={{ '--sk-top-progress-height': '6px' }} />
    ));
    expect(getBar()!.style.getPropertyValue('--sk-top-progress-height')).toBe('6px');
  });

  it('marks visibility with a modifier class for the fade transition', async () => {
    render(() => <TopProgressBar active={true} />);
    // Visibility flips on the next microtask after mount.
    await Promise.resolve();
    expect(getBar()!.classList.contains('sk-top-progress--visible')).toBe(true);
  });

  it('unmounts after fade-out window when active becomes false', async () => {
    const [active, setActive] = createSignal(true);
    render(() => <TopProgressBar active={active()} />);
    expect(getBar()).not.toBeNull();
    setActive(false);
    // Allow effect + 200ms fade-out timeout to flush.
    await new Promise<void>((resolve) => setTimeout(resolve, 300));
    expect(getBar()).toBeNull();
  });

  describe('reduced motion (handled in CSS)', () => {
    it('ships a prefers-reduced-motion block that stills the shimmer', () => {
      expect(css).toContain('@media (prefers-reduced-motion: reduce)');
      // Steady 80%-opacity full-width bar replaces the shimmer.
      expect(css).toMatch(/prefers-reduced-motion[\s\S]*animation: none/);
      expect(css).toMatch(/prefers-reduced-motion[\s\S]*width: 100%/);
      expect(css).toMatch(/prefers-reduced-motion[\s\S]*opacity: 0\.8/);
    });
  });
});
