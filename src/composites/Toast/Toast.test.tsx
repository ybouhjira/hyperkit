import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const TestConsumer = (props: { onMount: (toast: ReturnType<typeof useToast>) => void }) => {
    const toast = useToast();
    props.onMount(toast);
    return <div>Test Consumer</div>;
  };

  it('renders ToastProvider correctly', () => {
    render(() => (
      <ToastProvider>
        <div>Child Content</div>
      </ToastProvider>
    ));

    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('applies correct BEM CSS classes to container', () => {
    render(() => (
      <ToastProvider>
        <div>Content</div>
      </ToastProvider>
    ));

    // Portal renders outside the container, check document
    expect(document.querySelector('.sk-toast-container')).toBeInTheDocument();
  });

  it('applies default position class', () => {
    render(() => (
      <ToastProvider>
        <div>Content</div>
      </ToastProvider>
    ));

    expect(document.querySelector('.sk-toast-container--top-right')).toBeInTheDocument();
  });

  it('applies custom position class', () => {
    render(() => (
      <ToastProvider position="bottom-left">
        <div>Content</div>
      </ToastProvider>
    ));

    expect(document.querySelector('.sk-toast-container--bottom-left')).toBeInTheDocument();
  });

  it('applies custom class to container', () => {
    render(() => (
      <ToastProvider class="custom-class">
        <div>Content</div>
      </ToastProvider>
    ));

    expect(document.querySelector('.sk-toast-container.custom-class')).toBeInTheDocument();
  });

  it('throws error when useToast used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(() => {
        const TestComponent = () => {
          useToast();
          return <div>Test</div>;
        };
        return <TestComponent />;
      });
    }).toThrow('useToast must be used within a ToastProvider');

    consoleError.mockRestore();
  });

  it('shows toast with show method', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.show({ description: 'Test message' });
          }}
        />
      </ToastProvider>
    ));

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('shows success toast', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.success('Success message');
          }}
        />
      </ToastProvider>
    ));

    expect(screen.getByText('Success message')).toBeInTheDocument();
    const toastElement = screen.getByText('Success message').closest('.sk-toast');
    expect(toastElement).toHaveClass('sk-toast--success');
  });

  it('shows error toast', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.error('Error message');
          }}
        />
      </ToastProvider>
    ));

    expect(screen.getByText('Error message')).toBeInTheDocument();
    const toastElement = screen.getByText('Error message').closest('.sk-toast');
    expect(toastElement).toHaveClass('sk-toast--error');
  });

  it('shows info toast', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.info('Info message');
          }}
        />
      </ToastProvider>
    ));

    expect(screen.getByText('Info message')).toBeInTheDocument();
    const toastElement = screen.getByText('Info message').closest('.sk-toast');
    expect(toastElement).toHaveClass('sk-toast--info');
  });

  it('shows warning toast', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.warning('Warning message');
          }}
        />
      </ToastProvider>
    ));

    expect(screen.getByText('Warning message')).toBeInTheDocument();
    const toastElement = screen.getByText('Warning message').closest('.sk-toast');
    expect(toastElement).toHaveClass('sk-toast--warning');
  });

  it('renders toast with title', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.show({ title: 'Toast Title', description: 'Toast Description' });
          }}
        />
      </ToastProvider>
    ));

    expect(screen.getByText('Toast Title')).toBeInTheDocument();
    expect(screen.getByText('Toast Description')).toBeInTheDocument();

    const title = screen.getByText('Toast Title');
    expect(title).toHaveClass('sk-toast__title');
  });

  it('renders toast without title', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.show({ description: 'Only description' });
          }}
        />
      </ToastProvider>
    ));

    expect(screen.getByText('Only description')).toBeInTheDocument();
    expect(document.querySelector('.sk-toast__title')).not.toBeInTheDocument();
  });

  it('renders correct icon for success variant', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.success('Success');
          }}
        />
      </ToastProvider>
    ));

    const icon = document.querySelector('.sk-toast__icon .sk-icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders correct icon for error variant', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.error('Error');
          }}
        />
      </ToastProvider>
    ));

    const icon = document.querySelector('.sk-toast__icon .sk-icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.show({ description: 'Test' });
          }}
        />
      </ToastProvider>
    ));

    const closeButton = screen.getByLabelText('Close');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveClass('sk-toast__close');
  });

  it('dismisses toast when close button clicked', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.show({ description: 'Test message' });
          }}
        />
      </ToastProvider>
    ));

    expect(screen.getByText('Test message')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('auto-dismisses non-persistent toast after duration', async () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.show({ description: 'Auto dismiss', duration: 1000 });
          }}
        />
      </ToastProvider>
    ));

    expect(screen.getByText('Auto dismiss')).toBeInTheDocument();

    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument();
    });
  });

  it('does not auto-dismiss persistent toast', async () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.show({ description: 'Persistent', persistent: true, duration: 1000 });
          }}
        />
      </ToastProvider>
    ));

    expect(screen.getByText('Persistent')).toBeInTheDocument();

    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText('Persistent')).toBeInTheDocument();
    });
  });

  it('renders progress bar for non-persistent toast', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.show({ description: 'With progress' });
          }}
        />
      </ToastProvider>
    ));

    expect(document.querySelector('.sk-toast__progress')).toBeInTheDocument();
  });

  it('does not render progress bar for persistent toast', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.show({ description: 'No progress', persistent: true });
          }}
        />
      </ToastProvider>
    ));

    expect(document.querySelector('.sk-toast__progress')).not.toBeInTheDocument();
  });

  it('renders multiple toasts', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.show({ description: 'Toast 1' });
            toast.show({ description: 'Toast 2' });
            toast.show({ description: 'Toast 3' });
          }}
        />
      </ToastProvider>
    ));

    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
    expect(screen.getByText('Toast 3')).toBeInTheDocument();
  });

  it('dismisses specific toast by id', () => {
    let _toastId: string;

    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.show({ description: 'Toast 1' });
            toast.show({ description: 'Toast 2' });

            // Manually dismiss first toast (we need to access internal id)
            // This tests the dismiss functionality
          }}
        />
      </ToastProvider>
    ));

    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();

    // Click close on first toast
    const closeButtons = screen.getAllByLabelText('Close');
    fireEvent.click(closeButtons[0]);

    expect(screen.queryByText('Toast 1')).not.toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
  });

  it('applies variant-specific CSS classes', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.success('Success');
          }}
        />
      </ToastProvider>
    ));

    expect(document.querySelector('.sk-toast--success')).toBeInTheDocument();
  });

  it('uses default duration of 5000ms', async () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.show({ description: 'Default duration' });
          }}
        />
      </ToastProvider>
    ));

    expect(screen.getByText('Default duration')).toBeInTheDocument();

    vi.advanceTimersByTime(4999);
    expect(screen.getByText('Default duration')).toBeInTheDocument();

    vi.advanceTimersByTime(1);

    await waitFor(() => {
      expect(screen.queryByText('Default duration')).not.toBeInTheDocument();
    });
  });

  it('renders toast content in correct structure', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.show({ description: 'Test' });
          }}
        />
      </ToastProvider>
    ));

    expect(document.querySelector('.sk-toast__content')).toBeInTheDocument();
    expect(document.querySelector('.sk-toast__icon')).toBeInTheDocument();
    expect(document.querySelector('.sk-toast__text')).toBeInTheDocument();
    expect(document.querySelector('.sk-toast__description')).toBeInTheDocument();
  });

  it('passes title to helper methods', () => {
    render(() => (
      <ToastProvider>
        <TestConsumer
          onMount={(toast) => {
            toast.success('Message', 'Title');
          }}
        />
      </ToastProvider>
    ));

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
  });
});
