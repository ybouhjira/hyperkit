import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { ReportShell } from './ReportShell';

describe('ReportShell', () => {
  it('renders children', () => {
    const { getByText } = render(() => (
      <ReportShell>
        <div>Report content</div>
      </ReportShell>
    ));
    expect(getByText('Report content')).toBeInTheDocument();
  });

  it('renders the sk-report root class', () => {
    const { container } = render(() => (
      <ReportShell>
        <span>inner</span>
      </ReportShell>
    ));
    expect(container.querySelector('.sk-report')).toBeInTheDocument();
  });

  it('applies a custom class alongside the base class', () => {
    const { container } = render(() => (
      <ReportShell class="my-custom">
        <span>inner</span>
      </ReportShell>
    ));
    const el = container.querySelector('.sk-report');
    expect(el?.classList.contains('my-custom')).toBe(true);
  });

  it('applies custom inline styles', () => {
    const { container } = render(() => (
      <ReportShell style={{ 'max-width': '960px' }}>
        <span>inner</span>
      </ReportShell>
    ));
    const el = container.querySelector('.sk-report') as HTMLElement;
    expect(el.style.maxWidth).toBe('960px');
  });

  it('renders multiple children', () => {
    const { getByText } = render(() => (
      <ReportShell>
        <header>Header</header>
        <main>Main</main>
        <footer>Footer</footer>
      </ReportShell>
    ));
    expect(getByText('Header')).toBeInTheDocument();
    expect(getByText('Main')).toBeInTheDocument();
    expect(getByText('Footer')).toBeInTheDocument();
  });

  it('renders a div as the root element', () => {
    const { container } = render(() => (
      <ReportShell>
        <span>child</span>
      </ReportShell>
    ));
    const el = container.querySelector('.sk-report');
    expect(el?.tagName).toBe('DIV');
  });

  it('renders without class prop (uses empty string fallback)', () => {
    const { container } = render(() => (
      <ReportShell>
        <span>child</span>
      </ReportShell>
    ));
    const el = container.querySelector('.sk-report');
    expect(el).toBeInTheDocument();
  });
});
