import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { SummaryGrid, type SummaryGridItem } from './SummaryGrid';

const items: SummaryGridItem[] = [
  { icon: '🚀', title: 'Performance', description: '60fps animations', iconColor: 'teal' },
  { icon: '🎨', title: 'Theming', description: 'Full CSS variable system', iconColor: 'blue' },
  { icon: '📦', title: 'Packages', description: '7 published packages', iconColor: 'purple' },
];

describe('SummaryGrid', () => {
  it('renders all items', () => {
    const { getByText } = render(() => <SummaryGrid items={items} />);
    expect(getByText('Performance')).toBeInTheDocument();
    expect(getByText('Theming')).toBeInTheDocument();
    expect(getByText('Packages')).toBeInTheDocument();
  });

  it('renders item descriptions', () => {
    const { getByText } = render(() => <SummaryGrid items={items} />);
    expect(getByText('60fps animations')).toBeInTheDocument();
    expect(getByText('Full CSS variable system')).toBeInTheDocument();
    expect(getByText('7 published packages')).toBeInTheDocument();
  });

  it('renders item icons', () => {
    const { getByText } = render(() => <SummaryGrid items={items} />);
    expect(getByText('🚀')).toBeInTheDocument();
    expect(getByText('🎨')).toBeInTheDocument();
    expect(getByText('📦')).toBeInTheDocument();
  });

  it('applies iconColor modifier class', () => {
    const { container } = render(() => <SummaryGrid items={items} />);
    expect(container.querySelector('.sk-report-summary-card__icon--teal')).toBeInTheDocument();
    expect(container.querySelector('.sk-report-summary-card__icon--blue')).toBeInTheDocument();
    expect(container.querySelector('.sk-report-summary-card__icon--purple')).toBeInTheDocument();
  });

  it('defaults iconColor to teal when not specified', () => {
    const noColor: SummaryGridItem[] = [
      { icon: '✅', title: 'Default', description: 'No color set' },
    ];
    const { container } = render(() => <SummaryGrid items={noColor} />);
    expect(container.querySelector('.sk-report-summary-card__icon--teal')).toBeInTheDocument();
  });

  it('renders empty when items is empty', () => {
    const { container } = render(() => <SummaryGrid items={[]} />);
    expect(container.querySelector('.sk-report-summary-card')).not.toBeInTheDocument();
  });

  it('renders a single item', () => {
    const single: SummaryGridItem[] = [{ icon: '🔥', title: 'Hot', description: 'Trending' }];
    const { getByText, container } = render(() => <SummaryGrid items={single} />);
    expect(getByText('Hot')).toBeInTheDocument();
    expect(container.querySelectorAll('.sk-report-summary-card')).toHaveLength(1);
  });
});
