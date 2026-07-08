import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('renders title when open', () => {
    render(() => (
      <Dialog open={true} onOpenChange={() => {}} title="Test Dialog">
        <p>Dialog content</p>
      </Dialog>
    ));
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(() => (
      <Dialog open={true} onOpenChange={() => {}} title="Title" description="A description">
        <p>Content</p>
      </Dialog>
    ));
    expect(screen.getByText('A description')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(() => (
      <Dialog open={true} onOpenChange={() => {}} title="Title">
        <p>Body text</p>
      </Dialog>
    ));
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(() => (
      <Dialog open={false} onOpenChange={() => {}} title="Hidden">
        <p>Should not show</p>
      </Dialog>
    ));
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('calls onOpenChange on close button click', () => {
    const handler = vi.fn();
    render(() => (
      <Dialog open={true} onOpenChange={handler} title="Title">
        <p>Content</p>
      </Dialog>
    ));
    const closeBtn = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(closeBtn);
    expect(handler).toHaveBeenCalledWith(false);
  });

  it('applies custom class', () => {
    render(() => (
      <Dialog open={true} onOpenChange={() => {}} title="Title" class="custom-class">
        <p>Content</p>
      </Dialog>
    ));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('custom-class');
  });

  it('unstyled removes sk-* classes', () => {
    const handleOpenChange = vi.fn();
    render(() => (
      <Dialog open={true} onOpenChange={handleOpenChange} title="Dialog" unstyled class="custom">
        Content
      </Dialog>
    ));
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).not.toContain('sk-');
    expect(dialog.className).toContain('custom');
  });
});
