import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { RecordButton } from './RecordButton';

describe('RecordButton', () => {
  it('renders the button', () => {
    render(() => <RecordButton />);
    expect(screen.getByTestId('record-button')).toBeInTheDocument();
  });

  it('renders the indicator dot', () => {
    render(() => <RecordButton />);
    expect(screen.getByTestId('record-button-dot')).toBeInTheDocument();
  });

  it('has aria-label "Start recording" when not recording', () => {
    render(() => <RecordButton recording={false} />);
    expect(screen.getByTestId('record-button').getAttribute('aria-label')).toBe('Start recording');
  });

  it('has aria-label "Stop recording" when recording', () => {
    render(() => <RecordButton recording={true} />);
    expect(screen.getByTestId('record-button').getAttribute('aria-label')).toBe('Stop recording');
  });

  it('has aria-pressed=false when not recording', () => {
    render(() => <RecordButton recording={false} />);
    expect(screen.getByTestId('record-button').getAttribute('aria-pressed')).toBe('false');
  });

  it('has aria-pressed=true when recording', () => {
    render(() => <RecordButton recording={true} />);
    expect(screen.getByTestId('record-button').getAttribute('aria-pressed')).toBe('true');
  });

  it('calls onToggle with true when clicked while not recording', () => {
    const onToggle = vi.fn();
    render(() => <RecordButton recording={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByTestId('record-button'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('calls onToggle with false when clicked while recording', () => {
    const onToggle = vi.fn();
    render(() => <RecordButton recording={true} onToggle={onToggle} />);
    fireEvent.click(screen.getByTestId('record-button'));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('does not call onToggle when disabled', () => {
    const onToggle = vi.fn();
    render(() => <RecordButton disabled onToggle={onToggle} />);
    fireEvent.click(screen.getByTestId('record-button'));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('applies recording class when recording', () => {
    render(() => <RecordButton recording={true} />);
    expect(screen.getByTestId('record-button')).toHaveClass('sk-record-btn--recording');
  });

  it('does not apply recording class when not recording', () => {
    render(() => <RecordButton recording={false} />);
    expect(screen.getByTestId('record-button')).not.toHaveClass('sk-record-btn--recording');
  });

  it('applies pulse animation class to dot when recording', () => {
    render(() => <RecordButton recording={true} />);
    expect(screen.getByTestId('record-button-dot')).toHaveClass('sk-record-btn__dot--pulse');
  });

  it('does not apply pulse class to dot when not recording', () => {
    render(() => <RecordButton recording={false} />);
    expect(screen.getByTestId('record-button-dot')).not.toHaveClass('sk-record-btn__dot--pulse');
  });

  it('applies sm size class', () => {
    render(() => <RecordButton size="sm" />);
    expect(screen.getByTestId('record-button')).toHaveClass('sk-record-btn--sm');
  });

  it('applies lg size class', () => {
    render(() => <RecordButton size="lg" />);
    expect(screen.getByTestId('record-button')).toHaveClass('sk-record-btn--lg');
  });

  it('is disabled when disabled prop is true', () => {
    render(() => <RecordButton disabled />);
    expect(screen.getByTestId('record-button')).toBeDisabled();
  });

  it('applies custom class', () => {
    render(() => <RecordButton class="my-record" />);
    expect(screen.getByTestId('record-button')).toHaveClass('my-record');
  });
});
