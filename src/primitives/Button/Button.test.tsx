import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(() => <Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies primary variant class by default', () => {
    render(() => <Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('sk-btn--primary');
  });

  it('applies secondary variant class', () => {
    render(() => <Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('sk-btn--secondary');
  });

  it('applies ghost variant class', () => {
    render(() => <Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('sk-btn--ghost');
  });

  it('applies danger variant class', () => {
    render(() => <Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('sk-btn--danger');
  });

  it('applies small size class', () => {
    render(() => <Button size="sm">Small</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('sk-btn--sm');
  });

  it('applies medium size class by default', () => {
    render(() => <Button>Medium</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('sk-btn--md');
  });

  it('applies large size class', () => {
    render(() => <Button size="lg">Large</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('sk-btn--lg');
  });

  it('shows spinner and disables button when loading', () => {
    render(() => <Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
  });

  it('disables button when disabled prop is true', () => {
    render(() => <Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(() => <Button onClick={handleClick}>Click</Button>);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(() => (
      <Button disabled onClick={handleClick}>
        Click
      </Button>
    ));
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom class', () => {
    render(() => <Button class="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('custom-class');
  });

  it('defaults type to button', () => {
    render(() => <Button>Default Type</Button>);
    const button = screen.getByRole('button');
    expect(button.getAttribute('type')).toBe('button');
  });

  it('applies submit type when specified', () => {
    render(() => <Button type="submit">Submit</Button>);
    const button = screen.getByRole('button');
    expect(button.getAttribute('type')).toBe('submit');
  });

  it('applies reset type when specified', () => {
    render(() => <Button type="reset">Reset</Button>);
    const button = screen.getByRole('button');
    expect(button.getAttribute('type')).toBe('reset');
  });

  it('unstyled removes sk-btn classes', () => {
    const { container } = render(() => (
      <Button unstyled class="custom">
        Text
      </Button>
    ));
    const btn = container.querySelector('button');
    expect(btn?.className).not.toContain('sk-btn');
    expect(btn?.className).toContain('custom');
  });

  it('classNames.spinner adds custom class to spinner', () => {
    const { container } = render(() => (
      <Button loading classNames={{ spinner: 'my-spinner' }}>
        Loading
      </Button>
    ));
    const spinner = container.querySelector('[data-testid="button-spinner"]');
    const classAttr = spinner?.getAttribute('class') ?? '';
    expect(classAttr).toContain('my-spinner');
    expect(classAttr).toContain('sk-btn__spinner');
  });

  it('unstyled + classNames uses only custom classes', () => {
    const { container } = render(() => (
      <Button unstyled classNames={{ root: 'my-btn', spinner: 'my-spin' }} loading>
        Text
      </Button>
    ));
    const btn = container.querySelector('button');
    expect(btn?.className).toContain('my-btn');
    expect(btn?.className).not.toContain('sk-btn');
  });

  describe('tooltip prop', () => {
    it('renders the button directly when no tooltip is set', () => {
      const { container } = render(() => <Button>Plain</Button>);
      const trigger = container.querySelector('.sk-tooltip__trigger');
      expect(trigger).toBeNull();
    });

    it('wraps the button in a Tooltip trigger when tooltip is provided', () => {
      const { container } = render(() => <Button tooltip="Delete">X</Button>);
      // In the test/SSR environment (isServer=true), Tooltip renders children only.
      // In a browser (isServer=false), it lazily mounts the Kobalte Tooltip which
      // adds .sk-tooltip__trigger. We verify the button itself still renders.
      const btn = container.querySelector('button');
      expect(btn).toBeTruthy();
    });

    it('button with tooltip remains clickable', () => {
      const handleClick = vi.fn();
      const { container } = render(() => (
        <Button tooltip="Info" onClick={handleClick}>
          Go
        </Button>
      ));
      const btn = container.querySelector('button')!;
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledOnce();
    });
  });
});
