import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { ScoreRing } from './ScoreRing';

describe('ScoreRing', () => {
  it('renders without errors', () => {
    const { container } = render(() => <ScoreRing value={50} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with sk-score-ring class', () => {
    const { container } = render(() => <ScoreRing value={50} />);
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains('sk-score-ring')).toBe(true);
  });

  it('renders an SVG element', () => {
    const { container } = render(() => <ScoreRing value={50} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders track and progress circles', () => {
    const { container } = render(() => <ScoreRing value={50} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);
  });

  it('renders label by default', () => {
    const { container } = render(() => <ScoreRing value={75} />);
    const label = container.querySelector('.sk-score-ring__label');
    expect(label).toBeTruthy();
    expect(label?.textContent).toBe('75%');
  });

  it('hides label when showLabel is false', () => {
    const { container } = render(() => <ScoreRing value={75} showLabel={false} />);
    const label = container.querySelector('.sk-score-ring__label');
    expect(label).toBeNull();
  });

  it('applies custom format', () => {
    const { container } = render(() => (
      <ScoreRing value={85} format={(v) => `${v} pts`} showLabel />
    ));
    const label = container.querySelector('.sk-score-ring__label');
    expect(label?.textContent).toBe('85 pts');
  });

  it('clamps value to 0-100 range', () => {
    const { container: c1 } = render(() => <ScoreRing value={-10} showLabel />);
    expect(c1.querySelector('.sk-score-ring__label')?.textContent).toBe('0%');

    const { container: c2 } = render(() => <ScoreRing value={150} showLabel />);
    expect(c2.querySelector('.sk-score-ring__label')?.textContent).toBe('100%');
  });

  it('applies size as dimensions', () => {
    const { container } = render(() => <ScoreRing value={50} size={200} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('200px');
  });

  it('has meter role for accessibility', () => {
    const { container } = render(() => <ScoreRing value={60} />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('role')).toBe('meter');
    expect(el.getAttribute('aria-valuenow')).toBe('60');
  });

  it('applies custom class', () => {
    const { container } = render(() => <ScoreRing value={50} class="my-ring" />);
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains('my-ring')).toBe(true);
  });
});
