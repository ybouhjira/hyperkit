import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { PackageTree, type PackageBox } from './PackageTree';

const boxes: PackageBox[] = [
  {
    name: '@hyperkit/core',
    note: 'Foundation package',
    items: ['Box', 'Text', 'Button'],
    chips: [{ label: 'v2.5.0', detail: 'latest' }, { label: 'MIT' }],
  },
  {
    name: '@hyperkit/theme',
    items: ['ThemeProvider', 'useTheme'],
  },
  {
    name: '@hyperkit/icons',
  },
];

describe('PackageTree', () => {
  it('renders all package boxes', () => {
    const { getByText } = render(() => <PackageTree boxes={boxes} />);
    expect(getByText('@hyperkit/core')).toBeInTheDocument();
    expect(getByText('@hyperkit/theme')).toBeInTheDocument();
    expect(getByText('@hyperkit/icons')).toBeInTheDocument();
  });

  it('renders note when provided', () => {
    const { getByText } = render(() => <PackageTree boxes={boxes} />);
    expect(getByText('Foundation package')).toBeInTheDocument();
  });

  it('does not render note when omitted', () => {
    const noNote: PackageBox[] = [{ name: 'pkg' }];
    const { container } = render(() => <PackageTree boxes={noNote} />);
    expect(container.querySelector('.sk-report-pkg-box__note')).not.toBeInTheDocument();
  });

  it('renders tree items when provided', () => {
    const { getByText } = render(() => <PackageTree boxes={boxes} />);
    expect(getByText('Box')).toBeInTheDocument();
    expect(getByText('Text')).toBeInTheDocument();
    expect(getByText('Button')).toBeInTheDocument();
  });

  it('does not render tree list when items is undefined', () => {
    const noItems: PackageBox[] = [{ name: 'empty-pkg' }];
    const { container } = render(() => <PackageTree boxes={noItems} />);
    expect(container.querySelector('.sk-report-pkg-tree')).not.toBeInTheDocument();
  });

  it('does not render tree list when items is empty', () => {
    const emptyItems: PackageBox[] = [{ name: 'empty-pkg', items: [] }];
    const { container } = render(() => <PackageTree boxes={emptyItems} />);
    expect(container.querySelector('.sk-report-pkg-tree')).not.toBeInTheDocument();
  });

  it('renders chips with labels', () => {
    const { getByText } = render(() => <PackageTree boxes={boxes} />);
    expect(getByText('v2.5.0')).toBeInTheDocument();
    expect(getByText('MIT')).toBeInTheDocument();
  });

  it('renders chip detail when provided', () => {
    const { getByText } = render(() => <PackageTree boxes={boxes} />);
    expect(getByText('latest')).toBeInTheDocument();
  });

  it('does not render chip detail when omitted', () => {
    const withChip: PackageBox[] = [{ name: 'pkg', chips: [{ label: 'tag-only' }] }];
    const { container } = render(() => <PackageTree boxes={withChip} />);
    expect(container.querySelector('.sk-report-pkg-chip__detail')).not.toBeInTheDocument();
  });

  it('does not render chips section when chips is undefined', () => {
    const noChips: PackageBox[] = [{ name: 'pkg' }];
    const { container } = render(() => <PackageTree boxes={noChips} />);
    expect(container.querySelector('.sk-report-pkg-box__chips')).not.toBeInTheDocument();
  });

  it('does not render chips section when chips is empty', () => {
    const emptyChips: PackageBox[] = [{ name: 'pkg', chips: [] }];
    const { container } = render(() => <PackageTree boxes={emptyChips} />);
    expect(container.querySelector('.sk-report-pkg-box__chips')).not.toBeInTheDocument();
  });

  it('renders empty when boxes is empty', () => {
    const { container } = render(() => <PackageTree boxes={[]} />);
    expect(container.querySelector('.sk-report-pkg-box')).not.toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => <PackageTree boxes={boxes} class="my-tree" />);
    expect(container.querySelector('.sk-report-pkg-grid')?.classList.contains('my-tree')).toBe(
      true
    );
  });

  it('applies custom style', () => {
    const { container } = render(() => (
      <PackageTree boxes={boxes} style={{ 'max-width': '600px' }} />
    ));
    const el = container.querySelector('.sk-report-pkg-grid') as HTMLElement;
    expect(el.style.maxWidth).toBe('600px');
  });
});
