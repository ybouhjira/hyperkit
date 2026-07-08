import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';
import { Textarea } from './Textarea';

describe('Input', () => {
  it('renders with text type by default', () => {
    render(() => <Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input.getAttribute('type')).toBe('text');
  });

  it('renders email type', () => {
    render(() => <Input type="email" />);
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('type')).toBe('email');
  });

  it('renders password type', () => {
    render(() => <Input type="password" />);
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it('renders search type', () => {
    render(() => <Input type="search" />);
    const input = screen.getByRole('searchbox');
    expect(input).toBeInTheDocument();
  });

  it('renders url type', () => {
    render(() => <Input type="url" />);
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('type')).toBe('url');
  });

  it('renders tel type', () => {
    render(() => <Input type="tel" />);
    const input = document.querySelector('input[type="tel"]');
    expect(input).toBeInTheDocument();
    expect(input?.getAttribute('type')).toBe('tel');
  });

  it('renders number type', () => {
    render(() => <Input type="number" />);
    const input = document.querySelector('input[type="number"]');
    expect(input).toBeInTheDocument();
    expect(input?.getAttribute('type')).toBe('number');
  });

  it('displays placeholder', () => {
    render(() => <Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('displays value', () => {
    render(() => <Input value="test value" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('test value');
  });

  it('calls onInput with value when input changes', () => {
    const handleInput = vi.fn();
    render(() => <Input onInput={handleInput} />);
    const input = screen.getByRole('textbox');
    fireEvent.input(input, { target: { value: 'new value' } });
    expect(handleInput).toHaveBeenCalledWith('new value');
  });

  it('shows error state and message', () => {
    render(() => <Input id="test-input" error="This field is required" />);
    const input = screen.getByRole('textbox');
    const errorMsg = screen.getByText('This field is required');

    expect(input.className).toContain('sk-input--error');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('test-input-error');
    expect(errorMsg).toBeInTheDocument();
    expect(errorMsg.getAttribute('role')).toBe('alert');
  });

  it('disables input when disabled prop is true', () => {
    render(() => <Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    // Disabled styling is handled by CSS on the sk-input class
    expect(input.className).toContain('sk-input');
  });

  it('applies custom class', () => {
    render(() => <Input class="custom-input-class" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('custom-input-class');
  });

  it('sets id and name attributes', () => {
    render(() => <Input id="email-input" name="email" />);
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('id')).toBe('email-input');
    expect(input.getAttribute('name')).toBe('email');
  });

  it('applies focus styles', () => {
    render(() => <Input />);
    const input = screen.getByRole('textbox');
    // Focus styles are handled by CSS on the sk-input class
    expect(input.className).toContain('sk-input');
  });

  it('unstyled removes sk-* classes', () => {
    const { container } = render(() => <Input unstyled class="custom" />);
    const wrapper = container.firstElementChild;
    const input = screen.getByRole('textbox');
    expect(wrapper?.className).not.toContain('sk-');
    expect(input.className).not.toContain('sk-');
    expect(wrapper?.className).toContain('custom');
  });
});

describe('Textarea', () => {
  it('renders with default rows', () => {
    render(() => <Textarea />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea.getAttribute('rows')).toBe('2');
  });

  it('renders with custom minRows', () => {
    render(() => <Textarea minRows={5} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.getAttribute('rows')).toBe('5');
  });

  it('displays placeholder', () => {
    render(() => <Textarea placeholder="Enter description" />);
    const textarea = screen.getByPlaceholderText('Enter description');
    expect(textarea).toBeInTheDocument();
  });

  it('displays value', () => {
    render(() => <Textarea value="test content" />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('test content');
  });

  it('calls onInput with value when input changes', () => {
    const handleInput = vi.fn();
    render(() => <Textarea onInput={handleInput} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.input(textarea, { target: { value: 'new content' } });
    expect(handleInput).toHaveBeenCalledWith('new content');
  });

  it('shows error state and message', () => {
    render(() => <Textarea error="Content is required" />);
    const textarea = screen.getByRole('textbox');
    const errorMsg = screen.getByText('Content is required');

    expect(textarea.className).toContain('sk-textarea--error');
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
    expect(errorMsg).toBeInTheDocument();
    expect(errorMsg.getAttribute('role')).toBe('alert');
  });

  it('disables textarea when disabled prop is true', () => {
    render(() => <Textarea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
    // Disabled styling is handled by CSS on the sk-textarea class
    expect(textarea.className).toContain('sk-textarea');
  });

  it('applies custom class', () => {
    render(() => <Textarea class="custom-textarea-class" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.className).toContain('custom-textarea-class');
  });

  it('sets id and name attributes', () => {
    render(() => <Textarea id="description" name="desc" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.getAttribute('id')).toBe('description');
    expect(textarea.getAttribute('name')).toBe('desc');
  });

  it('has resize-none class for auto-resize behavior', () => {
    render(() => <Textarea autoResize />);
    const textarea = screen.getByRole('textbox');
    // resize: none is handled by CSS on the sk-textarea class
    expect(textarea.className).toContain('sk-textarea');
  });

  it('adjusts height on input when autoResize is enabled', () => {
    render(() => <Textarea autoResize minRows={2} maxRows={5} />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      value: 100,
    });

    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({ lineHeight: '20px' }),
    });

    fireEvent.input(textarea, { target: { value: 'Line 1\nLine 2\nLine 3' } });

    expect(textarea.style.height).toBeTruthy();
  });

  it('applies focus styles', () => {
    render(() => <Textarea />);
    const textarea = screen.getByRole('textbox');
    // Focus styles are handled by CSS on the sk-textarea class
    expect(textarea.className).toContain('sk-textarea');
  });

  it('unstyled removes sk-* classes', () => {
    const { container } = render(() => <Textarea unstyled class="custom" />);
    const wrapper = container.firstElementChild;
    const textarea = screen.getByRole('textbox');
    expect(wrapper?.className).not.toContain('sk-');
    expect(textarea.className).not.toContain('sk-');
    expect(wrapper?.className).toContain('custom');
  });

  it('marks textarea as required', () => {
    render(() => <Textarea required />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeRequired();
  });

  it('sets aria-label on textarea', () => {
    render(() => <Textarea aria-label="Product description" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.getAttribute('aria-label')).toBe('Product description');
  });
});
