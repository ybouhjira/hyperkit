import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { SourceList, type SourceGroup } from './SourceList';

const groups: SourceGroup[] = [
  {
    title: 'Documentation',
    sources: [
      { url: 'https://docs.example.com', label: 'Official Docs', description: 'API reference' },
      { url: 'https://guide.example.com', label: 'Getting Started' },
    ],
  },
  {
    title: 'Community',
    sources: [
      { url: 'https://github.com/example', label: 'GitHub Repo', description: 'Source code' },
    ],
  },
];

describe('SourceList', () => {
  it('renders all group titles', () => {
    const { getByText } = render(() => <SourceList groups={groups} />);
    expect(getByText('Documentation')).toBeInTheDocument();
    expect(getByText('Community')).toBeInTheDocument();
  });

  it('renders all source links', () => {
    const { getByText } = render(() => <SourceList groups={groups} />);
    expect(getByText('Official Docs')).toBeInTheDocument();
    expect(getByText('Getting Started')).toBeInTheDocument();
    expect(getByText('GitHub Repo')).toBeInTheDocument();
  });

  it('renders links with correct href', () => {
    const { getByText } = render(() => <SourceList groups={groups} />);
    const link = getByText('Official Docs') as HTMLAnchorElement;
    expect(link.href).toBe('https://docs.example.com/');
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener noreferrer');
  });

  it('renders description when provided', () => {
    const { getByText } = render(() => <SourceList groups={groups} />);
    expect(getByText('API reference')).toBeInTheDocument();
    expect(getByText('Source code')).toBeInTheDocument();
  });

  it('does not render description span when omitted', () => {
    const noDesc: SourceGroup[] = [
      {
        title: 'Links',
        sources: [{ url: 'https://a.com', label: 'Link A' }],
      },
    ];
    const { container } = render(() => <SourceList groups={noDesc} />);
    expect(container.querySelector('.sk-report-source-list__desc')).not.toBeInTheDocument();
  });

  it('renders empty when groups is empty', () => {
    const { container } = render(() => <SourceList groups={[]} />);
    expect(container.querySelector('.sk-report-source-group')).not.toBeInTheDocument();
  });

  it('renders group with multiple sources', () => {
    const { container } = render(() => <SourceList groups={groups} />);
    const firstGroup = container.querySelectorAll('.sk-report-source-group')[0];
    const items = firstGroup?.querySelectorAll('.sk-report-source-list__item');
    expect(items).toHaveLength(2);
  });

  it('applies custom class', () => {
    const { container } = render(() => <SourceList groups={groups} class="my-sources" />);
    expect(container.querySelector('.sk-report-sources')?.classList.contains('my-sources')).toBe(
      true
    );
  });

  it('applies custom style', () => {
    const { container } = render(() => (
      <SourceList groups={groups} style={{ 'margin-top': '20px' }} />
    ));
    const el = container.querySelector('.sk-report-sources') as HTMLElement;
    expect(el.style.marginTop).toBe('20px');
  });
});
