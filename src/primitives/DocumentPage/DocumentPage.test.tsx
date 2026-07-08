import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { DocumentPage } from './DocumentPage';

describe('DocumentPage', () => {
  it('renders children', () => {
    const { getByText } = render(() => (
      <DocumentPage>
        <span>Page content</span>
      </DocumentPage>
    ));

    expect(getByText('Page content')).toBeInTheDocument();
  });

  it('applies sk-doc-page-container class', () => {
    const { container } = render(() => <DocumentPage>Content</DocumentPage>);

    const docPage = container.querySelector('.sk-doc-page-container');
    expect(docPage).toBeInTheDocument();
  });

  it('renders header when provided', () => {
    const { getByText } = render(() => (
      <DocumentPage header={<div>My Header</div>}>Content</DocumentPage>
    ));

    expect(getByText('My Header')).toBeInTheDocument();
  });

  it('does not render header when not provided', () => {
    const { container } = render(() => <DocumentPage>Content</DocumentPage>);

    // Header div should not be present (checked by border-bottom style)
    const headerDivs = container.querySelectorAll('div[style*="border-bottom: 1px solid"]');
    expect(headerDivs.length).toBe(0);
  });

  it('renders footer when provided', () => {
    const { getByText } = render(() => (
      <DocumentPage footer={<span>Footer text</span>}>Content</DocumentPage>
    ));

    expect(getByText('Footer text')).toBeInTheDocument();
  });

  it('renders page number when provided', () => {
    const { container } = render(() => <DocumentPage pageNumber={3}>Content</DocumentPage>);

    expect(container.textContent).toContain('Page 3');
  });

  it('does not render footer section when neither footer nor pageNumber provided', () => {
    const { container } = render(() => <DocumentPage>Content</DocumentPage>);

    // The page container should not have a footer div with page-number text
    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    const footerDivs = docPage.querySelectorAll('div[style*="margin-top: auto"]');
    expect(footerDivs.length).toBe(0);
  });

  it('defaults to portrait orientation', () => {
    const { container } = render(() => <DocumentPage>Content</DocumentPage>);

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.style.maxWidth).toBe('800px');
  });

  it('applies landscape orientation', () => {
    const { container } = render(() => (
      <DocumentPage orientation="landscape">Content</DocumentPage>
    ));

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.style.maxWidth).toBe('1100px');
  });

  it('defaults to A4 size with portrait aspect ratio', () => {
    const { container } = render(() => <DocumentPage>Content</DocumentPage>);

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.style.aspectRatio).toBe('210 / 297');
  });

  it('applies letter size portrait aspect ratio', () => {
    const { container } = render(() => <DocumentPage size="letter">Content</DocumentPage>);

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.style.aspectRatio).toBe('8.5 / 11');
  });

  it('applies A4 landscape aspect ratio', () => {
    const { container } = render(() => (
      <DocumentPage orientation="landscape">Content</DocumentPage>
    ));

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.style.aspectRatio).toBe('297 / 210');
  });

  it('applies letter landscape aspect ratio', () => {
    const { container } = render(() => (
      <DocumentPage size="letter" orientation="landscape">
        Content
      </DocumentPage>
    ));

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.style.aspectRatio).toBe('11 / 8.5');
  });

  it('applies custom style', () => {
    const { container } = render(() => (
      <DocumentPage style={{ color: 'red' }}>Content</DocumentPage>
    ));

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.style.color).toBe('red');
  });

  it('applies custom padding', () => {
    const { container } = render(() => <DocumentPage padding="30mm">Content</DocumentPage>);

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.style.padding).toContain('30mm');
  });

  it('renders both header and footer together', () => {
    const { getByText } = render(() => (
      <DocumentPage header={<div>Header</div>} footer={<div>Footer</div>} pageNumber={1}>
        Body
      </DocumentPage>
    ));

    expect(getByText('Header')).toBeInTheDocument();
    expect(getByText('Footer')).toBeInTheDocument();
    expect(getByText('Body')).toBeInTheDocument();
  });
});
