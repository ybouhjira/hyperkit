import { render, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSignal } from 'solid-js';
import { ImageInput } from './ImageInput';

// Mock URL.createObjectURL and revokeObjectURL
beforeEach(() => {
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  globalThis.URL.revokeObjectURL = vi.fn();
});

const createMockFile = (name = 'test.png', type = 'image/png', size = 1024): File => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('ImageInput', () => {
  it('renders with placeholder', () => {
    const onChange = vi.fn();
    const { container } = render(() => <ImageInput onChange={onChange} />);

    expect(container.querySelector('.sk-image-input__placeholder')).toBeTruthy();
    expect(container.textContent).toContain('Select image');
  });

  it('renders with custom placeholder', () => {
    const onChange = vi.fn();
    const { container } = render(() => (
      <ImageInput onChange={onChange} placeholder="Choose a file" />
    ));

    expect(container.textContent).toContain('Choose a file');
  });

  it('click triggers file input', () => {
    const onChange = vi.fn();
    const { container } = render(() => <ImageInput onChange={onChange} />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click');

    const placeholder = container.querySelector('.sk-image-input__placeholder') as HTMLElement;
    fireEvent.click(placeholder);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('shows preview after file selection in single mode', () => {
    const [value, setValue] = createSignal<File | null>(null);

    const { container } = render(() => (
      <ImageInput value={value()} onChange={setValue} mode="single" />
    ));

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile();

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Value should be updated by the component
    expect(value()).toBe(file);

    // Preview should be visible
    expect(container.querySelector('.sk-image-input__preview')).toBeTruthy();
    expect(container.querySelector('.sk-image-input__preview-image')).toBeTruthy();
  });

  it('calls onChange with file', () => {
    const onChange = vi.fn();
    const { container } = render(() => <ImageInput onChange={onChange} mode="single" />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile();

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    expect(onChange).toHaveBeenCalledWith(file);
  });

  it('handles disabled state', () => {
    const onChange = vi.fn();
    const { container } = render(() => <ImageInput onChange={onChange} disabled />);

    expect(container.querySelector('.sk-image-input--disabled')).toBeTruthy();

    const placeholder = container.querySelector('.sk-image-input__placeholder') as HTMLElement;
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    expect(fileInput.disabled).toBe(true);

    const clickSpy = vi.spyOn(fileInput, 'click');
    fireEvent.click(placeholder);

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('applies custom class', () => {
    const onChange = vi.fn();
    const { container } = render(() => <ImageInput onChange={onChange} class="custom-class" />);

    expect(container.querySelector('.custom-class')).toBeTruthy();
  });

  it('handles multiple mode', () => {
    const onChange = vi.fn();
    const { container } = render(() => <ImageInput onChange={onChange} mode="multiple" />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput.multiple).toBe(true);

    const file1 = createMockFile('test1.png');
    const file2 = createMockFile('test2.png');

    Object.defineProperty(fileInput, 'files', {
      value: [file1, file2],
      writable: false,
    });

    fireEvent.change(fileInput);

    expect(onChange).toHaveBeenCalledWith([file1, file2]);
  });

  it('shows remove button in multiple mode', () => {
    const files = [createMockFile('test1.png'), createMockFile('test2.png')];
    const onChange = vi.fn();

    const { container } = render(() => (
      <ImageInput value={files} onChange={onChange} mode="multiple" />
    ));

    const removeButtons = container.querySelectorAll('.sk-image-input__remove-button');
    expect(removeButtons.length).toBe(2);
  });

  it('removes image when remove button clicked', () => {
    const files = [createMockFile('test1.png'), createMockFile('test2.png')];
    const onChange = vi.fn();

    const { container } = render(() => (
      <ImageInput value={files} onChange={onChange} mode="multiple" />
    ));

    const removeButtons = container.querySelectorAll('.sk-image-input__remove-button');
    fireEvent.click(removeButtons[0] as HTMLElement);

    expect(onChange).toHaveBeenCalledWith([files[1]]);
  });

  it('shows add button in multiple mode with value', () => {
    const files = [createMockFile('test.png')];
    const onChange = vi.fn();

    const { container } = render(() => (
      <ImageInput value={files} onChange={onChange} mode="multiple" />
    ));

    expect(container.querySelector('.sk-image-input__add-button')).toBeTruthy();
  });

  it('validates file size', () => {
    const onChange = vi.fn();
    const { container } = render(() => <ImageInput onChange={onChange} maxSize={500} />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const largeFile = createMockFile('large.png', 'image/png', 1000);

    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('validates file type', () => {
    const onChange = vi.fn();
    const { container } = render(() => <ImageInput onChange={onChange} accept="image/jpeg" />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const wrongTypeFile = createMockFile('test.png', 'image/png');

    Object.defineProperty(fileInput, 'files', {
      value: [wrongTypeFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies custom preview size', () => {
    const onChange = vi.fn();
    const { container } = render(() => <ImageInput onChange={onChange} previewSize={120} />);

    const element = container.querySelector('.sk-image-input') as HTMLElement;
    const style = element.getAttribute('style');

    expect(style).toContain('--sk-image-input-preview-size: 120px');
  });

  it('clears single image when remove clicked', () => {
    const file = createMockFile('test.png');
    const onChange = vi.fn();

    const { container } = render(() => (
      <ImageInput value={file} onChange={onChange} mode="single" />
    ));

    const removeButton = container.querySelector('.sk-image-input__remove-button') as HTMLElement;
    fireEvent.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('handles drag and drop', () => {
    const onChange = vi.fn();
    const { container } = render(() => <ImageInput onChange={onChange} />);

    const element = container.querySelector('.sk-image-input') as HTMLElement;
    const file = createMockFile();

    fireEvent.dragEnter(element, {
      dataTransfer: { files: [file] },
    });

    expect(container.querySelector('.sk-image-input--dragging')).toBeTruthy();

    fireEvent.drop(element, {
      dataTransfer: { files: [file] },
    });

    expect(onChange).toHaveBeenCalledWith(file);
    expect(container.querySelector('.sk-image-input--dragging')).toBeFalsy();
  });
});
