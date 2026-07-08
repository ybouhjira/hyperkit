import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { PresetGrid, type PresetItem } from './PresetGrid';

const presets: PresetItem[] = [
  {
    name: 'Ocean',
    description: 'Cool blues and greens',
    gradient: 'linear-gradient(135deg, #0077b6, #00b4d8)',
  },
  {
    name: 'Sunset',
    description: 'Warm oranges and reds',
    gradient: 'linear-gradient(135deg, #e76f51, #f4a261)',
  },
  {
    name: 'Forest',
    description: 'Deep greens',
    gradient: 'linear-gradient(135deg, #2d6a4f, #52b788)',
  },
];

describe('PresetGrid', () => {
  it('renders all preset cards', () => {
    const { getByText } = render(() => <PresetGrid presets={presets} />);
    expect(getByText('Ocean')).toBeInTheDocument();
    expect(getByText('Sunset')).toBeInTheDocument();
    expect(getByText('Forest')).toBeInTheDocument();
  });

  it('renders preset descriptions', () => {
    const { getByText } = render(() => <PresetGrid presets={presets} />);
    expect(getByText('Cool blues and greens')).toBeInTheDocument();
    expect(getByText('Warm oranges and reds')).toBeInTheDocument();
    expect(getByText('Deep greens')).toBeInTheDocument();
  });

  it('applies gradient as background style on swatches', () => {
    const { container } = render(() => <PresetGrid presets={presets} />);
    const swatches = container.querySelectorAll('.sk-report-preset-swatch');
    expect(swatches).toHaveLength(3);
    expect((swatches[0] as HTMLElement).style.background).toContain('linear-gradient');
    expect((swatches[0] as HTMLElement).style.background).toContain('135deg');
    expect((swatches[1] as HTMLElement).style.background).toContain('linear-gradient');
    expect((swatches[1] as HTMLElement).style.background).toContain('135deg');
  });

  it('renders empty when presets is empty', () => {
    const { container } = render(() => <PresetGrid presets={[]} />);
    expect(container.querySelector('.sk-report-preset-card')).not.toBeInTheDocument();
  });

  it('renders a single preset', () => {
    const single: PresetItem[] = [{ name: 'Solo', description: 'Just one', gradient: 'red' }];
    const { getByText, container } = render(() => <PresetGrid presets={single} />);
    expect(getByText('Solo')).toBeInTheDocument();
    expect(container.querySelectorAll('.sk-report-preset-card')).toHaveLength(1);
  });

  it('applies custom class', () => {
    const { container } = render(() => <PresetGrid presets={presets} class="grid-custom" />);
    expect(
      container.querySelector('.sk-report-preset-grid')?.classList.contains('grid-custom')
    ).toBe(true);
  });

  it('applies custom style', () => {
    const { container } = render(() => <PresetGrid presets={presets} style={{ gap: '24px' }} />);
    const el = container.querySelector('.sk-report-preset-grid') as HTMLElement;
    expect(el.style.gap).toBe('24px');
  });
});
