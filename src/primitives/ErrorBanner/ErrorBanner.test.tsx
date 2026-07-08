import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBanner } from './ErrorBanner';

describe('ErrorBanner', () => {
  it('renders the error message', () => {
    render(() => <ErrorBanner message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows error variant styles by default', () => {
    render(() => <ErrorBanner message="An error occurred" />);
    const banner = screen.getByTestId('error-banner');
    expect(banner.className).toContain('sk-error-banner--error');
  });

  it('shows "Error:" label for error variant', () => {
    render(() => <ErrorBanner message="An error occurred" variant="error" />);
    expect(screen.getByText('Error:')).toBeInTheDocument();
  });

  it('shows warning variant styles', () => {
    render(() => <ErrorBanner message="A warning occurred" variant="warning" />);
    const banner = screen.getByTestId('error-banner');
    expect(banner.className).toContain('sk-error-banner--warning');
  });

  it('shows "Warning:" label for warning variant', () => {
    render(() => <ErrorBanner message="A warning occurred" variant="warning" />);
    expect(screen.getByText('Warning:')).toBeInTheDocument();
  });

  it('shows info variant styles', () => {
    render(() => <ErrorBanner message="Some info" variant="info" />);
    const banner = screen.getByTestId('error-banner');
    expect(banner.className).toContain('sk-error-banner--info');
  });

  it('shows "Info:" label for info variant', () => {
    render(() => <ErrorBanner message="Some info" variant="info" />);
    expect(screen.getByText('Info:')).toBeInTheDocument();
  });

  it('shows dismiss button when onDismiss is provided', () => {
    render(() => <ErrorBanner message="Error" onDismiss={() => {}} />);
    expect(screen.getByTestId('error-banner-close')).toBeInTheDocument();
  });

  it('hides dismiss button when onDismiss is not provided', () => {
    render(() => <ErrorBanner message="Error" />);
    expect(screen.queryByTestId('error-banner-close')).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    vi.useFakeTimers();
    const handleDismiss = vi.fn();
    render(() => <ErrorBanner message="Error" onDismiss={handleDismiss} />);
    const closeButton = screen.getByTestId('error-banner-close');
    fireEvent.click(closeButton);

    expect(handleDismiss).not.toHaveBeenCalled();

    // Fast-forward time by 300ms (animation duration)
    vi.advanceTimersByTime(300);

    expect(handleDismiss).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('applies custom class to the container', () => {
    render(() => <ErrorBanner message="Error" class="my-custom-class" />);
    const banner = screen.getByTestId('error-banner');
    expect(banner.className).toContain('my-custom-class');
  });

  it('dismiss button has aria-label for accessibility', () => {
    render(() => <ErrorBanner message="Error" onDismiss={() => {}} />);
    const closeButton = screen.getByTestId('error-banner-close');
    expect(closeButton.getAttribute('aria-label')).toBe('Dismiss');
  });

  it('shows action button when action prop is provided', () => {
    const action = { label: 'Retry', onClick: vi.fn() };
    render(() => <ErrorBanner message="Error" action={action} />);
    expect(screen.getByTestId('error-banner-action')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('hides action button when action prop is not provided', () => {
    render(() => <ErrorBanner message="Error" />);
    expect(screen.queryByTestId('error-banner-action')).not.toBeInTheDocument();
  });

  it('calls action onClick when action button is clicked', () => {
    const handleAction = vi.fn();
    const action = { label: 'Retry', onClick: handleAction };
    render(() => <ErrorBanner message="Error" action={action} />);
    const actionButton = screen.getByTestId('error-banner-action');
    fireEvent.click(actionButton);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after specified timeout', async () => {
    vi.useFakeTimers();
    const handleDismiss = vi.fn();
    render(() => <ErrorBanner message="Error" onDismiss={handleDismiss} autoDismissMs={3000} />);

    expect(handleDismiss).not.toHaveBeenCalled();

    // Fast-forward time by 3000ms (autoDismissMs) + 300ms (animation duration)
    vi.advanceTimersByTime(3300);

    expect(handleDismiss).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('does not auto-dismiss when autoDismissMs is 0', async () => {
    vi.useFakeTimers();
    const handleDismiss = vi.fn();
    render(() => <ErrorBanner message="Error" onDismiss={handleDismiss} autoDismissMs={0} />);

    vi.advanceTimersByTime(5000);

    expect(handleDismiss).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('does not auto-dismiss when autoDismissMs is undefined', async () => {
    vi.useFakeTimers();
    const handleDismiss = vi.fn();
    render(() => <ErrorBanner message="Error" onDismiss={handleDismiss} />);

    vi.advanceTimersByTime(5000);

    expect(handleDismiss).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('applies exiting class when dismiss is clicked', () => {
    render(() => <ErrorBanner message="Error" onDismiss={() => {}} />);
    const banner = screen.getByTestId('error-banner');
    const closeButton = screen.getByTestId('error-banner-close');

    expect(banner.className).not.toContain('sk-error-banner--exiting');

    fireEvent.click(closeButton);

    expect(banner.className).toContain('sk-error-banner--exiting');
  });
});
