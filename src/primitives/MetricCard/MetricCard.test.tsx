import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { MetricCard } from './MetricCard';

describe('MetricCard', () => {
  it('renders label and value', () => {
    render(() => <MetricCard label="Total Projects" value="2,500" />);
    expect(screen.getByText('Total Projects')).toBeInTheDocument();
    expect(screen.getByText('2,500')).toBeInTheDocument();
  });

  it('renders numeric value', () => {
    render(() => <MetricCard label="Count" value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('defaults to default variant', () => {
    const { container } = render(() => <MetricCard label="Test" value="100" />);
    const value = container.querySelector('.sk-metric__value');
    expect(value?.className).toContain('sk-metric__value--default');
  });

  it('applies success variant class', () => {
    const { container } = render(() => (
      <MetricCard label="Success" value="100" variant="success" />
    ));
    const value = container.querySelector('.sk-metric__value');
    expect(value?.className).toContain('sk-metric__value--success');
  });

  it('applies warning variant class', () => {
    const { container } = render(() => <MetricCard label="Warning" value="50" variant="warning" />);
    const value = container.querySelector('.sk-metric__value');
    expect(value?.className).toContain('sk-metric__value--warning');
  });

  it('applies danger variant class', () => {
    const { container } = render(() => <MetricCard label="Danger" value="10" variant="danger" />);
    const value = container.querySelector('.sk-metric__value');
    expect(value?.className).toContain('sk-metric__value--danger');
  });

  it('applies info variant class', () => {
    const { container } = render(() => <MetricCard label="Info" value="25" variant="info" />);
    const value = container.querySelector('.sk-metric__value');
    expect(value?.className).toContain('sk-metric__value--info');
  });

  it('applies accent variant class', () => {
    const { container } = render(() => <MetricCard label="Accent" value="75" variant="accent" />);
    const value = container.querySelector('.sk-metric__value');
    expect(value?.className).toContain('sk-metric__value--accent');
  });

  it('defaults to md size', () => {
    const { container } = render(() => <MetricCard label="Test" value="100" />);
    const card = container.querySelector('.sk-metric');
    expect(card?.className).toContain('sk-metric--md');
  });

  it('applies sm size class', () => {
    const { container } = render(() => <MetricCard label="Small" value="10" size="sm" />);
    const card = container.querySelector('.sk-metric');
    expect(card?.className).toContain('sk-metric--sm');
  });

  it('applies lg size class', () => {
    const { container } = render(() => <MetricCard label="Large" value="1000" size="lg" />);
    const card = container.querySelector('.sk-metric');
    expect(card?.className).toContain('sk-metric--lg');
  });

  it('renders icon when provided', () => {
    const { container } = render(() => (
      <MetricCard label="With Icon" value="100" icon={<span data-testid="icon">📊</span>} />
    ));
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(container.querySelector('.sk-metric__icon')).toBeInTheDocument();
  });

  it('renders trend when provided', () => {
    render(() => <MetricCard label="Trending" value="100" trend="+12%" />);
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('applies up trend class', () => {
    const { container } = render(() => (
      <MetricCard label="Up" value="100" trend="+5%" trendDirection="up" />
    ));
    const trend = container.querySelector('.sk-metric__trend');
    expect(trend?.className).toContain('sk-metric__trend--up');
  });

  it('applies down trend class', () => {
    const { container } = render(() => (
      <MetricCard label="Down" value="100" trend="-3%" trendDirection="down" />
    ));
    const trend = container.querySelector('.sk-metric__trend');
    expect(trend?.className).toContain('sk-metric__trend--down');
  });

  it('applies neutral trend class', () => {
    const { container } = render(() => (
      <MetricCard label="Neutral" value="100" trend="0%" trendDirection="neutral" />
    ));
    const trend = container.querySelector('.sk-metric__trend');
    expect(trend?.className).toContain('sk-metric__trend--neutral');
  });

  it('defaults to neutral trend direction', () => {
    const { container } = render(() => <MetricCard label="Test" value="100" trend="+5%" />);
    const trend = container.querySelector('.sk-metric__trend');
    expect(trend?.className).toContain('sk-metric__trend--neutral');
  });

  it('renders children in extra section', () => {
    render(() => (
      <MetricCard label="Test" value="100">
        <div data-testid="extra">Extra content</div>
      </MetricCard>
    ));
    expect(screen.getByTestId('extra')).toBeInTheDocument();
    expect(screen.getByText('Extra content')).toBeInTheDocument();
  });

  it('applies clickable class when onClick provided', () => {
    const { container } = render(() => (
      <MetricCard label="Clickable" value="100" onClick={() => {}} />
    ));
    const card = container.querySelector('.sk-metric');
    expect(card?.className).toContain('sk-metric--clickable');
  });

  it('fires onClick handler', () => {
    const onClick = vi.fn();
    const { container } = render(() => (
      <MetricCard label="Clickable" value="100" onClick={onClick} />
    ));
    const card = container.querySelector('.sk-metric');
    card?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has role=button when clickable', () => {
    const { container } = render(() => (
      <MetricCard label="Clickable" value="100" onClick={() => {}} />
    ));
    const card = container.querySelector('.sk-metric');
    expect(card?.getAttribute('role')).toBe('button');
  });

  it('has tabIndex=0 when clickable', () => {
    const { container } = render(() => (
      <MetricCard label="Clickable" value="100" onClick={() => {}} />
    ));
    const card = container.querySelector('.sk-metric');
    expect(card?.getAttribute('tabIndex')).toBe('0');
  });

  it('applies custom class', () => {
    const { container } = render(() => (
      <MetricCard label="Custom" value="100" class="custom-class" />
    ));
    const card = container.querySelector('.sk-metric');
    expect(card?.className).toContain('custom-class');
  });

  it('applies custom style', () => {
    const { container } = render(() => (
      <MetricCard label="Styled" value="100" style={{ 'background-color': 'red' }} />
    ));
    const card = container.querySelector('.sk-metric') as HTMLElement;
    expect(card?.style.backgroundColor).toBe('red');
  });

  it('unstyled removes sk-* classes', () => {
    const { container } = render(() => (
      <MetricCard label="Unstyled" value="100" unstyled class="custom" />
    ));
    const card = container.firstElementChild;
    expect(card?.className).not.toContain('sk-');
    expect(card?.className).toContain('custom');
  });

  it('does not render icon when not provided', () => {
    const { container } = render(() => <MetricCard label="No Icon" value="100" />);
    expect(container.querySelector('.sk-metric__icon')).not.toBeInTheDocument();
  });

  it('does not render trend when not provided', () => {
    const { container } = render(() => <MetricCard label="No Trend" value="100" />);
    expect(container.querySelector('.sk-metric__trend')).not.toBeInTheDocument();
  });

  it('does not render extra section when no children', () => {
    const { container } = render(() => <MetricCard label="No Extra" value="100" />);
    expect(container.querySelector('.sk-metric__extra')).not.toBeInTheDocument();
  });
});
