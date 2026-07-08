import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { StatusDot } from './StatusDot';

describe('StatusDot', () => {
  it('renders without errors', () => {
    const { container } = render(() => <StatusDot />);
    expect(container.querySelector('.sk-status-dot')).toBeInTheDocument();
  });

  it('defaults to default status', () => {
    const { container } = render(() => <StatusDot />);
    const dot = container.querySelector('.sk-status-dot--default');
    expect(dot).toBeInTheDocument();
  });

  it('renders with success status', () => {
    const { container } = render(() => <StatusDot status="success" />);
    const dot = container.querySelector('.sk-status-dot--success');
    expect(dot).toBeInTheDocument();
  });

  it('renders with warning status', () => {
    const { container } = render(() => <StatusDot status="warning" />);
    const dot = container.querySelector('.sk-status-dot--warning');
    expect(dot).toBeInTheDocument();
  });

  it('renders with danger status', () => {
    const { container } = render(() => <StatusDot status="danger" />);
    const dot = container.querySelector('.sk-status-dot--danger');
    expect(dot).toBeInTheDocument();
  });

  it('renders with info status', () => {
    const { container } = render(() => <StatusDot status="info" />);
    const dot = container.querySelector('.sk-status-dot--info');
    expect(dot).toBeInTheDocument();
  });

  it('applies default size (md)', () => {
    const { container } = render(() => <StatusDot />);
    const dot = container.querySelector('.sk-status-dot--md');
    expect(dot).toBeInTheDocument();
  });

  it('applies sm size', () => {
    const { container } = render(() => <StatusDot size="sm" />);
    const dot = container.querySelector('.sk-status-dot--sm');
    expect(dot).toBeInTheDocument();
  });

  it('applies md size explicitly', () => {
    const { container } = render(() => <StatusDot size="md" />);
    const dot = container.querySelector('.sk-status-dot--md');
    expect(dot).toBeInTheDocument();
  });

  it('applies lg size', () => {
    const { container } = render(() => <StatusDot size="lg" />);
    const dot = container.querySelector('.sk-status-dot--lg');
    expect(dot).toBeInTheDocument();
  });

  it('applies pulse class when pulse is true', () => {
    const { container } = render(() => <StatusDot pulse />);
    const dot = container.querySelector('.sk-status-dot--pulse');
    expect(dot).toBeInTheDocument();
  });

  it('does not apply pulse class when pulse is false', () => {
    const { container } = render(() => <StatusDot pulse={false} />);
    const dot = container.querySelector('.sk-status-dot--pulse');
    expect(dot).not.toBeInTheDocument();
  });

  it('does not apply pulse class when pulse is undefined', () => {
    const { container } = render(() => <StatusDot />);
    const dot = container.querySelector('.sk-status-dot--pulse');
    expect(dot).not.toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(() => <StatusDot label="Connected" />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    const { container } = render(() => <StatusDot />);
    expect(container.querySelector('.sk-status-dot__label')).not.toBeInTheDocument();
  });

  it('has role=status for accessibility', () => {
    const { container } = render(() => <StatusDot />);
    const dot = container.querySelector('.sk-status-dot');
    expect(dot?.getAttribute('role')).toBe('status');
  });

  it('uses custom aria-label when provided', () => {
    const { container } = render(() => <StatusDot aria-label="Service online" />);
    const dot = container.querySelector('.sk-status-dot');
    expect(dot?.getAttribute('aria-label')).toBe('Service online');
  });

  it('uses default aria-label based on status when no label or aria-label', () => {
    const { container } = render(() => <StatusDot status="success" />);
    const dot = container.querySelector('.sk-status-dot');
    expect(dot?.getAttribute('aria-label')).toBe('success status');
  });

  it('applies custom class', () => {
    const { container } = render(() => <StatusDot class="custom-class" />);
    const dot = container.querySelector('.sk-status-dot');
    expect(dot?.classList.contains('custom-class')).toBe(true);
  });

  it('applies custom style', () => {
    const { container } = render(() => <StatusDot style={{ 'margin-left': '10px' }} />);
    const dot = container.querySelector('.sk-status-dot') as HTMLElement;
    expect(dot?.style.marginLeft).toBe('10px');
  });

  it('combines all classes correctly', () => {
    const { container } = render(() => (
      <StatusDot status="danger" size="lg" pulse class="custom" />
    ));
    const dot = container.querySelector('.sk-status-dot');
    expect(dot?.classList.contains('sk-status-dot')).toBe(true);
    expect(dot?.classList.contains('sk-status-dot--danger')).toBe(true);
    expect(dot?.classList.contains('sk-status-dot--lg')).toBe(true);
    expect(dot?.classList.contains('sk-status-dot--pulse')).toBe(true);
    expect(dot?.classList.contains('custom')).toBe(true);
  });

  it('unstyled removes sk-* classes', () => {
    const { container } = render(() => <StatusDot unstyled class="custom" />);
    const dot = container.firstElementChild;
    expect(dot?.className).not.toContain('sk-');
    expect(dot?.className).toContain('custom');
  });

  it('renders indicator element', () => {
    const { container } = render(() => <StatusDot />);
    expect(container.querySelector('.sk-status-dot__indicator')).toBeInTheDocument();
  });

  it('renders label element when label provided', () => {
    const { container } = render(() => <StatusDot label="Online" />);
    expect(container.querySelector('.sk-status-dot__label')).toBeInTheDocument();
  });
});
