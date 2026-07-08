import { render, fireEvent, screen } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { FileInput } from './FileInput';

describe('FileInput', () => {
  it('renders with placeholder', () => {
    const onChange = vi.fn();
    render(() => <FileInput onChange={onChange} placeholder="Upload file" />);
    expect(screen.getByText('Upload file')).toBeInTheDocument();
  });

  it('renders default placeholder', () => {
    const onChange = vi.fn();
    render(() => <FileInput onChange={onChange} />);
    expect(screen.getByText('Choose a file')).toBeInTheDocument();
  });

  it('shows hint text', () => {
    const onChange = vi.fn();
    render(() => <FileInput onChange={onChange} />);
    expect(screen.getByText('Click to browse or drag & drop')).toBeInTheDocument();
  });

  it('triggers file input on click', () => {
    const onChange = vi.fn();
    render(() => <FileInput onChange={onChange} />);
    const dropzone = screen.getByText('Choose a file').closest('.sk-file-input__dropzone');
    const input = document.querySelector('.sk-file-input__input') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.click(dropzone!);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('shows file name after selection', () => {
    const onChange = vi.fn();
    render(() => <FileInput onChange={onChange} />);

    const input = document.querySelector('.sk-file-input__input') as HTMLInputElement;
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(input);

    expect(onChange).toHaveBeenCalledWith(file);
  });

  it('shows file size', async () => {
    const onChange = vi.fn();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    render(() => <FileInput onChange={onChange} value={file} />);

    expect(screen.getByText('7 B')).toBeInTheDocument();
  });

  it('shows file type label', () => {
    const onChange = vi.fn();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    render(() => <FileInput onChange={onChange} value={file} />);

    expect(screen.getByText('TXT')).toBeInTheDocument();
  });

  it('shows IMG label for images', () => {
    const onChange = vi.fn();
    const file = new File(['content'], 'test.png', { type: 'image/png' });

    render(() => <FileInput onChange={onChange} value={file} />);

    expect(screen.getByText('IMG')).toBeInTheDocument();
  });

  it('shows PDF label for PDFs', () => {
    const onChange = vi.fn();
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    render(() => <FileInput onChange={onChange} value={file} />);

    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('remove file works in single mode', () => {
    const onChange = vi.fn();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    render(() => <FileInput onChange={onChange} value={file} mode="single" />);

    const removeButton = screen.getByLabelText('Remove test.txt');
    fireEvent.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('handles disabled state', () => {
    const onChange = vi.fn();
    render(() => <FileInput onChange={onChange} disabled />);

    const dropzone = screen.getByText('Choose a file').closest('.sk-file-input__dropzone');
    expect(dropzone?.closest('.sk-file-input')).toHaveClass('sk-file-input--disabled');
  });

  it('applies custom class', () => {
    const onChange = vi.fn();
    render(() => <FileInput onChange={onChange} class="custom-class" />);

    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('list mode shows multiple files', () => {
    const onChange = vi.fn();
    const files = [
      new File(['content1'], 'file1.txt', { type: 'text/plain' }),
      new File(['content2'], 'file2.txt', { type: 'text/plain' }),
    ];

    render(() => <FileInput onChange={onChange} value={files} mode="list" />);

    expect(screen.getByText('file1.txt')).toBeInTheDocument();
    expect(screen.getByText('file2.txt')).toBeInTheDocument();
  });

  it('list mode shows add more button', () => {
    const onChange = vi.fn();
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    render(() => <FileInput onChange={onChange} value={[file]} mode="list" />);

    expect(screen.getByText('+ Add more files')).toBeInTheDocument();
  });

  it('remove file works in list mode', () => {
    const onChange = vi.fn();
    const files = [
      new File(['content1'], 'file1.txt', { type: 'text/plain' }),
      new File(['content2'], 'file2.txt', { type: 'text/plain' }),
    ];

    render(() => <FileInput onChange={onChange} value={files} mode="list" />);

    const removeButton = screen.getByLabelText('Remove file1.txt');
    fireEvent.click(removeButton);

    expect(onChange).toHaveBeenCalledWith([files[1]]);
  });

  it('formats file size in KB', () => {
    const onChange = vi.fn();
    const content = new Array(2048).fill('a').join('');
    const file = new File([content], 'test.txt', { type: 'text/plain' });

    render(() => <FileInput onChange={onChange} value={file} />);

    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
  });

  it('formats file size in MB', () => {
    const onChange = vi.fn();
    const content = new Array(2 * 1024 * 1024).fill('a').join('');
    const file = new File([content], 'test.txt', { type: 'text/plain' });

    render(() => <FileInput onChange={onChange} value={file} />);

    expect(screen.getByText('2.0 MB')).toBeInTheDocument();
  });

  it('accepts custom accept prop', () => {
    const onChange = vi.fn();
    render(() => <FileInput onChange={onChange} accept=".pdf,application/pdf" />);

    const input = document.querySelector('.sk-file-input__input') as HTMLInputElement;
    expect(input.accept).toBe('.pdf,application/pdf');
  });

  it('handles empty file selection', () => {
    const onChange = vi.fn();
    render(() => <FileInput onChange={onChange} />);

    const input = document.querySelector('.sk-file-input__input') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [],
      writable: false,
    });

    fireEvent.change(input);

    expect(onChange).not.toHaveBeenCalled();
  });
});
