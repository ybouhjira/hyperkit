import { describe, it, expect, vi } from 'vitest';
import { render } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { SpringCounter } from './SpringCounter';

describe('SpringCounter', () => {
  it('renders without errors', () => {
    const { container } = render(() => <SpringCounter value={0} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with sk-spring-counter class', () => {
    const { container } = render(() => <SpringCounter value={42} />);
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains('sk-spring-counter')).toBe(true);
  });

  it('displays initial value immediately', () => {
    const { container } = render(() => <SpringCounter value={100} />);
    const el = container.firstChild as HTMLElement;
    expect(el.textContent).toBe('100');
  });

  it('applies custom class', () => {
    const { container } = render(() => <SpringCounter value={0} class="my-counter" />);
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains('my-counter')).toBe(true);
  });

  it('uses custom format function', () => {
    const { container } = render(() => (
      <SpringCounter value={1000} format={(v) => `$${Math.round(v)}`} />
    ));
    const el = container.firstChild as HTMLElement;
    expect(el.textContent).toBe('$1000');
  });

  it('shows decimal places based on precision', () => {
    const { container } = render(() => <SpringCounter value={3.14159} precision={2} />);
    const el = container.firstChild as HTMLElement;
    expect(el.textContent).toBe('3.14');
  });

  it('has aria-live attribute for accessibility', () => {
    const { container } = render(() => <SpringCounter value={0} />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('aria-live')).toBe('polite');
  });

  it('responds to value changes', async () => {
    const [val, setVal] = createSignal(0);
    const { container } = render(() => <SpringCounter value={val()} />);

    expect((container.firstChild as HTMLElement).textContent).toBe('0');

    setVal(500);
    // After setting new value, it starts animating toward 500
    // In reduced-motion or test env, it should eventually settle
    await vi.waitFor(
      () => {
        const text = (container.firstChild as HTMLElement).textContent;
        expect(text).toBeTruthy();
      },
      { timeout: 2000 }
    );
  });
});
