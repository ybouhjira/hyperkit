import { render, screen } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { Popover } from './Popover';
import { settleLazy } from '../../__fixtures__/settleLazy';

// Warm the lazy client chunk once per file with a generous budget —
// under full-suite load the cold transform can exceed the per-test timeout.
beforeAll(async () => {
  await import('./Popover.client');
}, 30_000);

describe('Popover', () => {
  it('renders the trigger element', async () => {
    render(() => <Popover trigger={<button>Open</button>} content={<div>Content</div>} />);
    await settleLazy();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('content is not visible initially', async () => {
    render(() => (
      <Popover
        trigger={<button>Open</button>}
        content={<div data-testid="pop-content">Content</div>}
      />
    ));
    await settleLazy();
    expect(screen.queryByTestId('pop-content')).not.toBeInTheDocument();
  });

  it('opens content when trigger is clicked', async () => {
    render(() => (
      <Popover
        trigger={<button>Open</button>}
        content={<div data-testid="pop-content">Popover Content</div>}
      />
    ));
    await settleLazy();
    fireEvent.click(screen.getByTestId('popover-trigger'));
    await vi.waitFor(() => {
      expect(screen.getByTestId('pop-content')).toBeInTheDocument();
    });
  });

  it('fires onOpenChange when trigger is clicked', async () => {
    const onOpenChange = vi.fn();
    render(() => (
      <Popover
        trigger={<button>Open</button>}
        content={<div>Content</div>}
        onOpenChange={onOpenChange}
      />
    ));
    await settleLazy();
    fireEvent.click(screen.getByTestId('popover-trigger'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('renders with controlled open state', async () => {
    render(() => (
      <Popover
        trigger={<button>Open</button>}
        content={<div data-testid="pop-content">Content</div>}
        open={true}
        onOpenChange={() => undefined}
      />
    ));
    await vi.waitFor(() => {
      expect(screen.getByTestId('pop-content')).toBeInTheDocument();
    });
  });

  it('applies custom class to content', async () => {
    render(() => (
      <Popover
        trigger={<button>Open</button>}
        content={<div>Content</div>}
        class="my-popover"
        open={true}
        onOpenChange={() => undefined}
      />
    ));
    await vi.waitFor(() => {
      expect(screen.getByTestId('popover-content')).toHaveClass('my-popover');
    });
  });
});
