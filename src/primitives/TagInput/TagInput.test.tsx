import { render, fireEvent, screen } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { TagInput } from './TagInput';

describe('TagInput', () => {
  it('renders with placeholder', () => {
    render(() => <TagInput placeholder="Enter tags..." />);
    const input = screen.getByPlaceholderText('Enter tags...');
    expect(input).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(() => <TagInput label="Tags" />);
    expect(screen.getByText('Tags')).toBeInTheDocument();
  });

  it('adds tag on Enter', async () => {
    const onChange = vi.fn();
    render(() => <TagInput onChange={onChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.input(input, { target: { value: 'newtag' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['newtag']);
    expect(screen.getByText('newtag')).toBeInTheDocument();
  });

  it('adds tag on comma', async () => {
    const onChange = vi.fn();
    render(() => <TagInput onChange={onChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.input(input, { target: { value: 'tag1' } });
    fireEvent.keyDown(input, { key: ',' });

    expect(onChange).toHaveBeenCalledWith(['tag1']);
    expect(screen.getByText('tag1')).toBeInTheDocument();
  });

  it('removes tag on X click', () => {
    const onChange = vi.fn();
    render(() => <TagInput defaultValue={['tag1', 'tag2']} onChange={onChange} />);

    const removeButtons = screen.getAllByRole('button', { name: /Remove/ });
    fireEvent.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith(['tag2']);
  });

  it('removes last tag on Backspace when input is empty', () => {
    const onChange = vi.fn();
    render(() => <TagInput defaultValue={['tag1', 'tag2']} onChange={onChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(onChange).toHaveBeenCalledWith(['tag1']);
  });

  it('prevents duplicates when allowDuplicates is false', () => {
    const onChange = vi.fn();
    render(() => (
      <TagInput defaultValue={['existing']} onChange={onChange} allowDuplicates={false} />
    ));
    const input = screen.getByRole('textbox');

    fireEvent.input(input, { target: { value: 'existing' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getAllByText('existing')).toHaveLength(1);
  });

  it('allows duplicates when allowDuplicates is true', () => {
    const onChange = vi.fn();
    render(() => <TagInput defaultValue={['tag']} onChange={onChange} allowDuplicates={true} />);
    const input = screen.getByRole('textbox');

    fireEvent.input(input, { target: { value: 'tag' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['tag', 'tag']);
  });

  it('respects maxTags limit', () => {
    const onChange = vi.fn();
    render(() => <TagInput defaultValue={['tag1', 'tag2']} onChange={onChange} maxTags={2} />);

    // Input should be hidden when max tags reached
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('shows suggestions', () => {
    render(() => <TagInput suggestions={['react', 'vue', 'angular']} />);
    const input = screen.getByRole('textbox');

    fireEvent.input(input, { target: { value: 're' } });
    fireEvent.focus(input);

    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('adds tag from suggestion click', () => {
    const onChange = vi.fn();
    render(() => <TagInput suggestions={['react', 'vue']} onChange={onChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.input(input, { target: { value: 're' } });
    fireEvent.focus(input);

    const suggestion = screen.getByText('react');
    fireEvent.click(suggestion);

    expect(onChange).toHaveBeenCalledWith(['react']);
  });

  it('filters suggestions based on input', () => {
    render(() => <TagInput suggestions={['react', 'vue', 'angular']} />);
    const input = screen.getByRole('textbox');

    fireEvent.input(input, { target: { value: 'ang' } });
    fireEvent.focus(input);

    expect(screen.getByText('angular')).toBeInTheDocument();
    expect(screen.queryByText('react')).not.toBeInTheDocument();
    expect(screen.queryByText('vue')).not.toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(() => <TagInput defaultValue={['tag1']} disabled />);
    const input = screen.getByRole('textbox');
    const removeButton = screen.getByRole('button', { name: /Remove/ });

    expect(input).toBeDisabled();
    expect(removeButton).toBeDisabled();
  });

  it('applies custom class', () => {
    const { container } = render(() => <TagInput class="custom-class" />);
    const tagInput = container.querySelector('.sk-tag-input');
    expect(tagInput).toHaveClass('custom-class');
  });

  it('trims whitespace from tags', () => {
    const onChange = vi.fn();
    render(() => <TagInput onChange={onChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.input(input, { target: { value: '  spaced  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['spaced']);
  });

  it('ignores empty tags', () => {
    const onChange = vi.fn();
    render(() => <TagInput onChange={onChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.input(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('works in controlled mode', () => {
    const onChange = vi.fn();
    render(() => <TagInput value={['tag1']} onChange={onChange} />);

    expect(screen.getByText('tag1')).toBeInTheDocument();

    const input = screen.getByRole('textbox');
    fireEvent.input(input, { target: { value: 'tag2' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['tag1', 'tag2']);
  });

  it('unstyled removes sk-* classes', () => {
    const { container } = render(() => <TagInput unstyled class="custom" />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).not.toContain('sk-');
  });
});
