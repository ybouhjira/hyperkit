import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { ReportScoreCard, type ReportScoreChip } from './ReportScoreCard';

describe('ReportScoreCard', () => {
  it('renders label and value', () => {
    const { getByText } = render(() => <ReportScoreCard value={75} label="Overall Score" />);
    expect(getByText('Overall Score')).toBeInTheDocument();
    expect(getByText('75%')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    const { getByText } = render(() => (
      <ReportScoreCard value={90} label="Coverage" description="Test coverage across all modules" />
    ));
    expect(getByText('Test coverage across all modules')).toBeInTheDocument();
  });

  it('does not render description paragraph when omitted', () => {
    const { container } = render(() => <ReportScoreCard value={50} label="Score" />);
    const details = container.querySelector('.sk-report-score__details');
    expect(details?.querySelector('p')).not.toBeInTheDocument();
  });

  it('renders chips when provided', () => {
    const chips: ReportScoreChip[] = [
      { text: 'TypeScript', variant: 'done' },
      { text: 'Linting', variant: 'partial' },
      { text: 'E2E Tests', variant: 'missing' },
    ];
    const { getByText } = render(() => (
      <ReportScoreCard value={60} label="Quality" chips={chips} />
    ));
    expect(getByText('TypeScript')).toBeInTheDocument();
    expect(getByText('Linting')).toBeInTheDocument();
    expect(getByText('E2E Tests')).toBeInTheDocument();
  });

  it('applies chip variant modifier classes', () => {
    const chips: ReportScoreChip[] = [
      { text: 'Done item', variant: 'done' },
      { text: 'Partial item', variant: 'partial' },
      { text: 'Missing item', variant: 'missing' },
    ];
    const { container } = render(() => (
      <ReportScoreCard value={60} label="Quality" chips={chips} />
    ));
    expect(container.querySelector('.sk-report-score__chip--done')).toBeInTheDocument();
    expect(container.querySelector('.sk-report-score__chip--partial')).toBeInTheDocument();
    expect(container.querySelector('.sk-report-score__chip--missing')).toBeInTheDocument();
  });

  it('does not render chips section when chips is undefined', () => {
    const { container } = render(() => <ReportScoreCard value={80} label="Score" />);
    expect(container.querySelector('.sk-report-score__chips')).not.toBeInTheDocument();
  });

  it('does not render chips section when chips is empty', () => {
    const { container } = render(() => <ReportScoreCard value={80} label="Score" chips={[]} />);
    expect(container.querySelector('.sk-report-score__chips')).not.toBeInTheDocument();
  });

  it('renders "complete" label inside the ring', () => {
    const { getByText } = render(() => <ReportScoreCard value={100} label="Perfect" />);
    expect(getByText('complete')).toBeInTheDocument();
  });

  it('passes color to ProgressRing and value text', () => {
    const { container } = render(() => (
      <ReportScoreCard value={42} label="Custom Color" color="#ff5722" />
    ));
    // The value text span should have the custom color
    const valueSpan = container.querySelector('.sk-report-score__ring span');
    // JSDOM converts hex to rgb
    expect((valueSpan as HTMLElement)?.style.color).toBe('rgb(255, 87, 34)');
  });

  it('renders value of 0', () => {
    const { getByText } = render(() => <ReportScoreCard value={0} label="Empty" />);
    expect(getByText('0%')).toBeInTheDocument();
  });

  it('renders value of 100', () => {
    const { getByText } = render(() => <ReportScoreCard value={100} label="Full" />);
    expect(getByText('100%')).toBeInTheDocument();
  });
});
