import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Drawer } from './Drawer';

const css = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../packages/hyperkit-styles/src/primitives/Drawer/Drawer.css'
  ),
  'utf8'
);

describe('Drawer', () => {
  it('does not render content when closed', () => {
    render(() => (
      <Drawer open={false} onOpenChange={() => {}}>
        <div>Hidden content</div>
      </Drawer>
    ));
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('renders children when open', () => {
    render(() => (
      <Drawer open={true} onOpenChange={() => {}}>
        <div>Drawer body</div>
      </Drawer>
    ));
    expect(screen.getByText('Drawer body')).toBeInTheDocument();
  });

  it('opens via prop change', async () => {
    const [open, setOpen] = createSignal(false);
    render(() => (
      <Drawer open={open()} onOpenChange={setOpen}>
        <div>Toggleable body</div>
      </Drawer>
    ));
    expect(screen.queryByText('Toggleable body')).not.toBeInTheDocument();
    setOpen(true);
    expect(await screen.findByText('Toggleable body')).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when Escape pressed on modal+dismissible drawer', () => {
    const handler = vi.fn();
    render(() => (
      <Drawer open={true} onOpenChange={handler}>
        <div>Body</div>
      </Drawer>
    ));
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(handler).toHaveBeenCalledWith(false);
  });

  it('does not close on Escape when dismissible=false', () => {
    const handler = vi.fn();
    render(() => (
      <Drawer open={true} onOpenChange={handler} dismissible={false}>
        <div>Body</div>
      </Drawer>
    ));
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('renders backdrop overlay when modal', () => {
    render(() => (
      <Drawer open={true} onOpenChange={() => {}} modal={true}>
        <div>Body</div>
      </Drawer>
    ));
    const overlay = document.querySelector('[data-sk-drawer-overlay]');
    expect(overlay).not.toBeNull();
  });

  it('does not render backdrop when non-modal', () => {
    render(() => (
      <Drawer open={true} onOpenChange={() => {}} modal={false}>
        <div>Body</div>
      </Drawer>
    ));
    const overlay = document.querySelector('[data-sk-drawer-overlay]');
    expect(overlay).toBeNull();
  });

  it('renders with side="left" by default', () => {
    render(() => (
      <Drawer open={true} onOpenChange={() => {}}>
        <div>Body</div>
      </Drawer>
    ));
    const drawer = document.querySelector('[data-sk-drawer]');
    expect(drawer?.getAttribute('data-side')).toBe('left');
  });

  it('renders with side="right"', () => {
    render(() => (
      <Drawer open={true} onOpenChange={() => {}} side="right">
        <div>Body</div>
      </Drawer>
    ));
    expect(document.querySelector('[data-sk-drawer][data-side="right"]')).not.toBeNull();
  });

  it('renders with side="top"', () => {
    render(() => (
      <Drawer open={true} onOpenChange={() => {}} side="top">
        <div>Body</div>
      </Drawer>
    ));
    expect(document.querySelector('[data-sk-drawer][data-side="top"]')).not.toBeNull();
  });

  it('renders with side="bottom"', () => {
    render(() => (
      <Drawer open={true} onOpenChange={() => {}} side="bottom">
        <div>Body</div>
      </Drawer>
    ));
    expect(document.querySelector('[data-sk-drawer][data-side="bottom"]')).not.toBeNull();
  });

  it('applies custom size via the --sk-drawer-size custom property', () => {
    render(() => (
      <Drawer open={true} onOpenChange={() => {}} side="left" size="420px">
        <div>Body</div>
      </Drawer>
    ));
    const drawer = document.querySelector('[data-sk-drawer]') as HTMLElement | null;
    expect(drawer).not.toBeNull();
    expect(drawer!.style.getPropertyValue('--sk-drawer-size')).toBe('420px');
  });

  it('consumes --sk-drawer-size as width on left/right and height on top/bottom', () => {
    expect(css).toMatch(/data-side='left'[^}]*width: var\(--sk-drawer-size/);
    expect(css).toMatch(/data-side='bottom'[^}]*height: var\(--sk-drawer-size/);
  });

  it('does not set the size custom property by default', () => {
    render(() => (
      <Drawer open={true} onOpenChange={() => {}}>
        <div>Body</div>
      </Drawer>
    ));
    const drawer = document.querySelector('[data-sk-drawer]') as HTMLElement | null;
    expect(drawer!.style.getPropertyValue('--sk-drawer-size')).toBe('');
  });

  it('applies the sk-drawer class on the content and merges a custom class', () => {
    render(() => (
      <Drawer open={true} onOpenChange={() => {}} class="my-drawer">
        <div>Body</div>
      </Drawer>
    ));
    const drawer = document.querySelector('[data-sk-drawer]') as HTMLElement;
    expect(drawer.classList.contains('sk-drawer')).toBe(true);
    expect(drawer.classList.contains('my-drawer')).toBe(true);
  });

  it('applies the sk-drawer__overlay class on the backdrop', () => {
    render(() => (
      <Drawer open={true} onOpenChange={() => {}}>
        <div>Body</div>
      </Drawer>
    ));
    const overlay = document.querySelector('[data-sk-drawer-overlay]') as HTMLElement;
    expect(overlay.classList.contains('sk-drawer__overlay')).toBe(true);
  });

  it('user style prop merges last so it can override component styles', () => {
    render(() => (
      <Drawer open={true} onOpenChange={() => {}} style={{ 'z-index': '4242' }}>
        <div>Body</div>
      </Drawer>
    ));
    const drawer = document.querySelector('[data-sk-drawer]') as HTMLElement;
    expect(drawer.style.zIndex).toBe('4242');
  });

  it('sets aria-label when provided', () => {
    render(() => (
      <Drawer open={true} onOpenChange={() => {}} aria-label="Main navigation">
        <div>Nav</div>
      </Drawer>
    ));
    expect(document.querySelector('[data-sk-drawer]')!.getAttribute('aria-label')).toBe(
      'Main navigation'
    );
  });

  describe('reduced motion', () => {
    it('drives all motion from --sk-duration-normal, which collapses to 0ms under prefers-reduced-motion', () => {
      // tokens.css zeroes --sk-duration-* under prefers-reduced-motion, so the
      // drawer must not hardcode any animation duration.
      expect(css).toContain('var(--sk-duration-normal)');
      expect(css).not.toMatch(/animation:[^;]*\d+m?s/);
    });
  });
});
