import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSignal } from 'solid-js';
import { Drawer } from './Drawer';

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

  it('applies custom size to left/right drawers as width', () => {
    render(() => (
      <Drawer open={true} onOpenChange={() => {}} side="left" size="420px">
        <div>Body</div>
      </Drawer>
    ));
    const drawer = document.querySelector('[data-sk-drawer]') as HTMLElement | null;
    expect(drawer).not.toBeNull();
    expect(drawer!.style.width).toBe('420px');
  });

  it('applies custom size to top/bottom drawers as height', () => {
    render(() => (
      <Drawer open={true} onOpenChange={() => {}} side="bottom" size="50vh">
        <div>Body</div>
      </Drawer>
    ));
    const drawer = document.querySelector('[data-sk-drawer]') as HTMLElement | null;
    expect(drawer!.style.height).toBe('50vh');
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
    const originalMatchMedia = window.matchMedia;
    beforeEach(() => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })) as unknown as typeof window.matchMedia;
    });
    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it('disables transition when prefers-reduced-motion is set', () => {
      render(() => (
        <Drawer open={true} onOpenChange={() => {}}>
          <div>Body</div>
        </Drawer>
      ));
      const drawer = document.querySelector('[data-sk-drawer]') as HTMLElement | null;
      expect(drawer!.style.transition).toBe('none');
    });
  });
});
