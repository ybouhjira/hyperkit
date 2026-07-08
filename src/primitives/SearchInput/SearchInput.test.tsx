import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  it('renders correctly with default placeholder', () => {
    render(() => <SearchInput />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(() => <SearchInput placeholder="Find items..." />);
    expect(screen.getByPlaceholderText('Find items...')).toBeInTheDocument();
  });

  it('applies custom class name', () => {
    render(() => <SearchInput class="custom-search" />);
    const container = screen.getByRole('textbox').parentElement;
    expect(container).toHaveClass('sk-search-input');
    expect(container).toHaveClass('custom-search');
  });

  it('renders search icon', () => {
    const { container } = render(() => <SearchInput />);
    const icon = container.querySelector('.sk-search-input__icon');
    expect(icon).toBeInTheDocument();
  });

  it('displays controlled value', () => {
    render(() => <SearchInput value="test query" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('test query');
  });

  it('calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(() => <SearchInput onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.input(input, { target: { value: 'test' } });

    expect(handleChange).toHaveBeenCalledWith('test');
  });

  it('calls onSearch when Enter is pressed', () => {
    const handleSearch = vi.fn();
    render(() => <SearchInput onSearch={handleSearch} />);

    const input = screen.getByRole('textbox');
    fireEvent.input(input, { target: { value: 'query' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleSearch).toHaveBeenCalledWith('query');
  });

  it('shows clear button when value is present', () => {
    render(() => <SearchInput value="test" />);
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('hides clear button when value is empty', () => {
    render(() => <SearchInput value="" />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('clears input when clear button is clicked', () => {
    const handleChange = vi.fn();
    const handleClear = vi.fn();
    render(() => <SearchInput onChange={handleChange} onClear={handleClear} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'test' } });

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(handleClear).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith('');
    expect(input.value).toBe('');
  });

  it('displays shortcut when no value is present', () => {
    render(() => <SearchInput shortcut="⌘K" />);
    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('hides shortcut when value is present', () => {
    render(() => <SearchInput shortcut="⌘K" value="test" />);
    expect(screen.queryByText('⌘K')).not.toBeInTheDocument();
  });

  it('applies disabled state', () => {
    render(() => <SearchInput disabled />);
    const input = screen.getByRole('textbox');
    const container = input.parentElement;

    expect(input).toBeDisabled();
    expect(container).toHaveAttribute('data-disabled');
  });

  it('applies autofocus attribute', () => {
    render(() => <SearchInput autofocus />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('autofocus');
  });

  it('does not call onSearch on non-Enter key press', () => {
    const handleSearch = vi.fn();
    render(() => <SearchInput onSearch={handleSearch} />);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(handleSearch).not.toHaveBeenCalled();
  });

  it('updates internal value when typing in uncontrolled mode', () => {
    render(() => <SearchInput />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'new value' } });

    expect(input.value).toBe('new value');
  });

  it('uses controlled value over internal value', () => {
    render(() => <SearchInput value="controlled" />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('controlled');
  });

  it('unstyled removes sk-* classes', () => {
    const { container } = render(() => <SearchInput unstyled class="custom" />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).not.toContain('sk-');
    expect(wrapper?.className).toContain('custom');
  });
});
