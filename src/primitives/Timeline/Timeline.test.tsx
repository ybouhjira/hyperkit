import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Timeline, type TimelineStep } from './Timeline';

describe('Timeline', () => {
  const basicSteps: TimelineStep[] = [
    { title: 'Step 1', status: 'completed' },
    { title: 'Step 2', status: 'active' },
    { title: 'Step 3', status: 'pending' },
  ];

  it('renders all steps', () => {
    const { getByText } = render(() => <Timeline steps={basicSteps} />);
    expect(getByText('Step 1')).toBeInTheDocument();
    expect(getByText('Step 2')).toBeInTheDocument();
    expect(getByText('Step 3')).toBeInTheDocument();
  });

  it('renders step titles', () => {
    const { getByText } = render(() => <Timeline steps={basicSteps} />);
    const title = getByText('Step 1');
    expect(title).toHaveClass('sk-timeline__title');
  });

  it('renders step descriptions when provided', () => {
    const steps: TimelineStep[] = [{ title: 'Step 1', description: 'First step description' }];
    const { getByText } = render(() => <Timeline steps={steps} />);
    const description = getByText('First step description');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('sk-timeline__description');
  });

  it('renders step meta when provided', () => {
    const steps: TimelineStep[] = [{ title: 'Step 1', meta: '2 days ago' }];
    const { getByText } = render(() => <Timeline steps={steps} />);
    const meta = getByText('2 days ago');
    expect(meta).toBeInTheDocument();
    expect(meta).toHaveClass('sk-timeline__meta');
  });

  it('applies default pending status', () => {
    const steps: TimelineStep[] = [{ title: 'Step 1' }];
    const { container } = render(() => <Timeline steps={steps} />);
    const item = container.querySelector('.sk-timeline__item');
    expect(item).toHaveClass('sk-timeline__item--pending');
  });

  it('applies completed status class', () => {
    const steps: TimelineStep[] = [{ title: 'Step 1', status: 'completed' }];
    const { container } = render(() => <Timeline steps={steps} />);
    const item = container.querySelector('.sk-timeline__item');
    expect(item).toHaveClass('sk-timeline__item--completed');
  });

  it('applies active status class', () => {
    const steps: TimelineStep[] = [{ title: 'Step 1', status: 'active' }];
    const { container } = render(() => <Timeline steps={steps} />);
    const item = container.querySelector('.sk-timeline__item');
    expect(item).toHaveClass('sk-timeline__item--active');
  });

  it('applies vertical orientation by default', () => {
    const { container } = render(() => <Timeline steps={basicSteps} />);
    const timeline = container.querySelector('.sk-timeline');
    expect(timeline).toHaveClass('sk-timeline--vertical');
  });

  it('applies horizontal orientation', () => {
    const { container } = render(() => <Timeline steps={basicSteps} orientation="horizontal" />);
    const timeline = container.querySelector('.sk-timeline');
    expect(timeline).toHaveClass('sk-timeline--horizontal');
  });

  it('applies sm size', () => {
    const { container } = render(() => <Timeline steps={basicSteps} size="sm" />);
    const timeline = container.querySelector('.sk-timeline');
    expect(timeline).toHaveClass('sk-timeline--sm');
  });

  it('applies md size', () => {
    const { container } = render(() => <Timeline steps={basicSteps} size="md" />);
    const timeline = container.querySelector('.sk-timeline');
    expect(timeline).toHaveClass('sk-timeline--md');
  });

  it('applies lg size', () => {
    const { container } = render(() => <Timeline steps={basicSteps} size="lg" />);
    const timeline = container.querySelector('.sk-timeline');
    expect(timeline).toHaveClass('sk-timeline--lg');
  });

  it('renders step numbers by default', () => {
    const { getByText } = render(() => <Timeline steps={basicSteps} />);
    expect(getByText('1')).toBeInTheDocument();
    expect(getByText('2')).toBeInTheDocument();
    expect(getByText('3')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => <Timeline steps={basicSteps} class="custom-timeline" />);
    const timeline = container.querySelector('.sk-timeline');
    expect(timeline).toHaveClass('custom-timeline');
  });
});
