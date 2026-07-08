import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { MarkdownToolbar } from './MarkdownToolbar';

describe('MarkdownToolbar', () => {
  it('renders all formatting buttons', () => {
    render(() => (
      <MarkdownToolbar onBold={vi.fn()} onItalic={vi.fn()} onCode={vi.fn()} onLink={vi.fn()} />
    ));

    expect(screen.getByLabelText('Bold')).toBeInTheDocument();
    expect(screen.getByLabelText('Italic')).toBeInTheDocument();
    expect(screen.getByLabelText('Inline code')).toBeInTheDocument();
    expect(screen.getByLabelText('Insert link')).toBeInTheDocument();
  });

  it('calls onBold when bold button clicked', async () => {
    const onBold = vi.fn();
    render(() => (
      <MarkdownToolbar onBold={onBold} onItalic={vi.fn()} onCode={vi.fn()} onLink={vi.fn()} />
    ));

    await fireEvent.click(screen.getByLabelText('Bold'));
    expect(onBold).toHaveBeenCalledTimes(1);
  });

  it('calls onItalic when italic button clicked', async () => {
    const onItalic = vi.fn();
    render(() => (
      <MarkdownToolbar onBold={vi.fn()} onItalic={onItalic} onCode={vi.fn()} onLink={vi.fn()} />
    ));

    await fireEvent.click(screen.getByLabelText('Italic'));
    expect(onItalic).toHaveBeenCalledTimes(1);
  });

  it('calls onCode when code button clicked', async () => {
    const onCode = vi.fn();
    render(() => (
      <MarkdownToolbar onBold={vi.fn()} onItalic={vi.fn()} onCode={onCode} onLink={vi.fn()} />
    ));

    await fireEvent.click(screen.getByLabelText('Inline code'));
    expect(onCode).toHaveBeenCalledTimes(1);
  });

  it('calls onLink when link button clicked', async () => {
    const onLink = vi.fn();
    render(() => (
      <MarkdownToolbar onBold={vi.fn()} onItalic={vi.fn()} onCode={vi.fn()} onLink={onLink} />
    ));

    await fireEvent.click(screen.getByLabelText('Insert link'));
    expect(onLink).toHaveBeenCalledTimes(1);
  });

  it('disables all buttons when disabled', () => {
    render(() => (
      <MarkdownToolbar
        disabled
        onBold={vi.fn()}
        onItalic={vi.fn()}
        onCode={vi.fn()}
        onLink={vi.fn()}
      />
    ));

    expect(screen.getByLabelText('Bold')).toBeDisabled();
    expect(screen.getByLabelText('Italic')).toBeDisabled();
    expect(screen.getByLabelText('Inline code')).toBeDisabled();
    expect(screen.getByLabelText('Insert link')).toBeDisabled();
  });

  it('buttons are enabled by default', () => {
    render(() => (
      <MarkdownToolbar onBold={vi.fn()} onItalic={vi.fn()} onCode={vi.fn()} onLink={vi.fn()} />
    ));

    expect(screen.getByLabelText('Bold')).not.toBeDisabled();
    expect(screen.getByLabelText('Italic')).not.toBeDisabled();
    expect(screen.getByLabelText('Inline code')).not.toBeDisabled();
    expect(screen.getByLabelText('Insert link')).not.toBeDisabled();
  });

  it('renders buttons as type="button"', () => {
    render(() => (
      <MarkdownToolbar onBold={vi.fn()} onItalic={vi.fn()} onCode={vi.fn()} onLink={vi.fn()} />
    ));

    expect(screen.getByLabelText('Bold')).toHaveAttribute('type', 'button');
    expect(screen.getByLabelText('Italic')).toHaveAttribute('type', 'button');
    expect(screen.getByLabelText('Inline code')).toHaveAttribute('type', 'button');
    expect(screen.getByLabelText('Insert link')).toHaveAttribute('type', 'button');
  });
});
