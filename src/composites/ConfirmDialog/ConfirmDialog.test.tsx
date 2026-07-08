import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders with title and content when open', () => {
    render(() => (
      <ConfirmDialog open={true} onClose={() => {}} onConfirm={() => {}}>
        <div>Are you sure you want to proceed?</div>
      </ConfirmDialog>
    ));
    expect(screen.getByRole('heading', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(() => (
      <ConfirmDialog open={true} onClose={() => {}} onConfirm={onConfirm}>
        <div>Content</div>
      </ConfirmDialog>
    ));
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button clicked', () => {
    const onClose = vi.fn();
    render(() => (
      <ConfirmDialog open={true} onClose={onClose} onConfirm={() => {}}>
        <div>Content</div>
      </ConfirmDialog>
    ));
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('danger variant shows danger button and correct title', () => {
    render(() => (
      <ConfirmDialog open={true} onClose={() => {}} onConfirm={() => {}} variant="danger">
        <div>Content</div>
      </ConfirmDialog>
    ));
    expect(screen.getByRole('heading', { name: 'Are you sure?' })).toBeInTheDocument();
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmButton.classList.contains('sk-btn--danger')).toBe(true);
  });

  it('custom button labels', () => {
    render(() => (
      <ConfirmDialog
        open={true}
        onClose={() => {}}
        onConfirm={() => {}}
        confirmLabel="Delete"
        cancelLabel="Keep"
      >
        <div>Content</div>
      </ConfirmDialog>
    ));
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('loading state disables confirm button', () => {
    render(() => (
      <ConfirmDialog open={true} onClose={() => {}} onConfirm={() => {}} loading={true}>
        <div>Content</div>
      </ConfirmDialog>
    ));
    const confirmButton = screen.getByRole('button', { name: 'Confirm' }) as HTMLButtonElement;
    const cancelButton = screen.getByRole('button', { name: 'Cancel' }) as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);
    expect(cancelButton.disabled).toBe(true);
  });

  it('uses custom title when provided', () => {
    render(() => (
      <ConfirmDialog open={true} onClose={() => {}} onConfirm={() => {}} title="Custom Title">
        <div>Content</div>
      </ConfirmDialog>
    ));
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });
});
