import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, fireEvent, screen } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { AudioInput } from './AudioInput';

// Mock URL.createObjectURL and URL.revokeObjectURL
beforeAll(() => {
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  globalThis.URL.revokeObjectURL = vi.fn();
});

describe('AudioInput', () => {
  it('renders with placeholder', () => {
    const onChange = vi.fn();
    render(() => <AudioInput onChange={onChange} />);
    expect(screen.getByText('Select audio file')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    const onChange = vi.fn();
    render(() => <AudioInput onChange={onChange} placeholder="Drop audio here" />);
    expect(screen.getByText('Drop audio here')).toBeInTheDocument();
  });

  it('click triggers file input', () => {
    const onChange = vi.fn();
    render(() => <AudioInput onChange={onChange} />);

    const dropzone = screen.getByText('Select audio file').closest('.sk-audio-input__dropzone');
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const clickSpy = vi.fn();
    fileInput.click = clickSpy;

    fireEvent.click(dropzone!);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('accepts audio/* by default', () => {
    const onChange = vi.fn();
    render(() => <AudioInput onChange={onChange} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput.accept).toBe('audio/*');
  });

  it('accepts custom accept attribute', () => {
    const onChange = vi.fn();
    render(() => <AudioInput onChange={onChange} accept="audio/mp3" />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput.accept).toBe('audio/mp3');
  });

  it('applies disabled state', () => {
    const onChange = vi.fn();
    render(() => <AudioInput onChange={onChange} disabled />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput.disabled).toBe(true);

    const container = document.querySelector('.sk-audio-input');
    expect(container?.classList.contains('sk-audio-input--disabled')).toBe(true);
  });

  it('applies custom class', () => {
    const onChange = vi.fn();
    render(() => <AudioInput onChange={onChange} class="custom-class" />);

    const container = document.querySelector('.sk-audio-input');
    expect(container?.classList.contains('custom-class')).toBe(true);
  });

  it('calls onChange with file on selection', () => {
    const onChange = vi.fn();
    render(() => <AudioInput onChange={onChange} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['audio content'], 'test.mp3', { type: 'audio/mp3' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    expect(onChange).toHaveBeenCalledWith(file);
  });

  it('shows file name after selection in single mode', async () => {
    const [value, setValue] = createSignal<File | File[] | null>(null);
    const onChange = (file: File | File[] | null) => {
      setValue(file);
    };

    render(() => <AudioInput value={value()} onChange={onChange} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['audio content'], 'test.mp3', { type: 'audio/mp3' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Wait for the file name to appear
    await vi.waitFor(() => {
      expect(screen.getByText('test.mp3')).toBeInTheDocument();
    });
  });

  it('supports list mode with multiple files', () => {
    const onChange = vi.fn();
    render(() => <AudioInput onChange={onChange} mode="list" />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput.multiple).toBe(true);
  });

  it('handles multiple file selection in list mode', () => {
    const onChange = vi.fn();
    render(() => <AudioInput onChange={onChange} mode="list" />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file1 = new File(['audio 1'], 'test1.mp3', { type: 'audio/mp3' });
    const file2 = new File(['audio 2'], 'test2.mp3', { type: 'audio/mp3' });

    Object.defineProperty(fileInput, 'files', {
      value: [file1, file2],
      writable: false,
    });

    fireEvent.change(fileInput);

    expect(onChange).toHaveBeenCalledWith([file1, file2]);
  });

  it('remove button works', async () => {
    const file = new File(['audio'], 'test.mp3', { type: 'audio/mp3' });
    const onChange = vi.fn();

    render(() => <AudioInput value={file} onChange={onChange} />);

    // Wait for file to be displayed
    await vi.waitFor(() => {
      expect(screen.getByText('test.mp3')).toBeInTheDocument();
    });

    const removeButton = screen.getByText('✕');
    fireEvent.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('filters non-audio files', () => {
    const onChange = vi.fn();
    render(() => <AudioInput onChange={onChange} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const textFile = new File(['text'], 'test.txt', { type: 'text/plain' });

    Object.defineProperty(fileInput, 'files', {
      value: [textFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('filters files exceeding maxSize', () => {
    const onChange = vi.fn();
    const maxSize = 1000; // 1000 bytes
    render(() => <AudioInput onChange={onChange} maxSize={maxSize} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const largeFile = new File(['a'.repeat(2000)], 'large.mp3', { type: 'audio/mp3' });

    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('handles drag and drop', () => {
    const onChange = vi.fn();
    render(() => <AudioInput onChange={onChange} />);

    const dropzone = screen.getByText('Select audio file').closest('.sk-audio-input__dropzone')!;
    const file = new File(['audio'], 'test.mp3', { type: 'audio/mp3' });

    const dataTransfer = {
      files: [file] as any,
    };

    fireEvent.dragOver(dropzone, { dataTransfer });
    expect(document.querySelector('.sk-audio-input--dragging')).toBeInTheDocument();

    fireEvent.drop(dropzone, { dataTransfer });
    expect(onChange).toHaveBeenCalledWith(file);
  });
});
