import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { FlowDiagram, type FlowLayer } from './FlowDiagram';

const layers: FlowLayer[] = [
  { id: 'l1', title: 'Application', packages: '@app/core', color: 'app' },
  { id: 'l2', title: 'Adapter', subtitle: 'HTTP layer', color: 'adapter' },
  { id: 'l3', title: 'Core', packages: '@core/lib', subtitle: 'Business logic', color: 'core' },
];

describe('FlowDiagram', () => {
  it('renders all layers', () => {
    const { getByText } = render(() => <FlowDiagram layers={layers} />);
    expect(getByText('Application')).toBeInTheDocument();
    expect(getByText('Adapter')).toBeInTheDocument();
    expect(getByText('Core')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    const { getByText } = render(() => <FlowDiagram title="Architecture" layers={layers} />);
    expect(getByText('Architecture')).toBeInTheDocument();
  });

  it('does not render title element when title is omitted', () => {
    const { container } = render(() => <FlowDiagram layers={layers} />);
    expect(container.querySelector('.sk-report-flow__title')).not.toBeInTheDocument();
  });

  it('renders packages text when provided', () => {
    const { getByText } = render(() => <FlowDiagram layers={layers} />);
    expect(getByText('@app/core')).toBeInTheDocument();
    expect(getByText('@core/lib')).toBeInTheDocument();
  });

  it('does not render packages div when packages is omitted', () => {
    const singleLayer: FlowLayer[] = [{ id: 'l1', title: 'No Packages', color: 'app' }];
    const { container } = render(() => <FlowDiagram layers={singleLayer} />);
    expect(container.querySelector('.sk-report-flow__layer-packages')).not.toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    const { getByText } = render(() => <FlowDiagram layers={layers} />);
    expect(getByText('HTTP layer')).toBeInTheDocument();
    expect(getByText('Business logic')).toBeInTheDocument();
  });

  it('does not render subtitle div when subtitle is omitted', () => {
    const singleLayer: FlowLayer[] = [{ id: 'l1', title: 'No Sub', color: 'app' }];
    const { container } = render(() => <FlowDiagram layers={singleLayer} />);
    expect(container.querySelector('.sk-report-flow__layer-subtitle')).not.toBeInTheDocument();
  });

  it('applies color modifier class to each layer', () => {
    const { container } = render(() => <FlowDiagram layers={layers} />);
    expect(container.querySelector('.sk-report-flow__layer--app')).toBeInTheDocument();
    expect(container.querySelector('.sk-report-flow__layer--adapter')).toBeInTheDocument();
    expect(container.querySelector('.sk-report-flow__layer--core')).toBeInTheDocument();
  });

  it('renders arrows between layers but not after the last one', () => {
    const { container } = render(() => <FlowDiagram layers={layers} />);
    const arrows = container.querySelectorAll('.sk-report-flow__arrow');
    expect(arrows).toHaveLength(2); // 3 layers = 2 arrows
  });

  it('renders no arrows for a single layer', () => {
    const singleLayer: FlowLayer[] = [{ id: 'l1', title: 'Only', color: 'app' }];
    const { container } = render(() => <FlowDiagram layers={singleLayer} />);
    const arrows = container.querySelectorAll('.sk-report-flow__arrow');
    expect(arrows).toHaveLength(0);
  });

  it('renders empty when layers array is empty', () => {
    const { container } = render(() => <FlowDiagram layers={[]} />);
    expect(container.querySelector('.sk-report-flow__layer')).not.toBeInTheDocument();
    expect(container.querySelector('.sk-report-flow__arrow')).not.toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => <FlowDiagram layers={layers} class="custom" />);
    expect(container.querySelector('.sk-report-flow')?.classList.contains('custom')).toBe(true);
  });

  it('applies custom style', () => {
    const { container } = render(() => (
      <FlowDiagram layers={layers} style={{ 'max-width': '500px' }} />
    ));
    const el = container.querySelector('.sk-report-flow') as HTMLElement;
    expect(el.style.maxWidth).toBe('500px');
  });
});
