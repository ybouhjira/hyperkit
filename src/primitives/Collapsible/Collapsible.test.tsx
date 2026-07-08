import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { Collapsible } from './Collapsible';

describe('Collapsible', () => {
  it('renders trigger content', () => {
    render(() => (
      <Collapsible trigger="Click me">
        <p>Hidden content</p>
      </Collapsible>
    ));
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders children content when open', () => {
    render(() => (
      <Collapsible trigger="Toggle" open={true}>
        <p>Visible content</p>
      </Collapsible>
    ));
    expect(screen.getByText('Visible content')).toBeInTheDocument();
  });

  it('does not render children content when closed', () => {
    render(() => (
      <Collapsible trigger="Toggle" open={false}>
        <p>Hidden content</p>
      </Collapsible>
    ));
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when trigger is clicked', () => {
    const handler = vi.fn();
    render(() => (
      <Collapsible trigger="Toggle" onOpenChange={handler}>
        <p>Content</p>
      </Collapsible>
    ));
    const trigger = screen.getByText('Toggle');
    fireEvent.click(trigger);
    expect(handler).toHaveBeenCalledWith(true);
  });

  it('shows content by default when defaultOpen is true', () => {
    render(() => (
      <Collapsible trigger="Toggle" defaultOpen={true}>
        <p>Default visible</p>
      </Collapsible>
    ));
    expect(screen.getByText('Default visible')).toBeInTheDocument();
  });

  it('applies custom class to root element', () => {
    const { container } = render(() => (
      <Collapsible trigger="Toggle" class="custom-class">
        <p>Content</p>
      </Collapsible>
    ));
    const root = container.querySelector('.custom-class');
    expect(root).toBeInTheDocument();
  });

  it('disables the trigger when disabled is true', () => {
    render(() => (
      <Collapsible trigger="Toggle" disabled={true}>
        <p>Content</p>
      </Collapsible>
    ));
    const trigger = screen.getByText('Toggle').closest('button');
    expect(trigger).toBeDisabled();
  });

  it('does not call onOpenChange when disabled', () => {
    const handler = vi.fn();
    render(() => (
      <Collapsible trigger="Toggle" disabled={true} onOpenChange={handler}>
        <p>Content</p>
      </Collapsible>
    ));
    const trigger = screen.getByText('Toggle');
    fireEvent.click(trigger);
    expect(handler).not.toHaveBeenCalled();
  });

  it('renders chevron icon', () => {
    const { container } = render(() => (
      <Collapsible trigger="Toggle">
        <p>Content</p>
      </Collapsible>
    ));
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.querySelector('polyline')).toBeInTheDocument();
  });

  it('unstyled removes sk-collapsible classes', () => {
    const { container } = render(() => (
      <Collapsible unstyled trigger="Toggle">
        Content
      </Collapsible>
    ));
    expect(container.innerHTML).not.toContain('sk-collapsible__trigger');
  });

  it('classNames adds custom classes to parts', () => {
    const { container } = render(() => (
      <Collapsible classNames={{ trigger: 'my-trigger' }} trigger="Toggle">
        Content
      </Collapsible>
    ));
    const trigger = container.querySelector('button');
    expect(trigger?.className).toContain('my-trigger');
    expect(trigger?.className).toContain('sk-collapsible__trigger');
  });
});
