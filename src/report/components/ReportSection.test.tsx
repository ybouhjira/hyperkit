import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { ReportSection } from './ReportSection';

describe('ReportSection', () => {
  it('renders the title', () => {
    const { getByText } = render(() => (
      <ReportSection id="s1" title="Overview">
        <p>Child content</p>
      </ReportSection>
    ));
    expect(getByText('Overview')).toBeInTheDocument();
  });

  it('renders title as h2', () => {
    const { container } = render(() => (
      <ReportSection id="s1" title="My Title">
        <p>content</p>
      </ReportSection>
    ));
    const h2 = container.querySelector('h2.sk-report-section__title');
    expect(h2).toBeInTheDocument();
    expect(h2?.textContent).toBe('My Title');
  });

  it('renders as a section element', () => {
    const { container } = render(() => (
      <ReportSection id="section-1" title="Section">
        <p>content</p>
      </ReportSection>
    ));
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section?.classList.contains('sk-report-section')).toBe(true);
  });

  it('sets the id attribute on the section element', () => {
    const { container } = render(() => (
      <ReportSection id="unique-id" title="Title">
        <p>content</p>
      </ReportSection>
    ));
    const section = container.querySelector('section');
    expect(section?.id).toBe('unique-id');
  });

  it('renders label when provided', () => {
    const { getByText } = render(() => (
      <ReportSection id="s1" label="Section 01" title="Title">
        <p>content</p>
      </ReportSection>
    ));
    expect(getByText('Section 01')).toBeInTheDocument();
  });

  it('does not render label element when label is omitted', () => {
    const { container } = render(() => (
      <ReportSection id="s1" title="Title">
        <p>content</p>
      </ReportSection>
    ));
    expect(container.querySelector('.sk-report-section__label')).not.toBeInTheDocument();
  });

  it('renders plain text description when provided', () => {
    const { getByText } = render(() => (
      <ReportSection id="s1" title="Title" description="A plain description">
        <p>content</p>
      </ReportSection>
    ));
    expect(getByText('A plain description')).toBeInTheDocument();
  });

  it('does not render description element when omitted', () => {
    const { container } = render(() => (
      <ReportSection id="s1" title="Title">
        <p>content</p>
      </ReportSection>
    ));
    expect(container.querySelector('.sk-report-section__desc')).not.toBeInTheDocument();
  });

  it('renders HTML description via innerHTML when descriptionHtml is true', () => {
    const { container } = render(() => (
      <ReportSection
        id="s1"
        title="Title"
        description="<strong>Bold</strong> description"
        descriptionHtml
      >
        <p>content</p>
      </ReportSection>
    ));
    const desc = container.querySelector('.sk-report-section__desc');
    expect(desc).toBeInTheDocument();
    expect(desc?.querySelector('strong')?.textContent).toBe('Bold');
  });

  it('renders plain text description when descriptionHtml is false', () => {
    const { container } = render(() => (
      <ReportSection
        id="s1"
        title="Title"
        description="<strong>Not bold</strong>"
        descriptionHtml={false}
      >
        <p>content</p>
      </ReportSection>
    ));
    const desc = container.querySelector('.sk-report-section__desc');
    expect(desc).toBeInTheDocument();
    // Should render as text, not parsed HTML
    expect(desc?.querySelector('strong')).not.toBeInTheDocument();
  });

  it('renders children', () => {
    const { getByText } = render(() => (
      <ReportSection id="s1" title="Title">
        <div>Child element</div>
      </ReportSection>
    ));
    expect(getByText('Child element')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    const { getByText } = render(() => (
      <ReportSection id="s1" title="Title">
        <>
          <p>First child</p>
          <p>Second child</p>
        </>
      </ReportSection>
    ));
    expect(getByText('First child')).toBeInTheDocument();
    expect(getByText('Second child')).toBeInTheDocument();
  });

  it('renders all props together', () => {
    const { getByText, container } = render(() => (
      <ReportSection id="full" label="Step 1" title="Full Section" description="All props set">
        <p>Content</p>
      </ReportSection>
    ));
    expect(container.querySelector('section')?.id).toBe('full');
    expect(getByText('Step 1')).toBeInTheDocument();
    expect(getByText('Full Section')).toBeInTheDocument();
    expect(getByText('All props set')).toBeInTheDocument();
    expect(getByText('Content')).toBeInTheDocument();
  });
});
