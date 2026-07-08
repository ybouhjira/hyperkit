import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { LayerStack, type StackLayer } from './LayerStack';

const layers: StackLayer[] = [
  { label: 'L4', name: 'Presentation', info: 'UI components', color: 'purple' },
  { label: 'L3', name: 'Application', info: 'Business logic', color: 'blue' },
  { label: 'L2', name: 'Domain', info: '<strong>Core</strong> models', color: 'teal' },
  { label: 'L1', name: 'Infrastructure', info: 'Data access', color: 'green' },
];

describe('LayerStack', () => {
  it('renders all layers', () => {
    const { getByText } = render(() => <LayerStack layers={layers} />);
    expect(getByText('Presentation')).toBeInTheDocument();
    expect(getByText('Application')).toBeInTheDocument();
    expect(getByText('Infrastructure')).toBeInTheDocument();
  });

  it('renders layer labels', () => {
    const { getByText } = render(() => <LayerStack layers={layers} />);
    expect(getByText('L4')).toBeInTheDocument();
    expect(getByText('L3')).toBeInTheDocument();
    expect(getByText('L2')).toBeInTheDocument();
    expect(getByText('L1')).toBeInTheDocument();
  });

  it('renders info content via innerHTML', () => {
    const { container } = render(() => <LayerStack layers={layers} />);
    const infoEls = container.querySelectorAll('.sk-report-layer__info');
    expect(infoEls[0]?.textContent).toBe('UI components');
    // The HTML info should be parsed
    expect(infoEls[2]?.innerHTML).toBe('<strong>Core</strong> models');
  });

  it('applies color modifier class to each layer', () => {
    const { container } = render(() => <LayerStack layers={layers} />);
    expect(container.querySelector('.sk-report-layer--purple')).toBeInTheDocument();
    expect(container.querySelector('.sk-report-layer--blue')).toBeInTheDocument();
    expect(container.querySelector('.sk-report-layer--teal')).toBeInTheDocument();
    expect(container.querySelector('.sk-report-layer--green')).toBeInTheDocument();
  });

  it('renders empty when layers is empty', () => {
    const { container } = render(() => <LayerStack layers={[]} />);
    expect(container.querySelector('.sk-report-layer')).not.toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => <LayerStack layers={layers} class="stacked" />);
    expect(container.querySelector('.sk-report-layer-stack')?.classList.contains('stacked')).toBe(
      true
    );
  });

  it('applies custom style', () => {
    const { container } = render(() => <LayerStack layers={layers} style={{ gap: '8px' }} />);
    const el = container.querySelector('.sk-report-layer-stack') as HTMLElement;
    expect(el.style.gap).toBe('8px');
  });

  it('renders a single layer correctly', () => {
    const single: StackLayer[] = [
      { label: 'L1', name: 'Only Layer', info: 'Single', color: 'teal' },
    ];
    const { getByText, container } = render(() => <LayerStack layers={single} />);
    expect(getByText('Only Layer')).toBeInTheDocument();
    expect(container.querySelectorAll('.sk-report-layer')).toHaveLength(1);
  });
});
