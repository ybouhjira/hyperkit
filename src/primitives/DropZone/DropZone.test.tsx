import { render, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { DropZone } from './DropZone';

afterEach(() => {
  vi.useRealTimers();
});

describe('DropZone', () => {
  it('renders with idle text', () => {
    const onDrop = vi.fn();
    const { getByText } = render(() => <DropZone onDrop={onDrop} />);
    expect(getByText('Drop files here or click to browse')).toBeInTheDocument();
  });

  it('renders with custom idle text', () => {
    const onDrop = vi.fn();
    const { getByText } = render(() => <DropZone onDrop={onDrop} idleText="Custom idle text" />);
    expect(getByText('Custom idle text')).toBeInTheDocument();
  });

  it('shows active text on drag over', () => {
    const onDrop = vi.fn();
    const { container, getByText } = render(() => <DropZone onDrop={onDrop} />);
    const dropzone = container.querySelector('.sk-dropzone');

    fireEvent.dragEnter(dropzone!);
    expect(getByText('Release to upload')).toBeInTheDocument();
  });

  it('shows custom active text on drag over', () => {
    const onDrop = vi.fn();
    const { container, getByText } = render(() => (
      <DropZone onDrop={onDrop} activeText="Drop it now!" />
    ));
    const dropzone = container.querySelector('.sk-dropzone');

    fireEvent.dragEnter(dropzone!);
    expect(getByText('Drop it now!')).toBeInTheDocument();
  });

  it('calls onDrop with files', () => {
    const onDrop = vi.fn();
    const { container } = render(() => <DropZone onDrop={onDrop} />);
    const dropzone = container.querySelector('.sk-dropzone');

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const dataTransfer = {
      files: [file] as unknown as FileList,
    };

    fireEvent.drop(dropzone!, { dataTransfer });
    expect(onDrop).toHaveBeenCalledWith([file]);
  });

  it('triggers file input on click', () => {
    const onDrop = vi.fn();
    const { container } = render(() => <DropZone onDrop={onDrop} />);
    const dropzone = container.querySelector('.sk-dropzone');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const clickSpy = vi.spyOn(input, 'click');
    fireEvent.click(dropzone!);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('applies disabled state', () => {
    const onDrop = vi.fn();
    const { container } = render(() => <DropZone onDrop={onDrop} disabled />);
    const dropzone = container.querySelector('.sk-dropzone');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    expect(dropzone).toHaveClass('sk-dropzone--disabled');
    expect(input.disabled).toBe(true);
    expect(dropzone?.getAttribute('aria-disabled')).toBe('true');
  });

  it('applies custom class', () => {
    const onDrop = vi.fn();
    const { container } = render(() => <DropZone onDrop={onDrop} class="custom-class" />);
    const dropzone = container.querySelector('.sk-dropzone');

    expect(dropzone).toHaveClass('custom-class');
  });

  it('renders custom children', () => {
    const onDrop = vi.fn();
    const { getByText, queryByText } = render(() => (
      <DropZone onDrop={onDrop}>
        <div>Custom content</div>
      </DropZone>
    ));

    expect(getByText('Custom content')).toBeInTheDocument();
    expect(queryByText('Drop files here or click to browse')).not.toBeInTheDocument();
  });

  it('handles multiple files', () => {
    const onDrop = vi.fn();
    const { container } = render(() => <DropZone onDrop={onDrop} multiple />);
    const dropzone = container.querySelector('.sk-dropzone');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    expect(input.multiple).toBe(true);

    const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
    const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });
    const dataTransfer = {
      files: [file1, file2] as unknown as FileList,
    };

    fireEvent.drop(dropzone!, { dataTransfer });
    expect(onDrop).toHaveBeenCalledWith([file1, file2]);
  });

  it('validates file types', () => {
    const onDrop = vi.fn();
    const { container } = render(() => <DropZone onDrop={onDrop} accept="image/*" />);
    const dropzone = container.querySelector('.sk-dropzone');

    // Invalid file type
    const txtFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [txtFile] as unknown as FileList },
    });
    expect(onDrop).not.toHaveBeenCalled();

    // Valid file type
    const imgFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [imgFile] as unknown as FileList },
    });
    expect(onDrop).toHaveBeenCalledWith([imgFile]);
  });

  it('validates file size', () => {
    const onDrop = vi.fn();
    const maxSize = 1024; // 1KB
    const { container } = render(() => <DropZone onDrop={onDrop} maxSize={maxSize} />);
    const dropzone = container.querySelector('.sk-dropzone');

    // File too large (2KB)
    const largeFile = new File(['x'.repeat(2048)], 'large.txt', { type: 'text/plain' });
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [largeFile] as unknown as FileList },
    });
    expect(onDrop).not.toHaveBeenCalled();

    // File within size limit
    const smallFile = new File(['x'.repeat(512)], 'small.txt', { type: 'text/plain' });
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [smallFile] as unknown as FileList },
    });
    expect(onDrop).toHaveBeenCalledWith([smallFile]);
  });

  it('shows error state when file validation fails', () => {
    const onDrop = vi.fn();
    const { container } = render(() => <DropZone onDrop={onDrop} accept="image/*" />);
    const dropzone = container.querySelector('.sk-dropzone');

    const txtFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [txtFile] as unknown as FileList },
    });

    expect(dropzone).toHaveClass('sk-dropzone--error');
  });

  it('does not call onDrop when disabled', () => {
    const onDrop = vi.fn();
    const { container } = render(() => <DropZone onDrop={onDrop} disabled />);
    const dropzone = container.querySelector('.sk-dropzone');

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [file] as unknown as FileList },
    });

    expect(onDrop).not.toHaveBeenCalled();
  });

  it('clears the type-validation error banner after the 3s timeout', () => {
    vi.useFakeTimers();
    const onDrop = vi.fn();
    const { container } = render(() => <DropZone onDrop={onDrop} accept="image/*" />);
    const dropzone = container.querySelector('.sk-dropzone') as HTMLElement;

    const txtFile = new File(['x'], 'bad.txt', { type: 'text/plain' });
    fireEvent.drop(dropzone, { dataTransfer: { files: [txtFile] as unknown as FileList } });
    expect(dropzone.classList.contains('sk-dropzone--error')).toBe(true);
    vi.advanceTimersByTime(3000); // the setError(null) timer fires
    expect(dropzone.classList.contains('sk-dropzone--error')).toBe(false);
  });

  it('clears the size-validation error banner after the 3s timeout', () => {
    vi.useFakeTimers();
    const onDrop = vi.fn();
    const { container } = render(() => <DropZone onDrop={onDrop} maxSize={10} />);
    const dropzone = container.querySelector('.sk-dropzone') as HTMLElement;

    const bigFile = new File(['x'.repeat(100)], 'big.txt', { type: 'text/plain' });
    fireEvent.drop(dropzone, { dataTransfer: { files: [bigFile] as unknown as FileList } });
    expect(dropzone.classList.contains('sk-dropzone--error')).toBe(true);
    vi.advanceTimersByTime(3000); // the setError(null) timer fires
    expect(dropzone.classList.contains('sk-dropzone--error')).toBe(false);
  });

  it('accepts a file by exact MIME type (non-wildcard accept pattern)', () => {
    const onDrop = vi.fn();
    const { container } = render(() => <DropZone onDrop={onDrop} accept="text/plain" />);
    const dropzone = container.querySelector('.sk-dropzone') as HTMLElement;

    const file = new File(['x'], 'note.txt', { type: 'text/plain' });
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] as unknown as FileList } });
    expect(onDrop).toHaveBeenCalledWith([file]);
  });

  it('accepts a file by extension when the MIME type does not match the pattern', () => {
    const onDrop = vi.fn();
    const { container } = render(() => <DropZone onDrop={onDrop} accept=".csv" />);
    const dropzone = container.querySelector('.sk-dropzone') as HTMLElement;

    // MIME is empty/other, but the name ends with the accepted extension.
    const file = new File(['a,b'], 'data.csv', { type: '' });
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] as unknown as FileList } });
    expect(onDrop).toHaveBeenCalledWith([file]);
  });

  it('stays active across nested dragEnter/dragLeave (counter > 1 then back to 0)', () => {
    const onDrop = vi.fn();
    const { container, getByText, queryByText } = render(() => <DropZone onDrop={onDrop} />);
    const dropzone = container.querySelector('.sk-dropzone') as HTMLElement;

    // Two enters (e.g. entering a child element) → counter 2, second enter's
    // `=== 1` arm is false.
    fireEvent.dragEnter(dropzone);
    fireEvent.dragEnter(dropzone);
    expect(getByText('Release to upload')).toBeInTheDocument();
    // One leave → counter 1 (still > 0), stays active (the `=== 0` arm is false).
    fireEvent.dragLeave(dropzone);
    expect(getByText('Release to upload')).toBeInTheDocument();
    // Final leave → counter 0, clears.
    fireEvent.dragLeave(dropzone);
    expect(queryByText('Release to upload')).not.toBeInTheDocument();
  });

  it('handles a drop with no dataTransfer (files default to null, onDrop skipped)', () => {
    const onDrop = vi.fn();
    const { container } = render(() => <DropZone onDrop={onDrop} />);
    const dropzone = container.querySelector('.sk-dropzone') as HTMLElement;

    // No dataTransfer → `e.dataTransfer?.files ?? null` resolves to null.
    fireEvent.drop(dropzone);
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('handles dragOver (prevents default) without changing state', () => {
    const onDrop = vi.fn();
    const { container, queryByText } = render(() => <DropZone onDrop={onDrop} />);
    const dropzone = container.querySelector('.sk-dropzone') as HTMLElement;

    fireEvent.dragOver(dropzone);
    // dragOver alone doesn't flip to the active text (only dragEnter does).
    expect(queryByText('Release to upload')).not.toBeInTheDocument();
  });

  it('clears the active state on dragLeave after dragEnter', () => {
    const onDrop = vi.fn();
    const { container, getByText, queryByText } = render(() => <DropZone onDrop={onDrop} />);
    const dropzone = container.querySelector('.sk-dropzone') as HTMLElement;

    fireEvent.dragEnter(dropzone);
    expect(getByText('Release to upload')).toBeInTheDocument();
    fireEvent.dragLeave(dropzone);
    expect(queryByText('Release to upload')).not.toBeInTheDocument();
  });

  it('ignores drag events while disabled (no active state, counter untouched)', () => {
    const onDrop = vi.fn();
    const { container, queryByText } = render(() => <DropZone onDrop={onDrop} disabled />);
    const dropzone = container.querySelector('.sk-dropzone') as HTMLElement;

    fireEvent.dragEnter(dropzone);
    expect(queryByText('Release to upload')).not.toBeInTheDocument();
    fireEvent.dragLeave(dropzone);
    expect(queryByText('Release to upload')).not.toBeInTheDocument();
  });

  it('selecting a file via the hidden input calls onDrop and resets the input value', () => {
    const onDrop = vi.fn();
    const { container } = render(() => <DropZone onDrop={onDrop} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['content'], 'picked.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });
    fireEvent.change(input);
    expect(onDrop).toHaveBeenCalledWith([file]);
    expect(input.value).toBe(''); // reset so re-picking the same file fires again
  });

  it('ignores a change event with no selected files', () => {
    const onDrop = vi.fn();
    const { container } = render(() => <DropZone onDrop={onDrop} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', { configurable: true, value: null });
    fireEvent.change(input);
    expect(onDrop).not.toHaveBeenCalled();
  });

  describe('disableClick', () => {
    it('without disableClick, the root is a button: role + tabIndex 0, click opens the picker', () => {
      const onDrop = vi.fn();
      const { container } = render(() => <DropZone onDrop={onDrop} />);
      const dropzone = container.querySelector('.sk-dropzone') as HTMLElement;
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      expect(dropzone.getAttribute('role')).toBe('button');
      expect(dropzone.tabIndex).toBe(0);
      expect(dropzone.classList.contains('sk-dropzone--no-click')).toBe(false);

      const clickSpy = vi.spyOn(input, 'click');
      fireEvent.click(dropzone);
      expect(clickSpy).toHaveBeenCalled();
    });

    it('with disableClick, clicking the root does NOT open the native file picker', () => {
      const onDrop = vi.fn();
      const { container } = render(() => <DropZone onDrop={onDrop} disableClick />);
      const dropzone = container.querySelector('.sk-dropzone') as HTMLElement;
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      const clickSpy = vi.spyOn(input, 'click');
      fireEvent.click(dropzone);
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('with disableClick, the root is NOT a button: no role, tabIndex -1, no-click class', () => {
      const onDrop = vi.fn();
      const { container } = render(() => <DropZone onDrop={onDrop} disableClick />);
      const dropzone = container.querySelector('.sk-dropzone') as HTMLElement;

      expect(dropzone.getAttribute('role')).toBeNull();
      expect(dropzone.tabIndex).toBe(-1);
      expect(dropzone.classList.contains('sk-dropzone--no-click')).toBe(true);
    });

    it('with disableClick, drag-and-drop STILL fires onDrop', () => {
      const onDrop = vi.fn();
      const { container } = render(() => <DropZone onDrop={onDrop} disableClick />);
      const dropzone = container.querySelector('.sk-dropzone') as HTMLElement;

      const file = new File(['content'], 'drop.txt', { type: 'text/plain' });
      fireEvent.drop(dropzone, {
        dataTransfer: { files: [file] as unknown as FileList },
      });
      expect(onDrop).toHaveBeenCalledWith([file]);
    });
  });
});
