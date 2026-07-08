import { describe, it, expect, vi } from 'vitest';
import { render } from '@solidjs/testing-library';
import { TypewriterText } from './TypewriterText';

describe('TypewriterText', () => {
  it('renders without errors', () => {
    const { container } = render(() => <TypewriterText text="Hello" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with sk-typewriter class', () => {
    const { container } = render(() => <TypewriterText text="Hello" />);
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains('sk-typewriter')).toBe(true);
  });

  it('renders cursor by default', () => {
    const { container } = render(() => <TypewriterText text="Hello" />);
    const cursor = container.querySelector('.sk-typewriter__cursor');
    expect(cursor).toBeTruthy();
  });

  it('does not render cursor when cursor=false', () => {
    const { container } = render(() => <TypewriterText text="Hello" cursor={false} />);
    const cursor = container.querySelector('.sk-typewriter__cursor');
    expect(cursor).toBeNull();
  });

  it('renders custom cursor character', () => {
    const { container } = render(() => <TypewriterText text="Hello" cursorChar="_" />);
    const cursor = container.querySelector('.sk-typewriter__cursor');
    expect(cursor?.textContent).toBe('_');
  });

  it('has aria-label with full text for accessibility', () => {
    const { container } = render(() => <TypewriterText text="Full text here" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('aria-label')).toBe('Full text here');
  });

  it('applies custom class', () => {
    const { container } = render(() => <TypewriterText text="Hi" class="my-tw" />);
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains('my-tw')).toBe(true);
  });

  it('calls onComplete callback', async () => {
    const onComplete = vi.fn();
    render(() => <TypewriterText text="Hi" speed={1} delay={0} onComplete={onComplete} />);

    await vi.waitFor(
      () => {
        expect(onComplete).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('shows text content element', () => {
    const { container } = render(() => <TypewriterText text="Test text" />);
    const textEl = container.querySelector('.sk-typewriter__text');
    expect(textEl).toBeTruthy();
  });

  it('applies custom style', () => {
    const { container } = render(() => (
      <TypewriterText text="Styled" style={{ 'font-size': '2rem' }} />
    ));
    const el = container.firstChild as HTMLElement;
    expect(el.style.fontSize).toBe('2rem');
  });
});
