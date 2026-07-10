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

    const headerDivs = container.querySelectorAll('.sk-doc-page__header');
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

    // The page container should not have a footer element
    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    const footerDivs = docPage.querySelectorAll('.sk-doc-page__footer');
    expect(footerDivs.length).toBe(0);
  });

  it('defaults to portrait orientation', () => {
    const { container } = render(() => <DocumentPage>Content</DocumentPage>);

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.classList.contains('sk-doc-page-container--portrait')).toBe(true);
  });

  it('applies landscape orientation', () => {
    const { container } = render(() => (
      <DocumentPage orientation="landscape">Content</DocumentPage>
    ));

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.classList.contains('sk-doc-page-container--landscape')).toBe(true);
  });

  it('defaults to A4 size', () => {
    const { container } = render(() => <DocumentPage>Content</DocumentPage>);

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.classList.contains('sk-doc-page-container--a4')).toBe(true);
    expect(docPage.classList.contains('sk-doc-page-container--portrait')).toBe(true);
  });

  it('applies letter size class', () => {
    const { container } = render(() => <DocumentPage size="letter">Content</DocumentPage>);

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.classList.contains('sk-doc-page-container--letter')).toBe(true);
  });

  it('applies A4 landscape classes', () => {
    const { container } = render(() => (
      <DocumentPage orientation="landscape">Content</DocumentPage>
    ));

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.classList.contains('sk-doc-page-container--a4')).toBe(true);
    expect(docPage.classList.contains('sk-doc-page-container--landscape')).toBe(true);
  });

  it('applies letter landscape classes', () => {
    const { container } = render(() => (
      <DocumentPage size="letter" orientation="landscape">
        Content
      </DocumentPage>
    ));

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.classList.contains('sk-doc-page-container--letter')).toBe(true);
    expect(docPage.classList.contains('sk-doc-page-container--landscape')).toBe(true);
  });

  it('applies custom style', () => {
    const { container } = render(() => (
      <DocumentPage style={{ color: 'red' }}>Content</DocumentPage>
    ));

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.style.color).toBe('red');
  });

  it('applies custom padding via the --sk-doc-padding custom property', () => {
    const { container } = render(() => <DocumentPage padding="30mm">Content</DocumentPage>);

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.style.getPropertyValue('--sk-doc-padding')).toBe('30mm');
  });

  it('does not set the padding custom property by default', () => {
    const { container } = render(() => <DocumentPage>Content</DocumentPage>);

    const docPage = container.querySelector('.sk-doc-page-container') as HTMLElement;
    expect(docPage.style.getPropertyValue('--sk-doc-padding')).toBe('');
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
