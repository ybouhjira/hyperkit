import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { ReportHero, type ReportHeroMeta } from './ReportHero';

describe('ReportHero', () => {
  it('renders title', () => {
    const { getByText } = render(() => <ReportHero title="SolidKit Report" />);
    expect(getByText('SolidKit Report')).toBeInTheDocument();
  });

  it('renders title as h1', () => {
    const { container } = render(() => <ReportHero title="Title" />);
    const h1 = container.querySelector('h1.sk-report-hero__title');
    expect(h1).toBeInTheDocument();
    expect(h1?.textContent).toBe('Title');
  });

  it('renders subtitle when provided', () => {
    const { getByText } = render(() => <ReportHero title="Title" subtitle="A detailed subtitle" />);
    expect(getByText('A detailed subtitle')).toBeInTheDocument();
  });

  it('does not render subtitle element when omitted', () => {
    const { container } = render(() => <ReportHero title="Title" />);
    expect(container.querySelector('.sk-report-hero__subtitle')).not.toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    const { getByText } = render(() => <ReportHero title="Title" badge="v2.5.0" />);
    expect(getByText('v2.5.0')).toBeInTheDocument();
  });

  it('does not render badge element when omitted', () => {
    const { container } = render(() => <ReportHero title="Title" />);
    expect(container.querySelector('.sk-report-hero__badge')).not.toBeInTheDocument();
  });

  it('renders meta items when provided', () => {
    const meta: ReportHeroMeta[] = [
      { label: 'March 2026', icon: '📅' },
      { label: '60+ primitives', icon: '📦' },
    ];
    const { getByText } = render(() => <ReportHero title="Title" meta={meta} />);
    expect(getByText('March 2026')).toBeInTheDocument();
    expect(getByText('60+ primitives')).toBeInTheDocument();
    expect(getByText('📅')).toBeInTheDocument();
    expect(getByText('📦')).toBeInTheDocument();
  });

  it('renders meta item without icon', () => {
    const meta: ReportHeroMeta[] = [{ label: 'No icon item' }];
    const { getByText, container } = render(() => <ReportHero title="Title" meta={meta} />);
    expect(getByText('No icon item')).toBeInTheDocument();
    // Meta item should only have one span (the label), no icon span
    const metaItem = container.querySelector('.sk-report-hero__meta-item');
    expect(metaItem?.children).toHaveLength(1);
  });

  it('does not render meta section when meta is undefined', () => {
    const { container } = render(() => <ReportHero title="Title" />);
    expect(container.querySelector('.sk-report-hero__meta')).not.toBeInTheDocument();
  });

  it('does not render meta section when meta is empty', () => {
    const { container } = render(() => <ReportHero title="Title" meta={[]} />);
    expect(container.querySelector('.sk-report-hero__meta')).not.toBeInTheDocument();
  });

  it('renders all optional props together', () => {
    const meta: ReportHeroMeta[] = [{ label: 'Item 1', icon: '🔥' }];
    const { getByText } = render(() => (
      <ReportHero title="Full Hero" subtitle="All props" badge="BETA" meta={meta} />
    ));
    expect(getByText('Full Hero')).toBeInTheDocument();
    expect(getByText('All props')).toBeInTheDocument();
    expect(getByText('BETA')).toBeInTheDocument();
    expect(getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with only required title prop', () => {
    const { container, getByText } = render(() => <ReportHero title="Minimal" />);
    expect(getByText('Minimal')).toBeInTheDocument();
    expect(container.querySelector('.sk-report-hero__badge')).not.toBeInTheDocument();
    expect(container.querySelector('.sk-report-hero__subtitle')).not.toBeInTheDocument();
    expect(container.querySelector('.sk-report-hero__meta')).not.toBeInTheDocument();
  });

  it('renders multiple meta items with mixed icon presence', () => {
    const meta: ReportHeroMeta[] = [
      { label: 'With icon', icon: '🎯' },
      { label: 'Without icon' },
      { label: 'Another icon', icon: '⚡' },
    ];
    const { container } = render(() => <ReportHero title="Title" meta={meta} />);
    const metaItems = container.querySelectorAll('.sk-report-hero__meta-item');
    expect(metaItems).toHaveLength(3);
    // First item has icon + label = 2 children
    expect(metaItems[0]?.children).toHaveLength(2);
    // Second item has only label = 1 child
    expect(metaItems[1]?.children).toHaveLength(1);
    // Third item has icon + label = 2 children
    expect(metaItems[2]?.children).toHaveLength(2);
  });
});
