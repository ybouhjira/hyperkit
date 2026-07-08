import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LivePulse } from './LivePulse';

describe('LivePulse', () => {
  it('renders children when inactive (display: contents — no visible wrapper)', () => {
    const { getByText, container } = render(() => (
      <LivePulse active={false}>
        <span>inner</span>
      </LivePulse>
    ));
    expect(getByText('inner')).toBeInTheDocument();
    const wrapper = container.querySelector('.sk-livepulse');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.classList.contains('sk-livepulse--active')).toBe(false);
  });

  it('promotes wrapper + adds dot when active', () => {
    const { container } = render(() => (
      <LivePulse active={true}>
        <span>running</span>
      </LivePulse>
    ));
    const wrapper = container.querySelector('.sk-livepulse');
    expect(wrapper?.classList.contains('sk-livepulse--active')).toBe(true);
    expect(container.querySelector('.sk-livepulse__dot')).not.toBeNull();
  });

  it('hides the corner dot when hideDot is true', () => {
    const { container } = render(() => (
      <LivePulse active={true} hideDot>
        <span>tight space</span>
      </LivePulse>
    ));
    expect(container.querySelector('.sk-livepulse--active')).not.toBeNull();
    expect(container.querySelector('.sk-livepulse__dot')).toBeNull();
  });

  it('exposes aria-busy mirroring the active prop', () => {
    const { container, rerender } = renderToggleable();
    const wrapper = container.querySelector('.sk-livepulse');
    expect(wrapper?.getAttribute('aria-busy')).toBe('false');
    rerender(true);
    expect(container.querySelector('.sk-livepulse')?.getAttribute('aria-busy')).toBe('true');
  });

  it('flips active state reactively (signal in, animation out)', () => {
    const [active, setActive] = createSignal(false);
    const { container } = render(() => (
      <LivePulse active={active()}>
        <span>flipper</span>
      </LivePulse>
    ));
    expect(container.querySelector('.sk-livepulse--active')).toBeNull();
    setActive(true);
    expect(container.querySelector('.sk-livepulse--active')).not.toBeNull();
    setActive(false);
    expect(container.querySelector('.sk-livepulse--active')).toBeNull();
  });

  it('honors a custom accentColor via CSS variable', () => {
    const { container } = render(() => (
      <LivePulse active={true} accentColor="#ff00aa">
        <span>magenta</span>
      </LivePulse>
    ));
    const style = container.querySelector('.sk-livepulse')?.getAttribute('style') ?? '';
    expect(style).toContain('--sk-livepulse-color: #ff00aa');
  });

  it('passes through user class on the wrapper', () => {
    const { container } = render(() => (
      <LivePulse active={true} class="my-extra">
        <span>x</span>
      </LivePulse>
    ));
    const wrapper = container.querySelector('.sk-livepulse');
    expect(wrapper?.classList.contains('my-extra')).toBe(true);
  });

  it('merges user style with the cssVars', () => {
    const { container } = render(() => (
      <LivePulse active={true} style={{ margin: '4px' }}>
        <span>x</span>
      </LivePulse>
    ));
    const style = container.querySelector('.sk-livepulse')?.getAttribute('style') ?? '';
    expect(style).toContain('margin: 4px');
  });

  it('exposes a data-live attribute reflecting the active flag', () => {
    const { container } = render(() => (
      <LivePulse active={true}>
        <span>x</span>
      </LivePulse>
    ));
    expect(container.querySelector('[data-live="true"]')).not.toBeNull();
  });

  it('does not throw when given complex JSX children', () => {
    expect(() =>
      render(() => (
        <LivePulse active={true}>
          <>
            <div>a</div>
            <div>b</div>
          </>
        </LivePulse>
      ))
    ).not.toThrow();
  });

  it('active wrapper rule fills its parent (regression: height: 100% chain breaks otherwise)', () => {
    // Regression for hyperbuild workflow cards: when a parent has fixed
    // height and the consumer's first child uses `height: 100%`, the
    // chain works when LivePulse is inactive (display: contents — the
    // wrapper is layout-transparent) but collapses when active
    // (display: block — the wrapper interposes a real box). Without
    // height: 100% on the active wrapper, a height:100% child resolves
    // against the wrapper's auto height instead of the parent's sized
    // box, and content visibly overflows.
    //
    // jsdom doesn't run a real layout engine, so we can't verify by
    // measuring. Instead we assert the CSS file itself carries the
    // rule — the only thing this test wants to prevent is a future
    // refactor accidentally dropping it.
    const css = readFileSync(resolve(__dirname, 'LivePulse.css'), 'utf8');
    const activeBlock = css.match(/\.sk-livepulse--active\s*\{[^}]*\}/);
    expect(activeBlock).not.toBeNull();
    expect(activeBlock![0]).toMatch(/width:\s*100%/);
    expect(activeBlock![0]).toMatch(/height:\s*100%/);
    expect(activeBlock![0]).toMatch(/box-sizing:\s*border-box/);
  });

  it('active inner first-child rule fills the wrapper (consumer height: 100% chain)', () => {
    const css = readFileSync(resolve(__dirname, 'LivePulse.css'), 'utf8');
    const innerBlock = css.match(/\.sk-livepulse--active\s*>\s*:first-child\s*\{[^}]*\}/);
    expect(innerBlock).not.toBeNull();
    expect(innerBlock![0]).toMatch(/width:\s*100%/);
    expect(innerBlock![0]).toMatch(/height:\s*100%/);
    expect(innerBlock![0]).toMatch(/box-sizing:\s*border-box/);
  });
});

/** Helper: renders a LivePulse whose `active` prop can be flipped at runtime. */
function renderToggleable(): { container: HTMLElement; rerender: (next: boolean) => void } {
  const [active, setActive] = createSignal(false);
  const result = render(() => (
    <LivePulse active={active()}>
      <span>x</span>
    </LivePulse>
  ));
  return {
    container: result.container,
    rerender: (next: boolean): void => setActive(next),
  };
}
