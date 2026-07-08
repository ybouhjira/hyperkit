import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Section } from './Section';

describe('Section', () => {
  it('renders children', () => {
    const { getByText } = render(() => (
      <Section>
        <div>Test content</div>
      </Section>
    ));
    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('renders as section element by default', () => {
    const { container } = render(() => (
      <Section>
        <div>Content</div>
      </Section>
    ));
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('applies default background class', () => {
    const { container } = render(() => (
      <Section>
        <div>Content</div>
      </Section>
    ));
    const section = container.querySelector('.sk-section');
    expect(section).toBeInTheDocument();
    expect(section).not.toHaveClass('sk-section--muted');
    expect(section).not.toHaveClass('sk-section--accent');
    expect(section).not.toHaveClass('sk-section--gradient');
  });

  it('applies muted background class', () => {
    const { container } = render(() => (
      <Section bg="muted">
        <div>Content</div>
      </Section>
    ));
    expect(container.querySelector('.sk-section--muted')).toBeInTheDocument();
  });

  it('applies accent background class', () => {
    const { container } = render(() => (
      <Section bg="accent">
        <div>Content</div>
      </Section>
    ));
    expect(container.querySelector('.sk-section--accent')).toBeInTheDocument();
  });

  it('applies gradient background class', () => {
    const { container } = render(() => (
      <Section bg="gradient">
        <div>Content</div>
      </Section>
    ));
    expect(container.querySelector('.sk-section--gradient')).toBeInTheDocument();
  });

  it('applies default py-lg class', () => {
    const { container } = render(() => (
      <Section>
        <div>Content</div>
      </Section>
    ));
    expect(container.querySelector('.sk-section--py-lg')).toBeInTheDocument();
  });

  it('applies py-sm class', () => {
    const { container } = render(() => (
      <Section py="sm">
        <div>Content</div>
      </Section>
    ));
    expect(container.querySelector('.sk-section--py-sm')).toBeInTheDocument();
  });

  it('applies py-md class', () => {
    const { container } = render(() => (
      <Section py="md">
        <div>Content</div>
      </Section>
    ));
    expect(container.querySelector('.sk-section--py-md')).toBeInTheDocument();
  });

  it('applies py-xl class', () => {
    const { container } = render(() => (
      <Section py="xl">
        <div>Content</div>
      </Section>
    ));
    expect(container.querySelector('.sk-section--py-xl')).toBeInTheDocument();
  });

  it('applies custom maxWidth', () => {
    const { container } = render(() => (
      <Section maxWidth="800px">
        <div>Content</div>
      </Section>
    ));
    const inner = container.querySelector('.sk-section__inner');
    expect(inner).toHaveStyle({ '--sk-section-max-width': '800px' });
  });

  it('renders inner container by default', () => {
    const { container } = render(() => (
      <Section>
        <div>Content</div>
      </Section>
    ));
    expect(container.querySelector('.sk-section__inner')).toBeInTheDocument();
  });

  it('removes inner container when fullBleed is true', () => {
    const { container } = render(() => (
      <Section fullBleed>
        <div>Content</div>
      </Section>
    ));
    expect(container.querySelector('.sk-section__inner')).not.toBeInTheDocument();
  });

  it('applies custom class', () => {
    const { container } = render(() => (
      <Section class="custom-class">
        <div>Content</div>
      </Section>
    ));
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies custom style', () => {
    const { container } = render(() => (
      <Section style={{ border: '1px solid red' }}>
        <div>Content</div>
      </Section>
    ));
    const section = container.querySelector('.sk-section') as HTMLElement;
    expect(section?.style.border).toBe('1px solid red');
  });

  it('renders as custom element when as prop is provided', () => {
    const { container } = render(() => (
      <Section as="header">
        <div>Content</div>
      </Section>
    ));
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('section')).not.toBeInTheDocument();
  });

  it('renders as footer element', () => {
    const { container } = render(() => (
      <Section as="footer">
        <div>Content</div>
      </Section>
    ));
    expect(container.querySelector('footer')).toBeInTheDocument();
  });

  it('renders as div element', () => {
    const { container } = render(() => (
      <Section as="div">
        <div>Content</div>
      </Section>
    ));
    const div = container.querySelector('div.sk-section');
    expect(div).toBeInTheDocument();
  });
});
