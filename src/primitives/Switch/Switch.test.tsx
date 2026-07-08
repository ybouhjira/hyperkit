import { render, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders with label', () => {
    const { getByText } = render(() => <Switch label="Enable notifications" />);
    expect(getByText('Enable notifications')).toBeInTheDocument();
  });

  it('renders with label and description', () => {
    const { getByText } = render(() => (
      <Switch label="Enable notifications" description="Receive email alerts" />
    ));
    expect(getByText('Enable notifications')).toBeInTheDocument();
    expect(getByText('Receive email alerts')).toBeInTheDocument();
  });

  it('toggles checked state', () => {
    const onChange = vi.fn();
    const { container } = render(() => <Switch label="Toggle me" onChange={onChange} />);

    const control = container.querySelector('.sk-switch__control') as HTMLElement;
    expect(control).toBeInTheDocument();

    fireEvent.click(control);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('renders disabled state', () => {
    const { container } = render(() => <Switch label="Disabled" disabled />);
    const switchEl = container.querySelector('.sk-switch');
    expect(switchEl).toHaveAttribute('data-disabled');
  });

  it('default size is md', () => {
    const { container } = render(() => <Switch label="Medium" />);
    const switchEl = container.querySelector('.sk-switch');
    expect(switchEl).toHaveClass('sk-switch--md');
  });

  it('applies custom class', () => {
    const { container } = render(() => <Switch label="Custom" class="custom-class" />);
    const switchEl = container.querySelector('.sk-switch');
    expect(switchEl).toHaveClass('custom-class');
  });

  it('renders small size', () => {
    const { container } = render(() => <Switch label="Small" size="sm" />);
    const switchEl = container.querySelector('.sk-switch');
    expect(switchEl).toHaveClass('sk-switch--sm');
  });

  it('unstyled removes sk-* classes', () => {
    const { container } = render(() => <Switch unstyled class="custom" label="Toggle" />);
    const switchEl = container.firstElementChild;
    expect(switchEl?.className).not.toContain('sk-');
    expect(switchEl?.className).toContain('custom');
  });
});
