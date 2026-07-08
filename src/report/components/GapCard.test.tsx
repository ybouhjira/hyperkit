import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { GapCard } from './GapCard';

describe('GapCard', () => {
  it('renders id and title', () => {
    const { getByText } = render(() => (
      <GapCard id="GAP-01" title="Missing feature" severity="critical" />
    ));
    expect(getByText('GAP-01')).toBeInTheDocument();
    expect(getByText('Missing feature')).toBeInTheDocument();
  });

  it('applies severity modifier class for critical', () => {
    const { container } = render(() => <GapCard id="G1" title="Test" severity="critical" />);
    expect(container.querySelector('.sk-report-gap-card--critical')).toBeInTheDocument();
  });

  it('applies severity modifier class for important', () => {
    const { container } = render(() => <GapCard id="G1" title="Test" severity="important" />);
    expect(container.querySelector('.sk-report-gap-card--important')).toBeInTheDocument();
  });

  it('applies severity modifier class for nice', () => {
    const { container } = render(() => <GapCard id="G1" title="Test" severity="nice" />);
    expect(container.querySelector('.sk-report-gap-card--nice')).toBeInTheDocument();
  });

  it('renders rows when provided', () => {
    const rows = [
      { tag: 'problem' as const, text: 'The issue description' },
      { tag: 'solution' as const, text: 'Proposed fix' },
      { tag: 'precedent' as const, text: 'Prior art reference' },
    ];
    const { getByText } = render(() => (
      <GapCard id="G1" title="Test" severity="critical" rows={rows} />
    ));
    expect(getByText('The issue description')).toBeInTheDocument();
    expect(getByText('Proposed fix')).toBeInTheDocument();
    expect(getByText('Prior art reference')).toBeInTheDocument();
    expect(getByText('problem')).toBeInTheDocument();
    expect(getByText('solution')).toBeInTheDocument();
    expect(getByText('precedent')).toBeInTheDocument();
  });

  it('applies tag modifier classes to row tags', () => {
    const rows = [
      { tag: 'problem' as const, text: 'Issue' },
      { tag: 'solution' as const, text: 'Fix' },
    ];
    const { container } = render(() => (
      <GapCard id="G1" title="Test" severity="critical" rows={rows} />
    ));
    expect(container.querySelector('.sk-report-gap-card__tag--problem')).toBeInTheDocument();
    expect(container.querySelector('.sk-report-gap-card__tag--solution')).toBeInTheDocument();
  });

  it('does not render rows section when rows is undefined', () => {
    const { container } = render(() => <GapCard id="G1" title="Test" severity="critical" />);
    expect(container.querySelector('.sk-report-gap-card__rows')).not.toBeInTheDocument();
  });

  it('does not render rows section when rows is empty', () => {
    const { container } = render(() => (
      <GapCard id="G1" title="Test" severity="critical" rows={[]} />
    ));
    expect(container.querySelector('.sk-report-gap-card__rows')).not.toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => (
      <GapCard id="G1" title="Test" severity="critical" class="my-card" />
    ));
    const el = container.querySelector('.sk-report-gap-card');
    expect(el?.classList.contains('my-card')).toBe(true);
  });

  it('applies custom style', () => {
    const { container } = render(() => (
      <GapCard id="G1" title="Test" severity="critical" style={{ opacity: '0.5' }} />
    ));
    const el = container.querySelector('.sk-report-gap-card') as HTMLElement;
    expect(el.style.opacity).toBe('0.5');
  });
});
