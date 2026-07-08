import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { AttachmentBar } from './AttachmentBar';
import type { FileAttachment } from './types';

const createAttachment = (overrides: Partial<FileAttachment> = {}): FileAttachment => ({
  id: 'att-1',
  file: new File(['data'], 'test.txt', { type: 'text/plain' }),
  name: 'test.txt',
  size: 100,
  type: 'text/plain',
  ...overrides,
});

describe('AttachmentBar', () => {
  it('renders nothing when attachments array is empty', () => {
    const { container } = render(() => <AttachmentBar attachments={[]} onRemove={vi.fn()} />);
    expect(container.querySelector('.sk-message-input__attachments')).not.toBeInTheDocument();
  });

  it('renders attachment previews', () => {
    const attachments = [
      createAttachment({ id: '1', name: 'file1.txt' }),
      createAttachment({ id: '2', name: 'file2.png' }),
    ];

    render(() => <AttachmentBar attachments={attachments} onRemove={vi.fn()} />);

    expect(screen.getByText('file1.txt')).toBeInTheDocument();
    expect(screen.getByText('file2.png')).toBeInTheDocument();
  });

  it('renders file chip for each attachment', () => {
    const attachments = [
      createAttachment({ id: '1', name: 'a.txt' }),
      createAttachment({ id: '2', name: 'b.txt' }),
      createAttachment({ id: '3', name: 'c.txt' }),
    ];

    const { container } = render(() => (
      <AttachmentBar attachments={attachments} onRemove={vi.fn()} />
    ));

    const chips = container.querySelectorAll('.sk-message-input__file-chip');
    expect(chips.length).toBe(3);
  });

  it('renders remove button for each attachment', () => {
    const attachments = [
      createAttachment({ id: '1', name: 'file1.txt' }),
      createAttachment({ id: '2', name: 'file2.txt' }),
    ];

    render(() => <AttachmentBar attachments={attachments} onRemove={vi.fn()} />);

    expect(screen.getByLabelText('Remove file1.txt')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove file2.txt')).toBeInTheDocument();
  });

  it('calls onRemove with attachment id when remove clicked', async () => {
    const onRemove = vi.fn();
    const attachments = [createAttachment({ id: 'att-42', name: 'photo.jpg' })];

    render(() => <AttachmentBar attachments={attachments} onRemove={onRemove} />);

    await fireEvent.click(screen.getByLabelText('Remove photo.jpg'));
    expect(onRemove).toHaveBeenCalledWith('att-42');
  });

  it('renders attachments container when there are attachments', () => {
    const attachments = [createAttachment()];
    const { container } = render(() => (
      <AttachmentBar attachments={attachments} onRemove={vi.fn()} />
    ));

    expect(container.querySelector('.sk-message-input__attachments')).toBeInTheDocument();
  });

  it('displays file name in chip', () => {
    const attachments = [createAttachment({ name: 'my-document.pdf' })];

    const { container } = render(() => (
      <AttachmentBar attachments={attachments} onRemove={vi.fn()} />
    ));

    const chipName = container.querySelector('.sk-message-input__file-chip-name');
    expect(chipName?.textContent).toBe('my-document.pdf');
  });
});
