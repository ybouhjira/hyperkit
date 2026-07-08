import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { BottomSheet } from './BottomSheet';

describe('BottomSheet', () => {
  it('does not render content when closed', () => {
    render(() => (
      <BottomSheet open={false} onOpenChange={() => {}}>
        <div>Hidden content</div>
      </BottomSheet>
    ));
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('renders children when open', () => {
    render(() => (
      <BottomSheet open={true} onOpenChange={() => {}}>
        <div>Sheet body</div>
      </BottomSheet>
    ));
    expect(screen.getByText('Sheet body')).toBeInTheDocument();
  });

  it('opens via prop change', async () => {
    const [open, setOpen] = createSignal(false);
    render(() => (
      <BottomSheet open={open()} onOpenChange={setOpen}>
        <div>Toggleable</div>
      </BottomSheet>
    ));
    expect(screen.queryByText('Toggleable')).not.toBeInTheDocument();
    setOpen(true);
    expect(await screen.findByText('Toggleable')).toBeInTheDocument();
  });

  it('renders the drag handle by default', () => {
    render(() => (
      <BottomSheet open={true} onOpenChange={() => {}}>
        <div>Body</div>
      </BottomSheet>
    ));
    expect(document.querySelector('[data-sk-bottom-sheet-handle]')).not.toBeNull();
  });

  it('can hide the drag handle via showHandle=false', () => {
    render(() => (
      <BottomSheet open={true} onOpenChange={() => {}} showHandle={false}>
        <div>Body</div>
      </BottomSheet>
    ));
    expect(document.querySelector('[data-sk-bottom-sheet-handle]')).toBeNull();
  });

  it('renders a backdrop overlay', () => {
    render(() => (
      <BottomSheet open={true} onOpenChange={() => {}}>
        <div>Body</div>
      </BottomSheet>
    ));
    expect(document.querySelector('[data-sk-bottom-sheet-overlay]')).not.toBeNull();
  });

  it('closes on Escape when dismissible', () => {
    const handler = vi.fn();
    render(() => (
      <BottomSheet open={true} onOpenChange={handler}>
        <div>Body</div>
      </BottomSheet>
    ));
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(handler).toHaveBeenCalledWith(false);
  });

  it('does not close on Escape when dismissible=false', () => {
    const handler = vi.fn();
    render(() => (
      <BottomSheet open={true} onOpenChange={handler} dismissible={false}>
        <div>Body</div>
      </BottomSheet>
    ));
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('defaults snap point to 90vh when no snapPoints provided', () => {
    render(() => (
      <BottomSheet open={true} onOpenChange={() => {}}>
        <div>Body</div>
      </BottomSheet>
    ));
    const sheet = document.querySelector('[data-sk-bottom-sheet]') as HTMLElement;
    expect(sheet).not.toBeNull();
    expect(sheet.style.height).toBe('90vh');
  });

  it('uses the largest snap point as height', () => {
    render(() => (
      <BottomSheet open={true} onOpenChange={() => {}} snapPoints={[0.25, 0.6]}>
        <div>Body</div>
      </BottomSheet>
    ));
    const sheet = document.querySelector('[data-sk-bottom-sheet]') as HTMLElement;
    expect(sheet.style.height).toBe('60vh');
  });

  it('clamps snap points outside (0, 1]', () => {
    render(() => (
      <BottomSheet open={true} onOpenChange={() => {}} snapPoints={[0, 1.5]}>
        <div>Body</div>
      </BottomSheet>
    ));
    const sheet = document.querySelector('[data-sk-bottom-sheet]') as HTMLElement;
    expect(sheet.style.height).toBe('100vh');
  });

  it('applies default max-width for desktop centering', () => {
    render(() => (
      <BottomSheet open={true} onOpenChange={() => {}}>
        <div>Body</div>
      </BottomSheet>
    ));
    const sheet = document.querySelector('[data-sk-bottom-sheet]') as HTMLElement;
    expect(sheet.style.maxWidth).toBe('640px');
  });

  it('honors custom maxWidth', () => {
    render(() => (
      <BottomSheet open={true} onOpenChange={() => {}} maxWidth="800px">
        <div>Body</div>
      </BottomSheet>
    ));
    const sheet = document.querySelector('[data-sk-bottom-sheet]') as HTMLElement;
    expect(sheet.style.maxWidth).toBe('800px');
  });

  it('uses token-based elevated background and shadow', () => {
    render(() => (
      <BottomSheet open={true} onOpenChange={() => {}}>
        <div>Body</div>
      </BottomSheet>
    ));
    const sheet = document.querySelector('[data-sk-bottom-sheet]') as HTMLElement;
    expect(sheet.style.background).toContain('var(--sk-bg-elevated)');
    expect(sheet.style.boxShadow).toContain('var(--sk-shadow-2xl)');
  });

  it('dismisses on swipe-down past threshold', () => {
    const handler = vi.fn();
    render(() => (
      <BottomSheet open={true} onOpenChange={handler}>
        <div>Body</div>
      </BottomSheet>
    ));
    const handle = document.querySelector('[data-sk-bottom-sheet-handle]') as HTMLElement;
    // Dispatch on handle so `target` is naturally the handle; events bubble to sheet
    handle.dispatchEvent(
      new PointerEvent('pointerdown', { clientY: 100, pointerId: 1, bubbles: true })
    );
    handle.dispatchEvent(
      new PointerEvent('pointermove', { clientY: 250, pointerId: 1, bubbles: true })
    );
    handle.dispatchEvent(
      new PointerEvent('pointerup', { clientY: 250, pointerId: 1, bubbles: true })
    );
    expect(handler).toHaveBeenCalledWith(false);
  });

  it('does not dismiss on short swipe below threshold', () => {
    const handler = vi.fn();
    render(() => (
      <BottomSheet open={true} onOpenChange={handler}>
        <div>Body</div>
      </BottomSheet>
    ));
    const handle = document.querySelector('[data-sk-bottom-sheet-handle]') as HTMLElement;
    handle.dispatchEvent(
      new PointerEvent('pointerdown', { clientY: 100, pointerId: 1, bubbles: true })
    );
    handle.dispatchEvent(
      new PointerEvent('pointermove', { clientY: 130, pointerId: 1, bubbles: true })
    );
    handle.dispatchEvent(
      new PointerEvent('pointerup', { clientY: 130, pointerId: 1, bubbles: true })
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not drag when swipeToDismiss=false', () => {
    const handler = vi.fn();
    render(() => (
      <BottomSheet open={true} onOpenChange={handler} swipeToDismiss={false}>
        <div>Body</div>
      </BottomSheet>
    ));
    const handle = document.querySelector('[data-sk-bottom-sheet-handle]') as HTMLElement;
    handle.dispatchEvent(
      new PointerEvent('pointerdown', { clientY: 100, pointerId: 1, bubbles: true })
    );
    handle.dispatchEvent(
      new PointerEvent('pointermove', { clientY: 400, pointerId: 1, bubbles: true })
    );
    handle.dispatchEvent(
      new PointerEvent('pointerup', { clientY: 400, pointerId: 1, bubbles: true })
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it('exposes aria-label on the dialog', () => {
    render(() => (
      <BottomSheet open={true} onOpenChange={() => {}} aria-label="Filters sheet">
        <div>Body</div>
      </BottomSheet>
    ));
    const sheet = document.querySelector('[data-sk-bottom-sheet]') as HTMLElement;
    expect(sheet.getAttribute('aria-label')).toBe('Filters sheet');
  });
});
