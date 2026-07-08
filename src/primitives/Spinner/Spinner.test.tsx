import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with role="status"', () => {
    const { container } = render(() => <Spinner />);
    const spinner = container.querySelector('[role="status"]');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with default label "Loading"', () => {
    const { getByText } = render(() => <Spinner />);
    const label = getByText('Loading');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('sk-spinner__label');
  });

  it('renders with custom label', () => {
    const { getByText } = render(() => <Spinner label="Please wait..." />);
    const label = getByText('Please wait...');
    expect(label).toBeInTheDocument();
  });

  it('applies default size "md"', () => {
    const { container } = render(() => <Spinner />);
    const spinner = container.querySelector('[role="status"]');
    expect(spinner).toHaveClass('sk-spinner--md');
  });

  it('applies small size', () => {
    const { container } = render(() => <Spinner size="sm" />);
    const spinner = container.querySelector('[role="status"]');
    expect(spinner).toHaveClass('sk-spinner--sm');
  });

  it('applies large size', () => {
    const { container } = render(() => <Spinner size="lg" />);
    const spinner = container.querySelector('[role="status"]');
    expect(spinner).toHaveClass('sk-spinner--lg');
  });

  it('applies default color "primary"', () => {
    const { container } = render(() => <Spinner />);
    const spinner = container.querySelector('[role="status"]');
    expect(spinner).toHaveClass('sk-spinner--primary');
  });

  it('applies secondary color', () => {
    const { container } = render(() => <Spinner color="secondary" />);
    const spinner = container.querySelector('[role="status"]');
    expect(spinner).toHaveClass('sk-spinner--secondary');
  });

  it('applies muted color', () => {
    const { container } = render(() => <Spinner color="muted" />);
    const spinner = container.querySelector('[role="status"]');
    expect(spinner).toHaveClass('sk-spinner--muted');
  });

  it('applies on-accent color', () => {
    const { container } = render(() => <Spinner color="on-accent" />);
    const spinner = container.querySelector('[role="status"]');
    expect(spinner).toHaveClass('sk-spinner--on-accent');
  });

  it('applies custom class', () => {
    const { container } = render(() => <Spinner class="custom-spinner" />);
    const spinner = container.querySelector('[role="status"]');
    expect(spinner).toHaveClass('custom-spinner');
  });

  it('label is visually hidden but accessible', () => {
    const { container } = render(() => <Spinner />);
    const label = container.querySelector('.sk-spinner__label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('sk-spinner__label');
  });

  it('unstyled removes sk-* classes', () => {
    const { container } = render(() => <Spinner unstyled class="custom" />);
    const spinner = container.querySelector('[role="status"]');
    expect(spinner?.className).not.toContain('sk-');
    expect(spinner?.className).toContain('custom');
  });
});
