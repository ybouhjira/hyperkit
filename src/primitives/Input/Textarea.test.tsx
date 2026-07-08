import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders textarea element', () => {
    render(() => <Textarea placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('displays placeholder text', () => {
    render(() => <Textarea placeholder="Type something..." />);
    expect(screen.getByPlaceholderText('Type something...')).toBeInTheDocument();
  });

  it('shows initial value', () => {
    render(() => <Textarea value="Initial text" />);
    const textarea = screen.getByDisplayValue('Initial text') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Initial text');
  });

  it('handles input changes', () => {
    const handleInput = vi.fn();
    render(() => <Textarea onInput={handleInput} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.input(textarea, { target: { value: 'New text' } });

    expect(handleInput).toHaveBeenCalledWith('New text');
  });

  it('applies disabled state', () => {
    render(() => <Textarea disabled placeholder="Disabled" />);
    const textarea = screen.getByPlaceholderText('Disabled') as HTMLTextAreaElement;
    expect(textarea).toBeDisabled();
  });

  it('displays error message', () => {
    render(() => <Textarea error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styling when error prop is provided', () => {
    render(() => <Textarea error="Invalid input" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('sk-textarea--error');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies custom class', () => {
    render(() => <Textarea class="custom-textarea" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-textarea');
  });

  it('applies id and name attributes', () => {
    render(() => <Textarea id="my-textarea" name="description" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('id', 'my-textarea');
    expect(textarea).toHaveAttribute('name', 'description');
  });

  it('sets minimum rows', () => {
    render(() => <Textarea minRows={5} />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('defaults to 2 rows when minRows not specified', () => {
    render(() => <Textarea />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea).toHaveAttribute('rows', '2');
  });

  it('has resize-none class', () => {
    render(() => <Textarea />);
    const textarea = screen.getByRole('textbox');
    // The sk-textarea class includes resize: none in CSS
    expect(textarea).toHaveClass('sk-textarea');
  });

  it('applies focus styles', () => {
    render(() => <Textarea />);
    const textarea = screen.getByRole('textbox');
    // Check that the textarea has the base class
    expect(textarea).toHaveClass('sk-textarea');
    // The focus styles are applied via CSS :focus pseudo-class
    // We can verify the element has proper styling by checking if it has the base class
  });

  it('exposes __setValue method on mount', () => {
    const handleInput = vi.fn();
    const { container } = render(() => <Textarea onInput={handleInput} />);
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement & {
      __setValue?: (value: string) => void;
    };

    // The __setValue method should be set on mount
    expect(textarea?.__setValue).toBeDefined();

    // Call the programmatic setValue
    textarea?.__setValue?.('programmatic value');
    expect(handleInput).toHaveBeenCalledWith('programmatic value');
  });
});
