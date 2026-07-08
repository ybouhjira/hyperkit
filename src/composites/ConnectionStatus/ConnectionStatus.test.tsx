import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { ConnectionStatus } from './ConnectionStatus';

describe('ConnectionStatus', () => {
  it('shows connected state', () => {
    render(() => <ConnectionStatus state="connected" />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByTestId('connection-status')).toHaveAttribute('role', 'status');
  });

  it('shows disconnected state', () => {
    render(() => <ConnectionStatus state="disconnected" />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('shows connecting state', () => {
    render(() => <ConnectionStatus state="connecting" />);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('applies custom class', () => {
    render(() => <ConnectionStatus state="connected" class="my-class" />);
    expect(screen.getByTestId('connection-status').className).toContain('my-class');
  });

  it('has aria-live for screen readers', () => {
    render(() => <ConnectionStatus state="connected" />);
    expect(screen.getByTestId('connection-status')).toHaveAttribute('aria-live', 'polite');
  });
});
