import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModeSwitcher } from './ModeSwitcher';
import { KeyboardProvider } from '../../keyboard';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Helper to render with KeyboardProvider
function renderWithProvider(ui: () => import('solid-js').JSX.Element) {
  return render(() => <KeyboardProvider>{ui()}</KeyboardProvider>);
}

describe('ModeSwitcher', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders correctly', () => {
    renderWithProvider(() => <ModeSwitcher />);
    expect(screen.getByRole('button', { name: 'Switch UI mode' })).toBeInTheDocument();
  });

  it('applies correct BEM CSS classes', () => {
    const { container } = renderWithProvider(() => <ModeSwitcher />);
    expect(container.querySelector('.sk-mode-switcher')).toBeInTheDocument();
    expect(container.querySelector('.sk-mode-switcher__trigger')).toBeInTheDocument();
  });

  it('displays default mode (Developer)', () => {
    const { container } = renderWithProvider(() => <ModeSwitcher />);
    const trigger = container.querySelector('.sk-mode-switcher__trigger');
    expect(trigger?.textContent).toContain('Developer');
  });

  it('opens dropdown when trigger clicked', async () => {
    renderWithProvider(() => <ModeSwitcher />);
    const trigger = screen.getByRole('button', { name: 'Switch UI mode' });

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Full UI with all features and tooling')).toBeInTheDocument();
    });
  });

  it('applies custom class', () => {
    const { container } = renderWithProvider(() => <ModeSwitcher class="custom-class" />);
    expect(container.querySelector('.sk-mode-switcher.custom-class')).toBeInTheDocument();
  });

  it('persists mode to localStorage', async () => {
    renderWithProvider(() => <ModeSwitcher />);
    const trigger = screen.getByRole('button', { name: 'Switch UI mode' });

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Gamepad-optimized interface for TV displays')).toBeInTheDocument();
    });

    const tvOption = screen
      .getByText('Gamepad-optimized interface for TV displays')
      .closest('button')!;
    fireEvent.click(tvOption);

    await waitFor(() => {
      expect(localStorageMock.getItem('hyperkit-ui-mode')).toBe('tv');
    });
  });

  it('loads mode from localStorage on mount', () => {
    localStorageMock.setItem('hyperkit-ui-mode', 'focus');

    const { container } = renderWithProvider(() => <ModeSwitcher />);
    const trigger = container.querySelector('.sk-mode-switcher__trigger');

    expect(trigger?.textContent).toContain('Focus');
  });

  it('uses default class when no custom class provided', () => {
    const { container } = renderWithProvider(() => <ModeSwitcher />);
    const el = container.querySelector('.sk-mode-switcher');
    expect(el).toBeInTheDocument();
    expect(el?.className).toBe('sk-mode-switcher');
  });

  it('closes dropdown when trigger clicked again', async () => {
    const { container } = renderWithProvider(() => <ModeSwitcher />);
    const trigger = screen.getByRole('button', { name: 'Switch UI mode' });

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(container.querySelector('.sk-mode-switcher__dropdown')).toBeInTheDocument();
    });

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(container.querySelector('.sk-mode-switcher__dropdown')).not.toBeInTheDocument();
    });
  });

  it('closes dropdown on outside click', async () => {
    const { container } = renderWithProvider(() => <ModeSwitcher />);
    const trigger = screen.getByRole('button', { name: 'Switch UI mode' });

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(container.querySelector('.sk-mode-switcher__dropdown')).toBeInTheDocument();
    });

    fireEvent.click(document.body);
    await waitFor(() => {
      expect(container.querySelector('.sk-mode-switcher__dropdown')).not.toBeInTheDocument();
    });
  });

  it('shows exit hint when distraction-free mode selected via click', async () => {
    const { container } = renderWithProvider(() => <ModeSwitcher />);
    const trigger = screen.getByRole('button', { name: 'Switch UI mode' });

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByText('Hide everything except chat content')).toBeInTheDocument();
    });

    const dfOption = screen.getByText('Hide everything except chat content').closest('button')!;
    fireEvent.click(dfOption);

    await waitFor(() => {
      expect(container.querySelector('.sk-mode-switcher__exit-hint')).toBeInTheDocument();
    });
  });

  it('auto-hides exit hint after 3 seconds', async () => {
    const { container } = renderWithProvider(() => <ModeSwitcher />);
    const trigger = screen.getByRole('button', { name: 'Switch UI mode' });

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByText('Hide everything except chat content')).toBeInTheDocument();
    });

    const dfOption = screen.getByText('Hide everything except chat content').closest('button')!;
    fireEvent.click(dfOption);

    await waitFor(() => {
      expect(container.querySelector('.sk-mode-switcher__exit-hint')).toBeInTheDocument();
    });

    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(container.querySelector('.sk-mode-switcher__exit-hint')).not.toBeInTheDocument();
    });
  });

  it('highlights active mode option in dropdown', async () => {
    const { container } = renderWithProvider(() => <ModeSwitcher />);
    const trigger = screen.getByRole('button', { name: 'Switch UI mode' });

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(container.querySelector('.sk-mode-switcher__dropdown')).toBeInTheDocument();
    });

    const activeOption = container.querySelector('.sk-mode-switcher__option--active');
    expect(activeOption).toBeInTheDocument();
    expect(activeOption?.textContent).toContain('Developer');
  });

  it('shows shortcut hints for first three modes', async () => {
    const { container } = renderWithProvider(() => <ModeSwitcher />);
    const trigger = screen.getByRole('button', { name: 'Switch UI mode' });

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(container.querySelector('.sk-mode-switcher__dropdown')).toBeInTheDocument();
    });

    const shortcuts = container.querySelectorAll('.sk-mode-switcher__option-shortcut');
    // 3 for first modes (1,2,3) + 1 for distraction-free = 4
    expect(shortcuts.length).toBe(4);
  });

  it('closes dropdown when a mode is selected', async () => {
    const { container } = renderWithProvider(() => <ModeSwitcher />);
    const trigger = screen.getByRole('button', { name: 'Switch UI mode' });

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(container.querySelector('.sk-mode-switcher__dropdown')).toBeInTheDocument();
    });

    const focusOption = screen.getByText('Minimal UI for distraction-free work').closest('button')!;
    fireEvent.click(focusOption);

    await waitFor(() => {
      expect(container.querySelector('.sk-mode-switcher__dropdown')).not.toBeInTheDocument();
    });
  });

  it('does not show exit hint for non-distraction-free modes', async () => {
    const { container } = renderWithProvider(() => <ModeSwitcher />);
    const trigger = screen.getByRole('button', { name: 'Switch UI mode' });

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByText('Minimal UI for distraction-free work')).toBeInTheDocument();
    });

    const focusOption = screen.getByText('Minimal UI for distraction-free work').closest('button')!;
    fireEvent.click(focusOption);

    await waitFor(() => {
      expect(container.querySelector('.sk-mode-switcher__exit-hint')).not.toBeInTheDocument();
    });
  });

  it('clears previous timeout when entering distraction-free mode again', async () => {
    const { container } = renderWithProvider(() => <ModeSwitcher />);
    const trigger = screen.getByRole('button', { name: 'Switch UI mode' });

    // First: select distraction-free
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByText('Hide everything except chat content')).toBeInTheDocument();
    });
    const dfOption = screen.getByText('Hide everything except chat content').closest('button')!;
    fireEvent.click(dfOption);
    await waitFor(() => {
      expect(container.querySelector('.sk-mode-switcher__exit-hint')).toBeInTheDocument();
    });

    // Wait 1.5s then re-trigger via dropdown again
    vi.advanceTimersByTime(1500);

    // Switch away then back to distraction-free
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(container.querySelector('.sk-mode-switcher__dropdown')).toBeInTheDocument();
    });
    const devOption = screen.getByText('Full UI with all features and tooling').closest('button')!;
    fireEvent.click(devOption);

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(container.querySelector('.sk-mode-switcher__dropdown')).toBeInTheDocument();
    });
    const dfOption2 = screen.getByText('Hide everything except chat content').closest('button')!;
    fireEvent.click(dfOption2);

    // Original timeout from 1.5s ago should have been cleared
    // New timeout starts fresh for 3s
    vi.advanceTimersByTime(2000);
    expect(container.querySelector('.sk-mode-switcher__exit-hint')).toBeInTheDocument();

    vi.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(container.querySelector('.sk-mode-switcher__exit-hint')).not.toBeInTheDocument();
    });
  });
});
