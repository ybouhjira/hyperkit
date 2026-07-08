import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { GapAnalysis, type GapItem } from './GapAnalysis';

const mixedGaps: GapItem[] = [
  { id: 'G1', title: 'Critical bug', severity: 'critical' },
  {
    id: 'G2',
    title: 'Important improvement',
    severity: 'important',
    rows: [{ tag: 'problem', text: 'Slow performance' }],
  },
  { id: 'G3', title: 'Nice polish', severity: 'nice' },
  { id: 'G4', title: 'Another critical', severity: 'critical' },
];

describe('GapAnalysis', () => {
  it('renders title when provided', () => {
    const { getByText } = render(() => <GapAnalysis title="Gap Report" gaps={mixedGaps} />);
    expect(getByText('Gap Report')).toBeInTheDocument();
  });

  it('does not render title when omitted', () => {
    const { container } = render(() => <GapAnalysis gaps={mixedGaps} />);
    expect(container.querySelector('.sk-report-gap-analysis__title')).not.toBeInTheDocument();
  });

  it('renders severity counters for each present severity', () => {
    const { getByText } = render(() => <GapAnalysis gaps={mixedGaps} />);
    expect(getByText('2 Critical')).toBeInTheDocument();
    expect(getByText('1 Important')).toBeInTheDocument();
    expect(getByText('1 Nice to Have')).toBeInTheDocument();
  });

  it('does not render counter for severity with zero items', () => {
    const onlyCritical: GapItem[] = [{ id: 'G1', title: 'Bug', severity: 'critical' }];
    const { container } = render(() => <GapAnalysis gaps={onlyCritical} />);
    expect(container.querySelector('.sk-report-gap-count--important')).not.toBeInTheDocument();
    expect(container.querySelector('.sk-report-gap-count--nice')).not.toBeInTheDocument();
  });

  it('groups gaps by severity in order: critical, important, nice', () => {
    const { container } = render(() => <GapAnalysis gaps={mixedGaps} />);
    const labels = container.querySelectorAll('.sk-report-severity-label');
    expect(labels).toHaveLength(3);
    expect(labels[0]?.textContent).toBe('Critical');
    expect(labels[1]?.textContent).toBe('Important');
    expect(labels[2]?.textContent).toBe('Nice to Have');
  });

  it('renders GapCard for each gap item', () => {
    const { getByText } = render(() => <GapAnalysis gaps={mixedGaps} />);
    expect(getByText('Critical bug')).toBeInTheDocument();
    expect(getByText('Important improvement')).toBeInTheDocument();
    expect(getByText('Nice polish')).toBeInTheDocument();
    expect(getByText('Another critical')).toBeInTheDocument();
  });

  it('renders empty when gaps array is empty', () => {
    const { container } = render(() => <GapAnalysis gaps={[]} />);
    expect(container.querySelector('.sk-report-severity-group')).not.toBeInTheDocument();
    expect(container.querySelector('.sk-report-gap-count')).not.toBeInTheDocument();
  });

  it('only renders groups that have items', () => {
    const niceOnly: GapItem[] = [{ id: 'G1', title: 'Polish', severity: 'nice' }];
    const { container } = render(() => <GapAnalysis gaps={niceOnly} />);
    const groups = container.querySelectorAll('.sk-report-severity-group');
    expect(groups).toHaveLength(1);
    expect(container.querySelector('.sk-report-severity-label--nice')).toBeInTheDocument();
    expect(container.querySelector('.sk-report-severity-label--critical')).not.toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => <GapAnalysis gaps={mixedGaps} class="extra" />);
    expect(container.querySelector('.sk-report-gap-analysis')?.classList.contains('extra')).toBe(
      true
    );
  });

  it('applies custom style', () => {
    const { container } = render(() => (
      <GapAnalysis gaps={mixedGaps} style={{ padding: '10px' }} />
    ));
    const el = container.querySelector('.sk-report-gap-analysis') as HTMLElement;
    expect(el.style.padding).toBe('10px');
  });
});
